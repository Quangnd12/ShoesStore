const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { auth, isAdmin } = require("../middlewares/auth");

// Public routes (phải đặt trước routes có params)
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/name/:name", productController.getProductsByName);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
router.get("/:id/sizes", productController.getProductSizes); // Lấy sizes của sản phẩm

// Admin routes
router.post("/", auth, isAdmin, productController.addProduct);
router.post("/batch", auth, isAdmin, productController.createProductBatch); // Nhập hàng theo túi
router.put("/:id", auth, isAdmin, productController.updateProduct);
router.delete("/:id", auth, isAdmin, productController.deleteProduct);

module.exports = router;
