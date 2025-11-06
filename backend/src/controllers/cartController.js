const Cart = require("../models/cart");

exports.addToCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity } = req.body;
    await Cart.addItem(user_id, product_id, quantity);
    res.json({ message: "Đã thêm vào giỏ hàng!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const cart = await Cart.getByUser(user_id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const id = req.params.itemId;
    await Cart.removeItem(id);
    res.json({ message: "Đã xóa khỏi giỏ hàng!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
