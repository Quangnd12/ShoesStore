const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { auth, isAdmin } = require("../middlewares/auth");

// Public routes
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);

// Protected routes (admin only)
router.post("/", auth, isAdmin, productController.addProduct);
router.put("/:id", auth, isAdmin, productController.updateProduct);
router.delete("/:id", auth, isAdmin, productController.deleteProduct);

module.exports = router;
