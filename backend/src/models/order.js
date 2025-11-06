const db = require("../config/db");

const Order = {
  create: async (user_id, total_price) => {
    const [result] = await db.execute(
      "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
      [user_id, total_price]
    );
    return result;
  },
  addOrderItems: async (orderId, items) => {
    // items: [{product_id, quantity, price}]
    const values = items.map((item) => [
      orderId,
      item.product_id,
      item.quantity,
      item.price,
    ]);
    const [result] = await db.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
      [values]
    );
    return result;
  },
  getByUser: async (user_id) => {
    const [rows] = await db.execute("SELECT * FROM orders WHERE user_id = ?", [
      user_id,
    ]);
    return rows;
  },
  getById: async (id) => {
    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [id]);
    return rows[0];
  },
  getOrderItems: async (order_id) => {
    const [rows] = await db.execute(
      "SELECT * FROM order_items WHERE order_id = ?",
      [order_id]
    );
    return rows;
  },
};

module.exports = Order;
