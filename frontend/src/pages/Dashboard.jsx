import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  FileText,
  ShoppingCart,
  TrendingUp,
  DollarSign,
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

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [productsRes, suppliersRes, purchaseInvoicesRes, salesInvoicesRes] =
        await Promise.all([
          productsAPI.getAll({ limit: 1000 }),
          suppliersAPI.getAll(),
          purchaseInvoicesAPI.getAll({ limit: 1000 }),
          salesInvoicesAPI.getAll({ limit: 1000 }),
        ]);

      const allProducts =
        productsRes.data?.products || productsRes.data || [];
      const productsArray = Array.isArray(allProducts) ? allProducts : [];
      const lowStock = productsArray.filter((p) => p.stock_quantity < 10) || [];

      const suppliersArray = Array.isArray(suppliersRes.data)
        ? suppliersRes.data
        : [];

      const purchaseInvoicesArray =
        purchaseInvoicesRes.data?.invoices || purchaseInvoicesRes.data || [];
      const salesInvoicesArray =
        salesInvoicesRes.data?.invoices || salesInvoicesRes.data || [];

      const totalRevenue = Array.isArray(salesInvoicesArray)
        ? salesInvoicesArray.reduce(
            (sum, invoice) => sum + (invoice.total_revenue || 0),
            0
          )
        : 0;

      setStats({
        totalProducts:
          productsRes.data?.totalItems || productsArray.length,
        totalSuppliers: suppliersArray.length,
        totalPurchaseInvoices:
          purchaseInvoicesRes.data?.totalItems || purchaseInvoicesArray.length,
        totalSalesInvoices:
          salesInvoicesRes.data?.totalItems || salesInvoicesArray.length,
        totalRevenue,
        lowStockProducts: lowStock.length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      showToast("Không thể tải thống kê", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    setChartLoading(true);
    try {
      const today = new Date();
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
      value:
        new Intl.NumberFormat("vi-VN").format(stats.totalRevenue) + " đ",
      icon: DollarSign,
      color: "bg-indigo-500",
    },
  ];

  const tabs = [
    { id: "day", label: "Ngày" },
    { id: "week", label: "Tuần" },
    { id: "month", label: "Tháng" },
    { id: "year", label: "Năm" },
  ];

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

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

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Biểu đồ thống kê
        </h2>

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
          <div className="text-center py-12">Đang tải dữ liệu...</div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
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
