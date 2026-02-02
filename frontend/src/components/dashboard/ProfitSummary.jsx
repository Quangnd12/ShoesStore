import { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag,
  Package,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { salesInvoicesAPI, purchaseInvoicesAPI, reportsAPI } from "../../services/api";

const ProfitSummary = () => {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalCost: 0,
    profit: 0,
    profitMargin: 0,
    salesCount: 0,
    purchaseCount: 0,
    avgOrderValue: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      
      let startDate, endDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      }
      endDate = today;

      const [salesRes, purchaseRes] = await Promise.all([
        salesInvoicesAPI.getAll({ limit: 1000 }),
        purchaseInvoicesAPI.getAll({ limit: 1000 })
      ]);

      const salesInvoices = salesRes.data?.invoices || [];
      const purchaseInvoices = purchaseRes.data?.invoices || [];

      // Filter by date range
      const filteredSales = salesInvoices.filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return invDate >= startDate && invDate <= endDate;
      });

      const filteredPurchases = purchaseInvoices.filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return invDate >= startDate && invDate <= endDate;
      });

      // Calculate totals
      const totalRevenue = filteredSales.reduce((sum, inv) => 
        sum + (parseFloat(inv.final_amount) || parseFloat(inv.total_revenue) || 0), 0);
      
      const totalCost = filteredPurchases.reduce((sum, inv) => 
        sum + (parseFloat(inv.total_cost) || 0), 0);

      const profit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      const avgOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

      // Calculate growth (compare with previous period)
      let prevStartDate, prevEndDate;
      const periodDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      prevStartDate = new Date(prevEndDate);
      prevStartDate.setDate(prevStartDate.getDate() - periodDays);

      const prevSales = salesInvoices.filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return invDate >= prevStartDate && invDate <= prevEndDate;
      });

      const prevRevenue = prevSales.reduce((sum, inv) => 
        sum + (parseFloat(inv.final_amount) || parseFloat(inv.total_revenue) || 0), 0);

      const revenueGrowth = prevRevenue > 0 
        ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
        : (totalRevenue > 0 ? 100 : 0);

      setData({
        totalRevenue,
        totalCost,
        profit,
        profitMargin,
        salesCount: filteredSales.length,
        purchaseCount: filteredPurchases.length,
        avgOrderValue,
        revenueGrowth
      });
    } catch (error) {
      console.error("Error fetching profit data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const StatItem = ({ icon: Icon, label, value, subValue, color, trend }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
        {subValue && (
          <p className={`text-xs flex items-center gap-1 ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400'
          }`}>
            {trend === 'up' && <ArrowUpRight size={12} />}
            {trend === 'down' && <ArrowDownRight size={12} />}
            {subValue}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <DollarSign size={18} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Tổng quan lợi nhuận</h3>
            <p className="text-xs text-gray-400">Phân tích tài chính</p>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { id: 'week', label: 'Tuần' },
            { id: 'month', label: 'Tháng' },
            { id: 'year', label: 'Năm' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                period === p.id 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Main Profit Card */}
            <div className={`p-4 rounded-xl mb-4 ${
              data.profit >= 0 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                : 'bg-gradient-to-r from-red-500 to-orange-500'
            }`}>
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm opacity-90">Lợi nhuận ròng</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(data.profit)}đ
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    data.profitMargin >= 0 ? 'bg-white/20' : 'bg-white/20'
                  }`}>
                    <Percent size={12} />
                    {data.profitMargin.toFixed(1)}% margin
                  </div>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${
                    data.revenueGrowth >= 0 ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {data.revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(1)}% vs kỳ trước
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatItem 
                icon={TrendingUp}
                label="Doanh thu"
                value={`${formatCurrency(data.totalRevenue)}đ`}
                subValue={`${data.salesCount} đơn hàng`}
                color="bg-blue-500"
              />
              <StatItem 
                icon={Package}
                label="Chi phí nhập"
                value={`${formatCurrency(data.totalCost)}đ`}
                subValue={`${data.purchaseCount} hóa đơn`}
                color="bg-orange-500"
              />
              <StatItem 
                icon={ShoppingBag}
                label="Giá trị TB/đơn"
                value={`${formatCurrency(Math.round(data.avgOrderValue))}đ`}
                color="bg-purple-500"
              />
              <StatItem 
                icon={Percent}
                label="Biên lợi nhuận"
                value={`${data.profitMargin.toFixed(1)}%`}
                subValue={data.profitMargin >= 20 ? 'Tốt' : data.profitMargin >= 10 ? 'Trung bình' : 'Cần cải thiện'}
                color={data.profitMargin >= 20 ? 'bg-emerald-500' : data.profitMargin >= 10 ? 'bg-yellow-500' : 'bg-red-500'}
                trend={data.profitMargin >= 20 ? 'up' : data.profitMargin >= 10 ? null : 'down'}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfitSummary;
