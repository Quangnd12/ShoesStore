const Order = require("../models/order");
const Cart = require("../models/cart");

exports.createOrder = async (req, res) => {
  try {
    const user_id = req.user.id;
    const cartItems = await Cart.getByUser(user_id);
    if (!cartItems.length)
      return res.status(400).json({ message: "Giỏ hàng trống!" });
    const total_price = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderResult = await Order.create(user_id, total_price);
    const orderId = orderResult.insertId;
    const items = cartItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));
    await Order.addOrderItems(orderId, items);
    await Cart.clearCart(user_id);
    res.json({ message: "Tạo đơn hàng thành công!", orderId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const user_id = req.user.id;
    const orders = await Order.getByUser(user_id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const order_id = req.params.id;
    const order = await Order.getById(order_id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    const items = await Order.getOrderItems(order_id);
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
