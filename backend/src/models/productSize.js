const db = require('../config/db');

const ProductSize = {
  /**
   * Lấy tất cả sizes của một sản phẩm
   */
  async getByProductId(productId) {
    const [rows] = await db.query(
      `SELECT * FROM product_sizes WHERE product_id = ? ORDER BY size_value`,
      [productId]
    );
    return rows;
  },

  /**
   * Lấy số lượng của một size cụ thể
   */
  async getQuantity(productId, sizeValue) {
    const [rows] = await db.query(
      `SELECT quantity FROM product_sizes WHERE product_id = ? AND size_value = ?`,
      [productId, sizeValue]
    );
    return rows[0]?.quantity || 0;
  },

  /**
   * Tạo hoặc cập nhật size cho sản phẩm
   */
  async upsert(productId, sizeValue, quantity) {
    const [result] = await db.query(
      `INSERT INTO product_sizes (product_id, size_value, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = CURRENT_TIMESTAMP`,
      [productId, sizeValue, quantity]
    );
    return result;
  },

  /**
   * Cập nhật số lượng của một size (set trực tiếp)
   */
  async setQuantity(productId, sizeValue, quantity) {
    const [result] = await db.query(
      `INSERT INTO product_sizes (product_id, size_value, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = ?, updated_at = CURRENT_TIMESTAMP`,
      [productId, sizeValue, quantity, quantity]
    );
    return result;
  },

  /**
   * Tăng số lượng (khi nhập hàng)
   */
  async increaseQuantity(productId, sizeValue, amount) {
    const [result] = await db.query(
      `INSERT INTO product_sizes (product_id, size_value, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP`,
      [productId, sizeValue, amount, amount]
    );
    return result;
  },

  /**
   * Giảm số lượng (khi bán hàng)
   */
  async decreaseQuantity(productId, sizeValue, amount) {
    // Kiểm tra số lượng trước khi giảm
    const currentQty = await this.getQuantity(productId, sizeValue);
    if (currentQty < amount) {
      throw new Error(`Không đủ hàng. Size ${sizeValue} chỉ còn ${currentQty}`);
    }

    const [result] = await db.query(
      `UPDATE product_sizes 
       SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = ? AND size_value = ?`,
      [amount, productId, sizeValue]
    );
    return result;
  },

  /**
   * Xóa một size của sản phẩm
   */
  async delete(productId, sizeValue) {
    const [result] = await db.query(
      `DELETE FROM product_sizes WHERE product_id = ? AND size_value = ?`,
      [productId, sizeValue]
    );
    return result;
  },

  /**
   * Xóa tất cả sizes của sản phẩm
   */
  async deleteAllByProductId(productId) {
    const [result] = await db.query(
      `DELETE FROM product_sizes WHERE product_id = ?`,
      [productId]
    );
    return result;
  },

  /**
   * Lấy tổng số lượng của tất cả sizes của sản phẩm
   */
  async getTotalQuantity(productId) {
    const [rows] = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM product_sizes WHERE product_id = ?`,
      [productId]
    );
    return rows[0]?.total || 0;
  },

  /**
   * Lấy danh sách sizes còn hàng của sản phẩm
   */
  async getAvailableSizes(productId) {
    const [rows] = await db.query(
      `SELECT size_value, quantity FROM product_sizes 
       WHERE product_id = ? AND quantity > 0 
       ORDER BY size_value`,
      [productId]
    );
    return rows;
  },

  /**
   * Kiểm tra bảng product_sizes có tồn tại không
   */
  async tableExists() {
    try {
      const [rows] = await db.query(
        `SELECT 1 FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'product_sizes'`
      );
      return rows.length > 0;
    } catch (error) {
      return false;
    }
  },

  /**
   * Sync sizes từ chuỗi size của product vào bảng product_sizes
   * Dùng khi tạo sản phẩm mới hoặc cập nhật
   */
  async syncFromProduct(productId, sizeString, totalQuantity) {
    if (!sizeString || sizeString.trim() === '') {
      return;
    }

    const sizes = sizeString.split(',').map(s => s.trim()).filter(s => s !== '');
    if (sizes.length === 0) return;

    const qtyPerSize = Math.floor(totalQuantity / sizes.length) || 1;

    // Xóa sizes cũ
    await this.deleteAllByProductId(productId);

    // Thêm sizes mới
    for (const size of sizes) {
      await this.setQuantity(productId, size, qtyPerSize);
    }
  }
};

module.exports = ProductSize;
