const db = require("../config/db");

const Product = {
  getAll: async (limit, offset) => {
    const [rows] = await db.execute(
      `SELECT p.*, c.name as category_name, c.id as category_id
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );
    return rows;
  },
  getTotal: async () => {
    const [rows] = await db.execute("SELECT COUNT(*) as total FROM products");
    return rows[0].total;
  },
  create: async (data) => {
    const {
      name,
      description,
      price,
      category_id,
      stock_quantity,
      image_url,
      discount_price,
      brand,
      size,
      color,
    } = data;
    const [result] = await db.execute(
      "INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, discount_price, brand, size, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        description,
        price,
        category_id,
        stock_quantity,
        image_url,
        discount_price,
        brand,
        size,
        color,
      ]
    );
    return result;
  },
  getById: async (id) => {
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },
  update: async (id, data) => {
    const {
      name,
      description,
      price,
      category_id,
      stock_quantity,
      image_url,
      discount_price,
      brand,
      size,
      color,
    } = data;
    const [result] = await db.execute(
      "UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock_quantity = ?, image_url = ?, discount_price = ?, brand = ?, size = ?, color = ? WHERE id = ?",
      [
        name,
        description,
        price,
        category_id,
        stock_quantity,
        image_url,
        discount_price,
        brand,
        size,
        color,
        id,
      ]
    );
    return result;
  },
  delete: async (id) => {
    const [result] = await db.execute("DELETE FROM products WHERE id = ?", [
      id,
    ]);
    return result;
  },
  search: async ({ query, category, minPrice, maxPrice, limit, offset }) => {
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (query) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${query}%`, `%${query}%`);
    }

    if (category) {
      sql += " AND category_id = ?";
      params.push(category);
    }

    if (minPrice) {
      sql += " AND price >= ?";
      params.push(minPrice);
    }

    if (maxPrice) {
      sql += " AND price <= ?";
      params.push(maxPrice);
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.execute(sql, params);
    return rows;
  },
  getSearchTotal: async ({ query, category, minPrice, maxPrice }) => {
    let sql = "SELECT COUNT(*) as total FROM products WHERE 1=1";
    const params = [];

    if (query) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${query}%`, `%${query}%`);
    }

    if (category) {
      sql += " AND category_id = ?";
      params.push(category);
    }

    if (minPrice) {
      sql += " AND price >= ?";
      params.push(minPrice);
    }

    if (maxPrice) {
      sql += " AND price <= ?";
      params.push(maxPrice);
    }

    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  },
  getByCategory: async (categoryId, limit, offset) => {
    const [rows] = await db.execute(
      "SELECT * FROM products WHERE category_id = ? LIMIT ? OFFSET ?",
      [categoryId, limit, offset]
    );
    return rows;
  },
  getTotalByCategory: async (categoryId) => {
    const [rows] = await db.execute(
      "SELECT COUNT(*) as total FROM products WHERE category_id = ?",
      [categoryId]
    );
    return rows[0].total;
  },

  // Nhập hàng theo túi: tạo nhiều products cùng tên nhưng khác size
  createBatch: async (baseProduct, sizes) => {
    // baseProduct: {name, description, price, category_id, image_url, discount_price, brand, color}
    // sizes: [{size_eu, stock_quantity}]
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const results = [];
      for (const size of sizes) {
        // Chuyển size_eu thành string để tương thích với VARCHAR(50) trong database
        const sizeValue = size.size_eu ? String(size.size_eu) : null;

        const [result] = await connection.execute(
          `INSERT INTO products 
           (name, description, price, category_id, stock_quantity, image_url, discount_price, brand, size, color) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            baseProduct.name,
            baseProduct.description || null,
            baseProduct.price,
            baseProduct.category_id,
            size.stock_quantity || 0,
            baseProduct.image_url || null,
            baseProduct.discount_price || null,
            baseProduct.brand || null,
            sizeValue,
            baseProduct.color || null,
          ]
        );
        results.push(result);
      }

      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Tìm sản phẩm theo name và size (để cập nhật tồn kho khi nhập)
  findByNameAndSize: async (name, sizeEu) => {
    // Chuyển size thành string để tương thích với VARCHAR
    const sizeValue = sizeEu ? String(sizeEu) : null;
    const [rows] = await db.execute(
      "SELECT * FROM products WHERE name = ? AND size = ?",
      [name, sizeValue]
    );
    return rows[0];
  },

  // Cập nhật tồn kho (thêm vào)
  updateStock: async (productId, quantity) => {
    const [result] = await db.execute(
      "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
      [quantity, productId]
    );
    return result;
  },

  // Giảm tồn kho (khi bán)
  decreaseStock: async (productId, quantity) => {
    const [result] = await db.execute(
      "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?",
      [quantity, productId, quantity]
    );
    return result;
  },

  // Kiểm tra tồn kho
  checkStock: async (productId, quantity) => {
    const product = await Product.getById(productId);
    if (!product) return false;
    return product.stock_quantity >= quantity;
  },

  // Lấy tất cả size của một sản phẩm (theo name)
  getByProductName: async (productName) => {
    const [rows] = await db.execute(
      "SELECT * FROM products WHERE name = ? ORDER BY CAST(size AS DECIMAL(3,1)) ASC, size ASC",
      [productName]
    );
    return rows;
  },
};

module.exports = Product;
