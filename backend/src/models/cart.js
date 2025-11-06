const db = require("../config/db");

const Cart = {
  addItem: async (user_id, product_id, quantity) => {
    const [result] = await db.execute(
      "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?",
      [user_id, product_id, quantity, quantity]
    );
    return result;
  },
  getByUser: async (user_id) => {
    const [rows] = await db.execute(
      "SELECT c.id, c.product_id, p.name, p.price, c.quantity, p.image_url FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?",
      [user_id]
    );
    return rows;
  },
  removeItem: async (id) => {
    const [result] = await db.execute("DELETE FROM cart_items WHERE id = ?", [
      id,
    ]);
    return result;
  },
  clearCart: async (user_id) => {
    const [result] = await db.execute(
      "DELETE FROM cart_items WHERE user_id = ?",
      [user_id]
    );
    return result;
  },
};

module.exports = Cart;
