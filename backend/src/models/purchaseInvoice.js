const db = require("../config/db");
const Product = require("./product");

const PurchaseInvoice = {
  // Tạo hóa đơn nhập hàng (hỗ trợ cả tạo sản phẩm mới)
  create: async (data) => {
    const {
      invoice_number,
      supplier_id,
      invoice_date,
      items,
      notes,
      created_by,
    } = data;
    // items có 2 dạng:
    // 1. Sản phẩm đã tồn tại: {product_id, quantity, unit_cost}
    // 2. Sản phẩm mới: {name, description, price, category_id, brand, size, color, quantity, unit_cost, image_url?, discount_price?}

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      let total_cost = 0;
      const processedItems = [];

      // Xử lý từng item: tạo mới sản phẩm nếu chưa có
      for (const item of items) {
        let productId = item.product_id;

        // Trường hợp 2: Tạo sản phẩm mới
        if (!productId && item.name) {
          const [productResult] = await connection.execute(
            `INSERT INTO products 
             (name, description, price, category_id, stock_quantity, image_url, discount_price, brand, size, color) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.name,
              item.description || null,
              item.price || item.unit_cost, // Giá bán = giá nhập (có thể điều chỉnh)
              item.category_id,
              0, // Tồn kho ban đầu = 0, sẽ cập nhật sau
              item.image_url || null,
              item.discount_price || null,
              item.brand || null,
              item.size ? String(item.size) : null,
              item.color || null,
            ]
          );
          productId = productResult.insertId;
        }

        // Trường hợp 1: Kiểm tra sản phẩm có tồn tại
        if (productId) {
          const [productRows] = await connection.execute(
            "SELECT id, name, size FROM products WHERE id = ?",
            [productId]
          );
          if (!productRows.length) {
            throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
          }

          const product = productRows[0];
          const size_eu = product.size ? String(product.size) : (item.size ? String(item.size) : null);

          processedItems.push({
            product_id: productId,
            size_eu,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.quantity * item.unit_cost,
          });

          total_cost += item.quantity * item.unit_cost;
        } else {
          throw new Error("Mỗi item phải có product_id HOẶC thông tin sản phẩm mới (name, price, category_id)");
        }
      }

      // Tạo hóa đơn
      const [invoiceResult] = await connection.execute(
        `INSERT INTO purchase_invoices 
         (invoice_number, supplier_id, total_cost, invoice_date, notes, created_by) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          invoice_number,
          supplier_id,
          total_cost,
          invoice_date,
          notes || null,
          created_by || null,
        ]
      );
      const invoiceId = invoiceResult.insertId;

      // Thêm chi tiết hóa đơn và cập nhật tồn kho
      for (const item of processedItems) {
        // Thêm vào purchase_invoice_items
        await connection.execute(
          `INSERT INTO purchase_invoice_items 
           (purchase_invoice_id, product_id, size_eu, quantity, unit_cost, total_cost) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            invoiceId,
            item.product_id,
            item.size_eu,
            item.quantity,
            item.unit_cost,
            item.total_cost,
          ]
        );

        // Cập nhật tồn kho của product
        await connection.execute(
          "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      return { id: invoiceId, total_cost, products_created: processedItems.length };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Lấy tất cả hóa đơn nhập
  getAll: async (limit, offset) => {
    const limitInt = parseInt(limit) || 10;
    const offsetInt = parseInt(offset) || 0;
    
    const [rows] = await db.query(
      `SELECT pi.*, s.name as supplier_name 
       FROM purchase_invoices pi 
       LEFT JOIN suppliers s ON pi.supplier_id = s.id 
       ORDER BY pi.invoice_date DESC, pi.created_at DESC 
       LIMIT ${limitInt} OFFSET ${offsetInt}`
    );
    return rows;
  },

  // Lấy tổng số hóa đơn
  getTotal: async () => {
    const [rows] = await db.execute(
      "SELECT COUNT(*) as total FROM purchase_invoices"
    );
    return rows[0].total;
  },

  // Lấy hóa đơn theo ID
  getById: async (id) => {
    const [rows] = await db.execute(
      `SELECT pi.*, s.name as supplier_name, s.contact_person, s.phone, s.email, s.address 
       FROM purchase_invoices pi 
       LEFT JOIN suppliers s ON pi.supplier_id = s.id 
       WHERE pi.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Lấy chi tiết hóa đơn nhập
  getItems: async (invoiceId, connection = null) => {
    const dbConnection = connection || db;
    const [rows] = await dbConnection.execute(
      `SELECT pii.*, p.name as product_name, p.brand, p.image_url 
       FROM purchase_invoice_items pii 
       LEFT JOIN products p ON pii.product_id = p.id 
       WHERE pii.purchase_invoice_id = ?`,
      [invoiceId]
    );
    return rows;
  },

  // Xóa hóa đơn (và hoàn trả tồn kho)
  delete: async (id) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Lấy chi tiết hóa đơn
      const items = await PurchaseInvoice.getItems(id, connection);

      // Hoàn trả tồn kho
      for (const item of items) {
        await connection.execute(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      }

      // Xóa hóa đơn (cascade sẽ xóa items)
      const [result] = await connection.execute(
        "DELETE FROM purchase_invoices WHERE id = ?",
        [id]
      );

      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = PurchaseInvoice;