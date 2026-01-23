import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Package, ShoppingCart } from "lucide-react";
import { salesInvoicesAPI, categoriesAPI } from "../../services/api";

const CategoryStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCategories, setTotalCategories] = useState(0);

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách categories
      const categoriesResponse = await categoriesAPI.getAll();
      const categories = categoriesResponse.data || [];
      setTotalCategories(categories.length);

      // Lấy dữ liệu hóa đơn bán
      const response = await salesInvoicesAPI.getAll({ limit: 1000 });
      const invoices = response.data?.invoices || [];

      // Tạo map để tính toán thống kê
      const categoryMap = new Map();
      
      // Khởi tạo tất cả categories với giá trị 0
      categories.forEach(cat => {
        categoryMap.set(cat.name, {
          name: cat.name,
          revenue: 0,
          quantity: 0,
          orders: 0
        });
      });

      // Tính toán dữ liệu từ hóa đơn
      for (const invoice of invoices) {
        try {
          const detailResponse = await salesInvoicesAPI.getById(invoice.id);
          const items = detailResponse.data?.items || [];
          
          items.forEach(item => {
            const categoryName = item.category_name || 'Chưa phân loại';
            
            if (!categoryMap.has(categoryName)) {
              categoryMap.set(categoryName, {
                name: categoryName,
                revenue: 0,
                quantity: 0,
                orders: 0
              });
            }
            
            const existing = categoryMap.get(categoryName);
            existing.revenue += (item.quantity || 0) * (item.unit_price || 0);
            existing.quantity += item.quantity || 0;
            existing.orders += 1;
          });
        } catch (error) {
          console.log(`Error fetching items for invoice ${invoice.id}`);
        }
      }

      // Chuyển đổi thành array và sắp xếp
      const statsData = Array.from(categoryMap.values())
        .filter(item => item.revenue > 0) // Chỉ hiển thị categories có doanh thu
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); // Top 10

      setData(statsData);
    } catch (error) {
      console.error("Error fetching category stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-100">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              Doanh thu: {new Intl.NumberFormat('vi-VN').format(data.revenue)}đ
            </p>
            <p className="text-sm text-green-600">
              Số lượng: {data.quantity} sản phẩm
            </p>
            <p className="text-sm text-purple-600">
              Đơn hàng: {data.orders}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp size={18} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Thống kê danh mục</h3>
              <p className="text-xs text-gray-400">Top 10 danh mục theo doanh thu</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Tổng danh mục</p>
            <p className="text-lg font-bold text-blue-600">{totalCategories}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-gray-400">
            <Package size={40} className="mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">Chưa có dữ liệu bán hàng</p>
            <p className="text-sm text-center max-w-xs">
              Tạo hóa đơn bán hàng để xem thống kê chi tiết theo danh mục
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="revenue" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  name="Doanh thu"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary */}
      {data.length > 0 && (
        <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Tổng doanh thu</p>
              <p className="font-bold text-blue-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}đ
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tổng sản phẩm</p>
              <p className="font-bold text-green-600">
                {data.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tổng đơn hàng</p>
              <p className="font-bold text-purple-600">
                {data.reduce((sum, item) => sum + item.orders, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryStats;