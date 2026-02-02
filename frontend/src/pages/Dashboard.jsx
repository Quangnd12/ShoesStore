import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  FileText,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Activity,
  PieChart,
  Clock,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../components/dashboard/StatCard";
import TopSellingProducts from "../components/dashboard/TopSellingProducts";
import OrdersByHour from "../components/dashboard/OrdersByHour";
import LowStockAlert from "../components/dashboard/LowStockAlert";
import RevenueGrowth from "../components/dashboard/RevenueGrowth";
import RecentActivities from "../components/dashboard/RecentActivities";
import TopCategories from "../components/dashboard/TopCategories";
import CategoryStats from "../components/dashboard/CategoryStats";
import ProfitSummary from "../components/dashboard/ProfitSummary";
import LoadingSpinner from "../components/LoadingSpinner";
import SkeletonLoader from "../components/SkeletonLoader";
import ScrollToTopButton from "../components/ScrollToTopButton";

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
  const [chartTab, setChartTab] = useState("day");
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  
  // Main dashboard tab
  const [activeSection, setActiveSection] = useState("overview");

  // Cache states
  const [statsCache, setStatsCache] = useState(null);
  const [chartCache, setChartCache] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [chartTab]);

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
      const today = new Date();
      const cacheKey = `${chartTab}-${today.toISOString().split("T")[0]}`;
      
      const CACHE_DURATION = 10 * 60 * 1000;
      const now = Date.now();

      if (!forceRefresh && chartCache[cacheKey] && (now - chartCache[cacheKey].timestamp < CACHE_DURATION)) {
        setChartData(chartCache[cacheKey].data);
        setChartLoading(false);
        return;
      }

      let data = [];

      switch (chartTab) {
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
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      trend: { value: 5.2, isPositive: true },
      subtitle: "Tổng số lượng tồn kho"
    },
    {
      title: "Nhà cung cấp",
      value: stats.totalSuppliers,
      icon: Truck,
      color: "bg-green-500",
      subtitle: "Đối tác cung cấp"
    },
    {
      title: "Hóa đơn nhập",
      value: stats.totalPurchaseInvoices,
      icon: FileText,
      color: "bg-yellow-500",
      subtitle: "Tổng số hóa đơn nhập"
    },
    {
      title: "Hóa đơn bán",
      value: stats.totalSalesInvoices,
      icon: ShoppingCart,
      color: "bg-purple-500",
      subtitle: "Tổng số hóa đơn bán"
    },
    {
      title: "Sản phẩm sắp hết",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: stats.lowStockProducts > 10 ? "bg-red-500" : "bg-orange-500",
      subtitle: "Cần nhập thêm hàng"
    },
    {
      title: "Doanh thu",
      value: new Intl.NumberFormat("vi-VN").format(stats.totalRevenue) + " đ",
      icon: DollarSign,
      color: "bg-indigo-500",
      trend: { value: 12.5, isPositive: true },
      subtitle: "Tổng doanh thu"
    },
  ];

  const chartTabs = [
    { id: "day", label: "Ngày" },
    { id: "month", label: "Tháng" },
    { id: "year", label: "Năm" },
  ];

  // Main section tabs
  const sectionTabs = [
    { id: "overview", label: "Tổng quan", icon: BarChart3 },
    { id: "analytics", label: "Phân tích", icon: PieChart },
    { id: "inventory", label: "Kho hàng", icon: Package },
    { id: "activities", label: "Hoạt động", icon: Clock },
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
      {/* Header */}
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

      {/* Stat Cards - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            trend={card.trend}
            subtitle={card.subtitle}
            loading={loading}
          />
        ))}
      </div>

      {/* Section Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-100">
          <nav className="flex overflow-x-auto">
            {sectionTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
                    activeSection === tab.id
                      ? "border-blue-600 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Profit & Recent Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfitSummary />
                <RecentActivities />
              </div>

              {/* Chart */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Biểu đồ doanh thu</h3>
                  <div className="flex bg-white rounded-lg p-1 shadow-sm">
                    {chartTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setChartTab(tab.id)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                          chartTab === tab.id
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {chartLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <LoadingSpinner size="large" message="Đang tải..." />
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis 
                        tickFormatter={(value) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(value)}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "Doanh thu (đ)") {
                            return [new Intl.NumberFormat("vi-VN").format(value) + " ₫", name];
                          }
                          return [value, name];
                        }}
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                      />
                      <Legend />
                      <Bar dataKey="doanh_thu" fill="#3b82f6" name="Doanh thu (đ)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="hóa_đơn" fill="#10b981" name="Số hóa đơn" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    Không có dữ liệu
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopCategories />
                <RevenueGrowth />
              </div>
              <CategoryStats />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopSellingProducts />
                <OrdersByHour />
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeSection === "inventory" && (
            <div className="space-y-6">
              <LowStockAlert />
              
              {/* Quick Stats Summary */}
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4 opacity-90">Tóm tắt kho hàng</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <p className="text-sm opacity-80">Tổng sản phẩm</p>
                    <p className="text-2xl font-bold mt-1">
                      {new Intl.NumberFormat('vi-VN').format(stats.totalProducts)}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <p className="text-sm opacity-80">Nhà cung cấp</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalSuppliers}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <p className="text-sm opacity-80">Hóa đơn nhập</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalPurchaseInvoices}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <p className="text-sm opacity-80">Sắp hết hàng</p>
                    <p className="text-2xl font-bold mt-1 flex items-center gap-2">
                      {stats.lowStockProducts}
                      {stats.lowStockProducts > 5 && (
                        <AlertTriangle size={20} className="text-yellow-300 animate-pulse" />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeSection === "activities" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivities />
                <OrdersByHour />
              </div>
              
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton showAfter={200} />
    </div>
  );
};

export default Dashboard;
