const db = require("../config/db");

const Category = {
  getAll: async () => {
    const [rows] = await db.execute(`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.stock_quantity > 0
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);
    return rows;
  },
  getById: async (id) => {
    const [rows] = await db.execute("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },
  create: async (name) => {
    const [result] = await db.execute(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );
    return result;
  },
  update: async (id, name) => {
    const [result] = await db.execute(
      "UPDATE categories SET name = ? WHERE id = ?",
      [name, id]
    );
    return result;
  },
  delete: async (id) => {
    const [result] = await db.execute("DELETE FROM categories WHERE id = ?", [
      id,
    ]);
    return result;
  },
};

module.exports = Category;
