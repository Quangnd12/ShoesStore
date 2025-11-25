const db = require("../config/db");
const User = require("./user");
const bcrypt = require("bcrypt");

const SalesInvoice = {
  // Tạo hóa đơn bán (một lần gộp nhiều sản phẩm)
  create: async ({
    invoice_number,
    invoice_date,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    items,
    notes,
  }) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Tự động tạo user nếu khách hàng mới (có email nhưng chưa có customer_id)
      let finalCustomerId = customer_id;
      if (!finalCustomerId && customer_email) {
        const existingUser = await User.findByEmail(customer_email);
        if (!existingUser) {
          // Tạo user mới với password mặc định (khách hàng có thể đổi sau)
          const defaultPassword = await bcrypt.hash("123456", 10);
          const username = customer_name || customer_email.split("@")[0];
          const [userResult] = await connection.execute(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, customer_email, defaultPassword, "user"]
          );
          finalCustomerId = userResult.insertId;
        } else {
          finalCustomerId = existingUser.id;
        }
      }

      const enrichedItems = await SalesInvoice._enrichItems(connection, items);
      const total_revenue = enrichedItems.reduce(
        (sum, item) => sum + item.total_price,
        0
      );
      const invoiceDate =
        invoice_date || new Date().toISOString().split("T")[0];

      const [invoiceResult] = await connection.execute(
        `INSERT INTO sales_invoices 
         (invoice_number, customer_id, customer_name, customer_phone, customer_email, total_revenue, invoice_date, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice_number,
          finalCustomerId || null,
          customer_name || null,
          customer_phone || null,
          customer_email || null,
          total_revenue,
          invoiceDate,
          notes || null,
        ]
      );
      const invoiceId = invoiceResult.insertId;

      await SalesInvoice._createInvoiceItems({
        connection,
        invoiceId,
        items: enrichedItems,
      });

      await connection.commit();
      return { id: invoiceId, total_revenue };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Chuẩn hóa items + kiểm tra tồn kho
  _enrichItems: async (connection, items) => {
    const enrichedItems = [];
    for (const item of items) {
      if (!item.product_id || !item.quantity) {
        throw new Error("Mỗi sản phẩm cần có product_id và quantity lớn hơn 0");
      }
      const [productRows] = await connection.execute(
        "SELECT id, name, price, size, stock_quantity FROM products WHERE id = ?",
        [item.product_id]
      );
      if (!productRows.length) {
        throw new Error(`Không tìm thấy sản phẩm ID ${item.product_id}`);
      }
      const product = productRows[0];
      if (product.stock_quantity < item.quantity) {
        throw new Error(
          `Không đủ tồn kho cho sản phẩm ${product.name} (ID ${product.id})`
        );
      }

      const unit_price =
        item.unit_price !== undefined && item.unit_price !== null
          ? item.unit_price
          : product.price;
      const size_eu = product.size ? String(product.size) : null;

      enrichedItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price,
        total_price: unit_price * item.quantity,
        size_eu,
      });
    }
    return enrichedItems;
  },

  // Helper: tạo invoice items và trừ tồn kho
  _createInvoiceItems: async ({ connection, invoiceId, items }) => {
    for (const item of items) {
      const unit_price =
        item.unit_price !== undefined && item.unit_price !== null
          ? item.unit_price
          : item.price;
      const total_price =
        item.total_price !== undefined
          ? item.total_price
          : unit_price * item.quantity;

      // Nếu size chưa có (vd từ order item cũ) thì lấy từ product
      let size_eu = item.size_eu || null;
      if (!size_eu) {
        const [productRows] = await connection.execute(
          "SELECT size FROM products WHERE id = ?",
          [item.product_id]
        );
        size_eu = productRows[0]?.size ? String(productRows[0].size) : null;
      }

      await connection.execute(
        `INSERT INTO sales_invoice_items 
         (sales_invoice_id, product_id, size_eu, quantity, unit_price, total_price) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          invoiceId,
          item.product_id,
          size_eu,
          item.quantity,
          unit_price,
          total_price,
        ]
      );

      // Trừ tồn kho
      const [stockRows] = await connection.execute(
        "SELECT stock_quantity FROM products WHERE id = ?",
        [item.product_id]
      );
      if (!stockRows.length || stockRows[0].stock_quantity < item.quantity) {
        throw new Error(`Không đủ tồn kho cho sản phẩm ID ${item.product_id}`);
      }
      await connection.execute(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?",
        [item.quantity, item.product_id, item.quantity]
      );
    }
  },

  // Lấy tất cả hóa đơn bán - FIXED: Sử dụng query thay vì execute
  getAll: async (limit, offset) => {
    const limitInt = parseInt(limit) || 10;
    const offsetInt = parseInt(offset) || 0;

    // Sử dụng query với giá trị trực tiếp thay vì prepared statement
    // Thêm tổng số sản phẩm (total_quantity) từ sales_invoice_items
    const [rows] = await db.query(
      `SELECT si.*, 
              u.username as account_username, 
              u.email as account_email,
              COALESCE(SUM(sii.quantity), 0) as total_quantity
       FROM sales_invoices si 
       LEFT JOIN users u ON si.customer_id = u.id 
       LEFT JOIN sales_invoice_items sii ON si.id = sii.sales_invoice_id
       GROUP BY si.id
       ORDER BY si.invoice_date DESC, si.created_at DESC 
       LIMIT ${limitInt} OFFSET ${offsetInt}`
    );
    return rows;
  },

  // Lấy tổng số hóa đơn
  getTotal: async () => {
    const [rows] = await db.execute(
      "SELECT COUNT(*) as total FROM sales_invoices"
    );
    return rows[0].total;
  },

  // Lấy hóa đơn theo ID
  getById: async (id) => {
    const [rows] = await db.execute(
      `SELECT si.*, u.username as account_username, u.email as account_email
       FROM sales_invoices si
       LEFT JOIN users u ON si.customer_id = u.id 
       WHERE si.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Lấy chi tiết hóa đơn bán
  getItems: async (invoiceId) => {
    const [rows] = await db.execute(
      `SELECT sii.*, p.name as product_name, p.brand, p.image_url 
       FROM sales_invoice_items sii 
       LEFT JOIN products p ON sii.product_id = p.id 
       WHERE sii.sales_invoice_id = ? AND sii.quantity > 0`,
      [invoiceId]
    );
    return rows;
  },

  // Lấy thông tin hoàn trả/đổi hàng của hóa đơn
  getReturnExchanges: async (invoiceId) => {
    const [rows] = await db.execute(
      `SELECT re.*, 
              rei.sales_invoice_item_id, 
              rei.product_id as old_product_id,
              rei.quantity as return_quantity,
              rei.new_product_id,
              p_old.name as old_product_name,
              p_old.size as old_product_size,
              p_new.name as new_product_name,
              p_new.size as new_product_size
       FROM return_exchanges re
       LEFT JOIN return_exchange_items rei ON re.id = rei.return_exchange_id
       LEFT JOIN products p_old ON rei.product_id = p_old.id
       LEFT JOIN products p_new ON rei.new_product_id = p_new.id
       WHERE re.sales_invoice_id = ?
       ORDER BY re.created_at DESC`,
      [invoiceId]
    );
    return rows;
  },

  // Lấy số hóa đơn tiếp theo (tự động tăng)
  getNextInvoiceNumber: async () => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const prefix = `HD${dateStr}`;

      // Lấy hóa đơn cuối cùng trong ngày hôm nay
      const [rows] = await db.execute(
        `SELECT invoice_number 
         FROM sales_invoices 
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
      return `HD${dateStr}-001`;
    }
  },
};

module.exports = SalesInvoice;
