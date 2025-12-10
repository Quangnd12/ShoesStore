const db = require("../config/db");

const DashboardController = {
  // Top sản phẩm bán chạy
  getTopSellingProducts: async (req, res) => {
    try {
      const { period = "day", limit = 5 } = req.query;
      const limitInt = parseInt(limit);
      
      let dateCondition = "";
      
      switch (period) {
        case "day":
          dateCondition = "DATE(si.invoice_date) = CURDATE()";
          break;
        case "week":
          dateCondition = "YEARWEEK(si.invoice_date) = YEARWEEK(CURDATE())";
          break;
        case "month":
          dateCondition = "YEAR(si.invoice_date) = YEAR(CURDATE()) AND MONTH(si.invoice_date) = MONTH(CURDATE())";
          break;
        default:
          dateCondition = "DATE(si.invoice_date) = CURDATE()";
      }

      const [rows] = await db.execute(
        `SELECT 
          p.id,
          p.name,
          p.image_url,
          p.price,
          SUM(sii.quantity) as total_sold,
          SUM(sii.total_price) as total_revenue
        FROM sales_invoice_items sii
        JOIN sales_invoices si ON sii.sales_invoice_id = si.id
        JOIN products p ON sii.product_id = p.id
        WHERE ${dateCondition}
        GROUP BY p.id, p.name, p.image_url, p.price
        ORDER BY total_sold DESC
        LIMIT ${limitInt}`
      );

      res.json(rows);
    } catch (error) {
      console.error("Error fetching top selling products:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Tỷ lệ đơn hàng theo giờ trong ngày
  getOrdersByHour: async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT 
          HOUR(invoice_date) as hour,
          COUNT(*) as order_count,
          SUM(total_revenue) as revenue
        FROM sales_invoices
        WHERE DATE(invoice_date) = CURDATE()
        GROUP BY HOUR(invoice_date)
        ORDER BY hour`
      );

      // Tạo array 24 giờ, fill 0 cho giờ không có đơn
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        order_count: 0,
        revenue: 0,
      }));

      rows.forEach((row) => {
        hourlyData[row.hour] = {
          hour: row.hour,
          order_count: row.order_count,
          revenue: parseFloat(row.revenue) || 0,
        };
      });

      res.json(hourlyData);
    } catch (error) {
      console.error("Error fetching orders by hour:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Sản phẩm tồn kho thấp
  getLowStockProducts: async (req, res) => {
    try {
      const { threshold = 10, limit = 10 } = req.query;
      const thresholdInt = parseInt(threshold);
      const limitInt = parseInt(limit);

      const [rows] = await db.execute(
        `SELECT 
          p.id,
          p.name,
          p.image_url,
          p.stock_quantity,
          p.size,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.stock_quantity <= ?
        ORDER BY p.stock_quantity ASC
        LIMIT ${limitInt}`,
        [thresholdInt]
      );

      res.json(rows);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Tỷ lệ tăng trưởng doanh thu
  getRevenueGrowth: async (req, res) => {
    try {
      const { period = "day" } = req.query;

      let currentQuery, previousQuery;

      switch (period) {
        case "day":
          currentQuery = "DATE(invoice_date) = CURDATE()";
          previousQuery = "DATE(invoice_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
          break;
        case "week":
          currentQuery = "YEARWEEK(invoice_date) = YEARWEEK(CURDATE())";
          previousQuery = "YEARWEEK(invoice_date) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK))";
          break;
        case "month":
          currentQuery = "YEAR(invoice_date) = YEAR(CURDATE()) AND MONTH(invoice_date) = MONTH(CURDATE())";
          previousQuery = "YEAR(invoice_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND MONTH(invoice_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))";
          break;
        default:
          currentQuery = "DATE(invoice_date) = CURDATE()";
          previousQuery = "DATE(invoice_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
      }

      // Doanh thu hiện tại
      const [currentRows] = await db.execute(
        `SELECT 
          COALESCE(SUM(total_revenue), 0) as revenue,
          COUNT(*) as order_count
        FROM sales_invoices
        WHERE ${currentQuery}`
      );

      // Doanh thu kỳ trước
      const [previousRows] = await db.execute(
        `SELECT 
          COALESCE(SUM(total_revenue), 0) as revenue,
          COUNT(*) as order_count
        FROM sales_invoices
        WHERE ${previousQuery}`
      );

      const current = currentRows[0];
      const previous = previousRows[0];

      const revenueGrowth = previous.revenue > 0
        ? ((current.revenue - previous.revenue) / previous.revenue) * 100
        : current.revenue > 0 ? 100 : 0;

      const orderGrowth = previous.order_count > 0
        ? ((current.order_count - previous.order_count) / previous.order_count) * 100
        : current.order_count > 0 ? 100 : 0;

      res.json({
        current: {
          revenue: parseFloat(current.revenue),
          order_count: current.order_count,
        },
        previous: {
          revenue: parseFloat(previous.revenue),
          order_count: previous.order_count,
        },
        growth: {
          revenue: parseFloat(revenueGrowth.toFixed(2)),
          orders: parseFloat(orderGrowth.toFixed(2)),
        },
        period: period,
      });
    } catch (error) {
      console.error("Error fetching revenue growth:", error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = DashboardController;
