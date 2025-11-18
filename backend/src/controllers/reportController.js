const Report = require("../models/report");

// Báo cáo theo ngày
exports.getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Vui lòng cung cấp date (YYYY-MM-DD)" });
    }
    const report = await Report.getDailyReport(date);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Báo cáo chi tiết theo ngày
exports.getDailyDetailReport = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Vui lòng cung cấp date (YYYY-MM-DD)" });
    }
    const report = await Report.getDailyDetailReport(date);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Báo cáo theo tuần
exports.getWeeklyReport = async (req, res) => {
  try {
    const { year, week } = req.query;
    if (!year || !week) {
      return res.status(400).json({ message: "Vui lòng cung cấp year và week" });
    }
    const report = await Report.getWeeklyReport(parseInt(year), parseInt(week));
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Báo cáo theo tháng
exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ message: "Vui lòng cung cấp year và month" });
    }
    const report = await Report.getMonthlyReport(parseInt(year), parseInt(month));
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Báo cáo theo năm
exports.getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ message: "Vui lòng cung cấp year" });
    }
    const report = await Report.getYearlyReport(parseInt(year));
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Báo cáo theo khoảng thời gian
exports.getReportByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp start_date và end_date (YYYY-MM-DD)" 
      });
    }
    const report = await Report.getReportByDateRange(start_date, end_date);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



