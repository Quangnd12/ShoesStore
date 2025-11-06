const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { auth } = require("../middlewares/auth");

router.post("/", auth, cartController.addToCart);
router.get("/", auth, cartController.getCart);
router.delete("/:itemId", auth, cartController.removeFromCart);

module.exports = router;
