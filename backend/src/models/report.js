const db = require("../config/db");

const Report = {
  // Báo cáo doanh thu và chi phí theo ngày
  getDailyReport: async (date) => {
    const [revenueRows] = await db.execute(
      `SELECT 
         DATE(invoice_date) as date,
         SUM(total_revenue) as total_revenue,
         COUNT(*) as invoice_count
       FROM sales_invoices 
       WHERE DATE(invoice_date) = ?
       GROUP BY DATE(invoice_date)`,
      [date]
    );

    const [costRows] = await db.execute(
      `SELECT 
         DATE(invoice_date) as date,
         SUM(total_cost) as total_cost,
         COUNT(*) as invoice_count
       FROM purchase_invoices 
       WHERE DATE(invoice_date) = ?
       GROUP BY DATE(invoice_date)`,
      [date]
    );

    const totalRevenue = revenueRows[0]?.total_revenue || 0;
    const totalInvoices = revenueRows[0]?.invoice_count || 0;
    const totalCost = costRows[0]?.total_cost || 0;

    return {
      date,
      total_revenue: totalRevenue,
      total_invoices: totalInvoices,
      total_cost: totalCost,
      profit: totalRevenue - totalCost,
    };
  },

  // Báo cáo doanh thu và chi phí theo tuần
  getWeeklyReport: async (year, week) => {
    // Lấy dữ liệu tổng hợp
    const [revenueRows] = await db.execute(
      `SELECT 
         YEAR(invoice_date) as year,
         WEEK(invoice_date) as week,
         SUM(total_revenue) as total_revenue,
         COUNT(*) as invoice_count
       FROM sales_invoices 
       WHERE YEAR(invoice_date) = ? AND WEEK(invoice_date) = ?
       GROUP BY YEAR(invoice_date), WEEK(invoice_date)`,
      [year, week]
    );

    const [costRows] = await db.execute(
      `SELECT 
         YEAR(invoice_date) as year,
         WEEK(invoice_date) as week,
         SUM(total_cost) as total_cost,
         COUNT(*) as invoice_count
       FROM purchase_invoices 
       WHERE YEAR(invoice_date) = ? AND WEEK(invoice_date) = ?
       GROUP BY YEAR(invoice_date), WEEK(invoice_date)`,
      [year, week]
    );

    // Lấy dữ liệu theo từng ngày trong tuần
    const [dailyData] = await db.execute(
      `SELECT 
         DATE(invoice_date) as date,
         SUM(total_revenue) as total_revenue,
         COUNT(*) as total_invoices
       FROM sales_invoices 
       WHERE YEAR(invoice_date) = ? AND WEEK(invoice_date) = ?
       GROUP BY DATE(invoice_date)
       ORDER BY date`,
      [year, week]
    );

    const totalRevenue = revenueRows[0]?.total_revenue || 0;
    const totalInvoices = revenueRows[0]?.invoice_count || 0;
    const totalCost = costRows[0]?.total_cost || 0;

    return {
      year,
      week,
      total_revenue: totalRevenue,
      total_invoices: totalInvoices,
      total_cost: totalCost,
      profit: totalRevenue - totalCost,
      daily_data: dailyData,
    };
  },

  // Báo cáo doanh thu và chi phí theo tháng
  getMonthlyReport: async (year, month) => {
    // Lấy dữ liệu tổng hợp
    const [revenueRows] = await db.execute(
      `SELECT 
         YEAR(invoice_date) as year,
         MONTH(invoice_date) as month,
         SUM(total_revenue) as total_revenue,
         COUNT(*) as invoice_count
       FROM sales_invoices 
       WHERE YEAR(invoice_date) = ? AND MONTH(invoice_date) = ?
       GROUP BY YEAR(invoice_date), MONTH(invoice_date)`,
      [year, month]
    );

    const [costRows] = await db.execute(
      `SELECT 
         YEAR(invoice_date) as year,
         MONTH(invoice_date) as month,
         SUM(total_cost) as total_cost,
         COUNT(*) as invoice_count
       FROM purchase_invoices 
       WHERE YEAR(invoice_date) = ? AND MONTH(invoice_date) = ?
       GROUP BY YEAR(invoice_date), MONTH(invoice_date)`,
      [year, month]
    );

    // Lấy dữ liệu theo từng ngày trong tháng
    const [dailyData] = await db.execute(
      `SELECT 
         DATE(invoice_date) as date,
         SUM(total_revenue) as total_revenue,
         COUNT(*) as total_invoices
       FROM sales_invoices 
       WHERE YEAR(invoice_date) = ? AND MONTH(invoice_date) = ?
       GROUP BY DATE(invoice_date)
       ORDER BY date`,
      [year, month]
    );

    const totalRevenue = revenueRows[0]?.total_revenue || 0;
    const totalInvoices = revenueRows[0]?.invoice_count || 0;
    const totalCost = costRows[0]?.total_cost || 0;

    return {
      year,
      month,
      total_revenue: totalRevenue,
      total_invoices: totalInvoices,
      total_cost: totalCost,
      profit: totalRevenue - totalCost,
      daily_data: dailyData,
    };
  },

  // Báo cáo doanh thu và chi phí theo năm
  getYearlyReport: async (year) => {
    // Lấy dữ liệu tổng hợp
    const [revenueRows] = await db.execute(
      `SELECT 
         YEAR(invoice_date) as year,
         SUM(total_revenue) as total_revenue,
         COUNT(*) as invoice_count
       FROM sales_invoices 
       WHERE YEAR(invoice_date) = ?
       GROUP BY YEAR(invoice_date)`,
      [year]
    );

    const [costRows] = await db.execute(
      `SELECT 
         YEAR(invoice_date) as year,
         SUM(total_cost) as total_cost,
         COUNT(*) as invoice_count
       FROM purchase_invoices 
       WHERE YEAR(invoice_date) = ?
       GROUP BY YEAR(invoice_date)`,
      [year]
    );

    // Lấy dữ liệu theo từng tháng trong năm
    const [monthlyData] = await db.execute(
      `SELECT 
         MONTH(invoice_date) as month,
         SUM(total_revenue) as total_revenue,
         COUNT(*) as total_invoices
       FROM sales_invoices 
       WHERE YEAR(invoice_date) = ?
       GROUP BY MONTH(invoice_date)
       ORDER BY month`,
      [year]
    );

    const totalRevenue = revenueRows[0]?.total_revenue || 0;
    const totalInvoices = revenueRows[0]?.invoice_count || 0;
    const totalCost = costRows[0]?.total_cost || 0;

    return {
      year,
      total_revenue: totalRevenue,
      total_invoices: totalInvoices,
      total_cost: totalCost,
      profit: totalRevenue - totalCost,
      monthly_data: monthlyData,
    };
  },

  // Báo cáo tổng hợp theo khoảng thời gian
  getReportByDateRange: async (startDate, endDate) => {
    const [revenueRows] = await db.execute(
      `SELECT 
         SUM(total_revenue) as total_revenue,
         COUNT(*) as invoice_count
       FROM sales_invoices 
       WHERE invoice_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    const [costRows] = await db.execute(
      `SELECT 
         SUM(total_cost) as total_cost,
         COUNT(*) as invoice_count
       FROM purchase_invoices 
       WHERE invoice_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    return {
      start_date: startDate,
      end_date: endDate,
      revenue: revenueRows[0] || { total_revenue: 0, invoice_count: 0 },
      cost: costRows[0] || { total_cost: 0, invoice_count: 0 },
      profit: (revenueRows[0]?.total_revenue || 0) - (costRows[0]?.total_cost || 0),
    };
  },

  // Báo cáo chi tiết theo ngày (có danh sách hóa đơn)
  getDailyDetailReport: async (date) => {
    const [salesInvoices] = await db.execute(
      `SELECT * FROM sales_invoices 
       WHERE DATE(invoice_date) = ? 
       ORDER BY created_at DESC`,
      [date]
    );

    const [purchaseInvoices] = await db.execute(
      `SELECT * FROM purchase_invoices 
       WHERE DATE(invoice_date) = ? 
       ORDER BY created_at DESC`,
      [date]
    );

    const totalRevenue = salesInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_revenue || 0), 0);
    const totalCost = purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_cost || 0), 0);

    return {
      date,
      total_revenue: totalRevenue,
      total_cost: totalCost,
      profit: totalRevenue - totalCost,
      sales_invoices: salesInvoices,
      purchase_invoices: purchaseInvoices,
    };
  },
};

module.exports = Report;



