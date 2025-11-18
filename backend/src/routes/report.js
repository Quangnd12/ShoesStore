const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { auth, isAdmin } = require("../middlewares/auth");

// Admin routes
router.get("/daily", auth, isAdmin, reportController.getDailyReport);
router.get("/daily/detail", auth, isAdmin, reportController.getDailyDetailReport);
router.get("/weekly", auth, isAdmin, reportController.getWeeklyReport);
router.get("/monthly", auth, isAdmin, reportController.getMonthlyReport);
router.get("/yearly", auth, isAdmin, reportController.getYearlyReport);
router.get("/range", auth, isAdmin, reportController.getReportByDateRange);

module.exports = router;



