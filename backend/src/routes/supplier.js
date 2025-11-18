const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const { auth, isAdmin } = require("../middlewares/auth");

// Public routes
router.get("/", supplierController.getAllSuppliers);
router.get("/:id", supplierController.getSupplierById);

// Admin routes
router.post("/", auth, isAdmin, supplierController.createSupplier);
router.put("/:id", auth, isAdmin, supplierController.updateSupplier);
router.delete("/:id", auth, isAdmin, supplierController.deleteSupplier);

module.exports = router;



