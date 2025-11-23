const db = require("../config/db");

const ReturnExchange = {
  // Tạo yêu cầu hoàn trả/đổi hàng
  create: async ({
    sales_invoice_id,
    type, // 'return' hoặc 'exchange'
    reason,
    items, // [{sales_invoice_item_id, quantity, new_product_id?}]
    notes,
  }) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Kiểm tra hóa đơn tồn tại
      const [invoiceRows] = await connection.execute(
        "SELECT * FROM sales_invoices WHERE id = ?",
        [sales_invoice_id]
      );
      if (!invoiceRows.length) {
        throw new Error("Không tìm thấy hóa đơn bán");
      }

      // Tạo record hoàn trả/đổi
      const [result] = await connection.execute(
        `INSERT INTO return_exchanges 
         (sales_invoice_id, type, reason, notes, status) 
         VALUES (?, ?, ?, ?, 'pending')`,
        [sales_invoice_id, type, reason || null, notes || null]
      );
      const returnExchangeId = result.insertId;

      let totalRevenueDifference = 0; // Để cập nhật lại tổng doanh thu nếu có chênh lệch giá

      // Xử lý từng item
      for (const item of items) {
        // Lấy thông tin item gốc từ hóa đơn
        const [originalItemRows] = await connection.execute(
          `SELECT sii.*, p.id as product_id, p.size, p.price as product_price 
           FROM sales_invoice_items sii 
           JOIN products p ON sii.product_id = p.id 
           WHERE sii.id = ? AND sii.sales_invoice_id = ?`,
          [item.sales_invoice_item_id, sales_invoice_id]
        );
        if (!originalItemRows.length) {
          throw new Error(
            `Không tìm thấy item ID ${item.sales_invoice_item_id} trong hóa đơn`
          );
        }
        const originalItem = originalItemRows[0];

        // Kiểm tra số lượng đổi/trả không vượt quá số lượng đã mua
        if (item.quantity > originalItem.quantity) {
          throw new Error(
            `Số lượng đổi/trả (${item.quantity}) không được vượt quá số lượng đã mua (${originalItem.quantity})`
          );
        }

        // Tạo chi tiết hoàn trả/đổi
        await connection.execute(
          `INSERT INTO return_exchange_items 
           (return_exchange_id, sales_invoice_item_id, product_id, quantity, new_product_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            returnExchangeId,
            item.sales_invoice_item_id,
            originalItem.product_id,
            item.quantity,
            item.new_product_id || null,
          ]
        );

        // Hoàn trả tồn kho sản phẩm cũ (cộng lại vào products)
        await connection.execute(
          "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
          [item.quantity, originalItem.product_id]
        );

        // Xử lý theo loại: return hoặc exchange
        if (type === "exchange" && item.new_product_id) {
          // === ĐỔI HÀNG ===

          // Kiểm tra sản phẩm mới tồn tại và có đủ tồn kho
          const [newProductRows] = await connection.execute(
            "SELECT id, name, price, size, stock_quantity FROM products WHERE id = ?",
            [item.new_product_id]
          );
          if (!newProductRows.length) {
            throw new Error(
              `Không tìm thấy sản phẩm mới ID ${item.new_product_id}`
            );
          }
          const newProduct = newProductRows[0];

          if (newProduct.stock_quantity < item.quantity) {
            throw new Error(
              `Không đủ tồn kho cho sản phẩm mới "${newProduct.name}" (ID ${item.new_product_id}). Còn lại: ${newProduct.stock_quantity}`
            );
          }

          // Trừ tồn kho sản phẩm mới
          await connection.execute(
            "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
            [item.quantity, item.new_product_id]
          );

          // **CẬP NHẬT sales_invoice_items với sản phẩm mới**
          const newSize = newProduct.size ? String(newProduct.size) : null;
          const newUnitPrice = item.new_unit_price || newProduct.price; // Cho phép điều chỉnh giá
          const newTotalPrice = newUnitPrice * item.quantity;

          // Nếu đổi toàn bộ số lượng → cập nhật item
          if (item.quantity === originalItem.quantity) {
            await connection.execute(
              `UPDATE sales_invoice_items 
               SET product_id = ?, size_eu = ?, unit_price = ?, total_price = ? 
               WHERE id = ?`,
              [
                item.new_product_id,
                newSize,
                newUnitPrice,
                newTotalPrice,
                item.sales_invoice_item_id,
              ]
            );
          }
          // Nếu đổi một phần → giảm số lượng item cũ, thêm item mới
          else {
            // Giảm số lượng item cũ
            const remainingQuantity = originalItem.quantity - item.quantity;
            const remainingTotalPrice =
              originalItem.unit_price * remainingQuantity;

            await connection.execute(
              `UPDATE sales_invoice_items 
               SET quantity = ?, total_price = ? 
               WHERE id = ?`,
              [
                remainingQuantity,
                remainingTotalPrice,
                item.sales_invoice_item_id,
              ]
            );

            // Thêm item mới cho sản phẩm đổi
            await connection.execute(
              `INSERT INTO sales_invoice_items 
               (sales_invoice_id, product_id, size_eu, quantity, unit_price, total_price) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                sales_invoice_id,
                item.new_product_id,
                newSize,
                item.quantity,
                newUnitPrice,
                newTotalPrice,
              ]
            );
          }

          // Tính chênh lệch giá để cập nhật tổng doanh thu
          const oldTotalPrice = originalItem.unit_price * item.quantity;
          totalRevenueDifference += newTotalPrice - oldTotalPrice;
        } else if (type === "return") {
          // === HOÀN TRẢ ===
          // Không xóa sales_invoice_items vì đang được tham chiếu bởi return_exchange_items (FK),
          // thay vào đó luôn cập nhật lại số lượng và thành tiền.

          const remainingQuantity = originalItem.quantity - item.quantity;
          const remainingTotalPrice =
            originalItem.unit_price * remainingQuantity;

          await connection.execute(
            `UPDATE sales_invoice_items 
             SET quantity = ?, total_price = ? 
             WHERE id = ?`,
            [remainingQuantity, remainingTotalPrice, item.sales_invoice_item_id]
          );

          // Trừ doanh thu theo phần hàng được hoàn trả
          const returnedAmount = originalItem.unit_price * item.quantity;
          totalRevenueDifference -= returnedAmount;
        }
      }

      // Cập nhật tổng doanh thu của hóa đơn
      if (totalRevenueDifference !== 0) {
        await connection.execute(
          "UPDATE sales_invoices SET total_revenue = total_revenue + ? WHERE id = ?",
          [totalRevenueDifference, sales_invoice_id]
        );
      }

      // Cập nhật trạng thái thành 'completed'
      await connection.execute(
        "UPDATE return_exchanges SET status = 'completed' WHERE id = ?",
        [returnExchangeId]
      );

      await connection.commit();
      return {
        id: returnExchangeId,
        revenue_difference: totalRevenueDifference,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Lấy tất cả yêu cầu hoàn trả/đổi
  getAll: async (limit, offset) => {
    const limitInt = parseInt(limit) || 10;
    const offsetInt = parseInt(offset) || 0;

    const [rows] = await db.query(
      `SELECT re.*, si.invoice_number, si.customer_name, si.customer_phone 
       FROM return_exchanges re 
       LEFT JOIN sales_invoices si ON re.sales_invoice_id = si.id 
       ORDER BY re.created_at DESC 
       LIMIT ${limitInt} OFFSET ${offsetInt}`
    );
    return rows;
  },

  // Lấy tổng số return/exchange
  getTotal: async () => {
    const [rows] = await db.execute(
      "SELECT COUNT(*) as total FROM return_exchanges"
    );
    return rows[0].total;
  },

  // Lấy chi tiết hoàn trả/đổi
  getById: async (id) => {
    const [rows] = await db.execute(
      `SELECT re.*, si.invoice_number, si.customer_name, si.customer_phone, si.customer_email 
       FROM return_exchanges re 
       LEFT JOIN sales_invoices si ON re.sales_invoice_id = si.id 
       WHERE re.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Lấy items của hoàn trả/đổi
  getItems: async (returnExchangeId) => {
    const [rows] = await db.execute(
      `SELECT rei.*, 
       p.name as product_name, p.size as product_size, p.brand as product_brand,
       np.name as new_product_name, np.size as new_product_size, np.brand as new_product_brand 
       FROM return_exchange_items rei 
       LEFT JOIN products p ON rei.product_id = p.id 
       LEFT JOIN products np ON rei.new_product_id = np.id 
       WHERE rei.return_exchange_id = ?`,
      [returnExchangeId]
    );
    return rows;
  },
};

module.exports = ReturnExchange;
