const db = require("../config/db");
const ProductSize = require("./productSize");

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
    // 1. Sản phẩm đã tồn tại: {product_id, quantity, unit_cost, size?, color?}
    // 2. Sản phẩm mới: {name, description, price, category_id, brand, size, color, quantity, unit_cost, image_url?, discount_price?}

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      let total_cost = 0;
      const processedItems = [];
      
      // Nhóm các items theo tên sản phẩm + màu sắc để tạo 1 sản phẩm cho mỗi màu
      const productGroups = new Map();
      
      for (const item of items) {
        if (item.product_id) {
          // Sản phẩm đã tồn tại - xử lý trực tiếp
          const [productRows] = await connection.execute(
            "SELECT id, name, size FROM products WHERE id = ?",
            [item.product_id]
          );
          if (!productRows.length) {
            throw new Error(`Không tìm thấy sản phẩm với ID: ${item.product_id}`);
          }

          const product = productRows[0];
          const size_eu = item.size ? String(item.size) : (product.size ? String(product.size) : null);

          processedItems.push({
            product_id: item.product_id,
            size_eu,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.quantity * item.unit_cost,
          });

          total_cost += item.quantity * item.unit_cost;
        } else if (item.name) {
          // Sản phẩm mới - nhóm theo tên + màu + hình ảnh
          const groupKey = `${item.name}|${item.color || ''}|${item.image_url || ''}`;
          
          if (!productGroups.has(groupKey)) {
            productGroups.set(groupKey, {
              name: item.name,
              description: item.description || null,
              price: item.price || item.unit_cost,
              category_id: item.category_id,
              image_url: item.image_url || null,
              discount_price: item.discount_price || null,
              brand: item.brand || null,
              color: item.color || null,
              sizes: [] // Danh sách các size với quantity và unit_cost
            });
          }
          
          productGroups.get(groupKey).sizes.push({
            size: item.size ? String(item.size) : null,
            quantity: item.quantity,
            unit_cost: item.unit_cost
          });
        }
      }
      
      // Tạo sản phẩm mới cho mỗi nhóm (mỗi màu = 1 sản phẩm)
      for (const productData of productGroups.values()) {
        // Gộp tất cả sizes thành chuỗi (VD: "36, 37, 38, 39, 40")
        const allSizes = productData.sizes
          .map(s => s.size)
          .filter(s => s !== null && s !== '')
          .join(', ');
        
        // Tạo sản phẩm mới
        const [productResult] = await connection.execute(
          `INSERT INTO products 
           (name, description, price, category_id, stock_quantity, image_url, discount_price, brand, size, color) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productData.name,
            productData.description,
            productData.price,
            productData.category_id,
            0, // Tồn kho ban đầu = 0, sẽ cập nhật sau
            productData.image_url,
            productData.discount_price,
            productData.brand,
            // Lưu tất cả sizes dạng chuỗi
            allSizes || null,
            productData.color,
          ]
        );
        const productId = productResult.insertId;
        
        // Thêm từng size vào processedItems
        for (const sizeData of productData.sizes) {
          processedItems.push({
            product_id: productId,
            size_eu: sizeData.size,
            quantity: sizeData.quantity,
            unit_cost: sizeData.unit_cost,
            total_cost: sizeData.quantity * sizeData.unit_cost,
          });
          
          total_cost += sizeData.quantity * sizeData.unit_cost;
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

        // Cập nhật product_sizes nếu có size
        if (item.size_eu) {
          try {
            // Kiểm tra bảng product_sizes có tồn tại không
            const [tableCheck] = await connection.execute(
              `SELECT 1 FROM information_schema.tables 
               WHERE table_schema = DATABASE() AND table_name = 'product_sizes' LIMIT 1`
            );
            
            if (tableCheck.length > 0) {
              // Tăng số lượng cho size cụ thể
              await connection.execute(
                `INSERT INTO product_sizes (product_id, size_value, quantity)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP`,
                [item.product_id, item.size_eu, item.quantity, item.quantity]
              );
            }
          } catch (sizeError) {
            console.log('product_sizes table not available, skipping size tracking');
          }
        }
      }

      await connection.commit();
      return { id: invoiceId, total_cost, products_created: productGroups.size };
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

        // Hoàn trả product_sizes nếu có size
        if (item.size_eu) {
          try {
            const [tableCheck] = await connection.execute(
              `SELECT 1 FROM information_schema.tables 
               WHERE table_schema = DATABASE() AND table_name = 'product_sizes' LIMIT 1`
            );
            
            if (tableCheck.length > 0) {
              await connection.execute(
                `UPDATE product_sizes 
                 SET quantity = GREATEST(0, quantity - ?), updated_at = CURRENT_TIMESTAMP
                 WHERE product_id = ? AND size_value = ?`,
                [item.quantity, item.product_id, item.size_eu]
              );
            }
          } catch (sizeError) {
            console.log('product_sizes table not available, skipping size tracking');
          }
        }
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

  // Lấy số hóa đơn tiếp theo (tự động tăng)
  getNextInvoiceNumber: async () => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const prefix = `PN${dateStr}`; // PN = Purchase iNvoice

      // Lấy hóa đơn cuối cùng trong ngày hôm nay
      const [rows] = await db.execute(
        `SELECT invoice_number 
         FROM purchase_invoices 
         WHERE invoice_number LIKE ? 
         ORDER BY invoice_number DESC 
         LIMIT 1`,
        [`${prefix}-%`]
      );

      let nextNumber = 1;
      if (rows.length > 0) {
        const match = rows[0].invoice_number.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
    } catch (error) {
      // Fallback nếu có lỗi
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      return `PN${dateStr}-001`;
    }
  },
};

module.exports = PurchaseInvoice;