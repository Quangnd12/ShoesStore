const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const categoryRoutes = require("./routes/category");
const supplierRoutes = require("./routes/supplier");
const purchaseInvoiceRoutes = require("./routes/purchaseInvoice");
const salesInvoiceRoutes = require("./routes/salesInvoice");
const reportRoutes = require("./routes/report");
const returnExchangeRoutes = require("./routes/returnExchange");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase-invoices", purchaseInvoiceRoutes);
app.use("/api/sales-invoices", salesInvoiceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/return-exchanges", returnExchangeRoutes);

app.get("/", (req, res) => res.send("API is running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("--- API Endpoints ---");
  console.log(`POST http://localhost:${PORT}/api/`);
});
