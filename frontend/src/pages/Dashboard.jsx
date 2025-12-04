import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  FileText,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import {
  reportsAPI,
  productsAPI,
  suppliersAPI,
  purchaseInvoicesAPI,
  salesInvoicesAPI,
} from "../services/api";
import { useToast } from "../contexts/ToastContext";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import TopSellingProducts from "../components/dashboard/TopSellingProducts";
import OrdersByHour from "../components/dashboard/OrdersByHour";
import LowStockAlert from "../components/dashboard/LowStockAlert";
import RevenueGrowth from "../components/dashboard/RevenueGrowth";
import LoadingSpinner from "../components/LoadingSpinner";
import SkeletonLoader from "../components/SkeletonLoader";

const Dashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    totalPurchaseInvoices: 0,
    totalSalesInvoices: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("day");
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Cache states
  const [statsCache, setStatsCache] = useState(null);
  const [chartCache, setChartCache] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [activeTab]);

  const fetchStats = async (forceRefresh = false) => {
    try {
      // Kiểm tra cache (5 phút = 300000ms)
      const CACHE_DURATION = 5 * 60 * 1000;
      const now = Date.now();

      if (!forceRefresh && statsCache && (now - statsCache.timestamp < CACHE_DURATION)) {
        setStats(statsCache.data);
        setLoading(false);
        return;
      }

      const [productsRes, suppliersRes, purchaseInvoicesRes, salesInvoicesRes] =
        await Promise.all([
          productsAPI.getAll({ limit: 1000 }),
          suppliersAPI.getAll(),
          purchaseInvoicesAPI.getAll({ limit: 1000 }),
          salesInvoicesAPI.getAll({ limit: 1000 }),
        ]);

      const allProducts = productsRes.data?.products || productsRes.data || [];
      const productsArray = Array.isArray(allProducts) ? allProducts : [];
      const lowStock = productsArray.filter((p) => p.stock_quantity < 10) || [];

      // Tính tổng sản phẩm còn tồn kho (chỉ tính những sản phẩm có stock_quantity > 0)
      const totalProductsInStock = productsArray.reduce((sum, product) => {
        const stock = Number(product.stock_quantity) || 0;
        return sum + stock;
      }, 0);

      const suppliersArray = Array.isArray(suppliersRes.data)
        ? suppliersRes.data
        : [];

      const purchaseInvoicesArray =
        purchaseInvoicesRes.data?.invoices || purchaseInvoicesRes.data || [];
      const salesInvoicesArray =
        salesInvoicesRes.data?.invoices || salesInvoicesRes.data || [];

      const totalRevenue = Array.isArray(salesInvoicesArray)
        ? salesInvoicesArray.reduce((sum, invoice) => {
            const rawValue =
              invoice && typeof invoice.total_revenue !== "undefined"
                ? invoice.total_revenue
                : 0;
            const numericValue = Number(rawValue) || 0;
            return sum + numericValue;
          }, 0)
        : 0;

      const statsData = {
        totalProducts: totalProductsInStock,
        totalSuppliers: suppliersArray.length,
        totalPurchaseInvoices:
          purchaseInvoicesRes.data?.totalItems || purchaseInvoicesArray.length,
        totalSalesInvoices:
          salesInvoicesRes.data?.totalItems || salesInvoicesArray.length,
        totalRevenue,
        lowStockProducts: lowStock.length,
      };

      setStats(statsData);
      
      // Lưu vào cache
      setStatsCache({
        data: statsData,
        timestamp: now,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      showToast("Không thể tải thống kê", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (forceRefresh = false) => {
    setChartLoading(true);
    try {
      // Tạo cache key dựa trên activeTab và ngày hiện tại
      const today = new Date();
      const cacheKey = `${activeTab}-${today.toISOString().split("T")[0]}`;
      
      // Kiểm tra cache (10 phút = 600000ms)
      const CACHE_DURATION = 10 * 60 * 1000;
      const now = Date.now();

      if (!forceRefresh && chartCache[cacheKey] && (now - chartCache[cacheKey].timestamp < CACHE_DURATION)) {
        setChartData(chartCache[cacheKey].data);
        setChartLoading(false);
        return;
      }

      let data = [];

      switch (activeTab) {
        case "day":
          const date = today.toISOString().split("T")[0];
          const dailyReport = await reportsAPI.getDaily(date);
          data = [
            {
              name: "Hôm nay",
              doanh_thu: dailyReport.data?.total_revenue || 0,
              hóa_đơn: dailyReport.data?.total_invoices || 0,
            },
          ];
          break;

        case "week":
          const weekNumber = getWeekNumber(today);
          const weeklyReport = await reportsAPI.getWeekly(
            today.getFullYear(),
            weekNumber
          );
          if (weeklyReport.data?.daily_data) {
            data = weeklyReport.data.daily_data.map((item) => ({
              name: `Ngày ${new Date(item.date).getDate()}`,
              doanh_thu: item.total_revenue || 0,
              hóa_đơn: item.total_invoices || 0,
            }));
          }
          break;

        case "month":
          const monthlyReport = await reportsAPI.getMonthly(
            today.getFullYear(),
            today.getMonth() + 1
          );
          if (monthlyReport.data?.daily_data) {
            data = monthlyReport.data.daily_data.map((item) => ({
              name: `Ngày ${new Date(item.date).getDate()}`,
              doanh_thu: item.total_revenue || 0,
              hóa_đơn: item.total_invoices || 0,
            }));
          }
          break;

        case "year":
          const yearlyReport = await reportsAPI.getYearly(today.getFullYear());
          if (yearlyReport.data?.monthly_data) {
            data = yearlyReport.data.monthly_data.map((item) => ({
              name: `Tháng ${item.month}`,
              doanh_thu: item.total_revenue || 0,
              hóa_đơn: item.total_invoices || 0,
            }));
          }
          break;
      }

      setChartData(data);
      
      // Lưu vào cache
      setChartCache((prev) => ({
        ...prev,
        [cacheKey]: {
          data: data,
          timestamp: now,
        },
      }));
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const getWeekNumber = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const statCards = [
    {
      title: "Tổng sản phẩm",
      value: new Intl.NumberFormat("vi-VN").format(stats.totalProducts),
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Nhà cung cấp",
      value: stats.totalSuppliers,
      icon: Truck,
      color: "bg-green-500",
    },
    {
      title: "Hóa đơn nhập",
      value: stats.totalPurchaseInvoices,
      icon: FileText,
      color: "bg-yellow-500",
    },
    {
      title: "Hóa đơn bán",
      value: stats.totalSalesInvoices,
      icon: ShoppingCart,
      color: "bg-purple-500",
    },
    {
      title: "Sản phẩm sắp hết",
      value: stats.lowStockProducts,
      icon: TrendingUp,
      color: "bg-red-500",
    },
    {
      title: "Doanh thu",
      value: new Intl.NumberFormat("vi-VN").format(stats.totalRevenue) + " đ",
      icon: DollarSign,
      color: "bg-indigo-500",
    },
  ];

  const tabs = [
    { id: "day", label: "Ngày" },
    { id: "month", label: "Tháng" },
    { id: "year", label: "Năm" },
  ];

  if (loading && !statsCache) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SkeletonLoader type="card" count={6} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SkeletonLoader type="widget" count={2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SkeletonLoader type="widget" count={2} />
        </div>

        <SkeletonLoader type="chart" />
      </div>
    );
  }

  const handleRefresh = async () => {
    setLoading(true);
    setChartLoading(true);
    await Promise.all([
      fetchStats(true),
      fetchChartData(true),
    ]);
    showToast("Đã làm mới dữ liệu", "success");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={loading || chartLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={loading || chartLoading ? "animate-spin" : ""} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Widgets Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TopSellingProducts />
        <RevenueGrowth />
      </div>

      {/* New Widgets Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrdersByHour />
        <LowStockAlert />
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Biểu đồ thống kê
          </h2>
          {chartCache[`${activeTab}-${new Date().toISOString().split("T")[0]}`] && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              📦 Cached
            </span>
          )}
        </div>

        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {chartLoading ? (
          <LoadingSpinner size="large" message="Đang tải dữ liệu biểu đồ..." />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(value)}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "Doanh thu (đ)") {
                    return [new Intl.NumberFormat("vi-VN").format(value) + " ₫", name];
                  }
                  return [value, name];
                }}
                labelStyle={{ color: "#374151", fontWeight: "bold" }}
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
              />
              <Legend />
              <Bar dataKey="doanh_thu" fill="#3b82f6" name="Doanh thu (đ)" />
              <Bar dataKey="hóa_đơn" fill="#10b981" name="Số hóa đơn" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Không có dữ liệu để hiển thị
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
