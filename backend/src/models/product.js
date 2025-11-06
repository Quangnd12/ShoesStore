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
};

module.exports = Product;
