const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/dashboardController");

// Top sản phẩm bán chạy
router.get("/top-selling", DashboardController.getTopSellingProducts);

// Đơn hàng theo giờ
router.get("/orders-by-hour", DashboardController.getOrdersByHour);

// Sản phẩm tồn kho thấp
router.get("/low-stock", DashboardController.getLowStockProducts);

// Tăng trưởng doanh thu
router.get("/revenue-growth", DashboardController.getRevenueGrowth);

module.exports = router;
