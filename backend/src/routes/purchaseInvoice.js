const express = require("express");
const router = express.Router();
const purchaseInvoiceController = require("../controllers/purchaseInvoiceController");
const { auth, isAdmin } = require("../middlewares/auth");

// Admin routes
router.post("/", auth, isAdmin, purchaseInvoiceController.createPurchaseInvoice);
router.get("/", auth, isAdmin, purchaseInvoiceController.getAllPurchaseInvoices);
router.get("/:id", auth, purchaseInvoiceController.getPurchaseInvoiceById);
router.delete("/:id", auth, isAdmin, purchaseInvoiceController.deletePurchaseInvoice);

module.exports = router;



