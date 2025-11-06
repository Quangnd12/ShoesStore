const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth } = require("../middlewares/auth");

router.post("/", auth, orderController.createOrder);
router.get("/", auth, orderController.getOrdersByUser);
router.get("/:id", auth, orderController.getOrderDetail);

module.exports = router;
