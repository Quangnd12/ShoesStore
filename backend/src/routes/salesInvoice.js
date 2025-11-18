const express = require("express");
const router = express.Router();
const salesInvoiceController = require("../controllers/salesInvoiceController");
const { auth, isAdmin } = require("../middlewares/auth");

// Admin routes
router.post("/", auth, isAdmin, salesInvoiceController.createSalesInvoice);
router.get("/", auth, isAdmin, salesInvoiceController.getAllSalesInvoices);
router.get("/:id", auth, salesInvoiceController.getSalesInvoiceById);

module.exports = router;



