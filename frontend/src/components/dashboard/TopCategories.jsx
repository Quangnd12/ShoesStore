import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { FolderOpen, TrendingUp } from "lucide-react";
import { salesInvoicesAPI } from "../../services/api";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const TopCategories = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await salesInvoicesAPI.getAll({ limit: 1000 });
      const invoices = response.data?.invoices || [];

      // Aggregate by category from invoice items
      const categoryMap = new Map();
      let total = 0;

      invoices.forEach(invoice => {
        if (invoice.items && Array.isArray(invoice.items)) {
          invoice.items.forEach(item => {
            const categoryName = item.category_name || 'Chưa phân loại';
            const revenue = (item.quantity || 0) * (item.unit_price || 0);
            total += revenue;

            if (categoryMap.has(categoryName)) {
              categoryMap.set(categoryName, categoryMap.get(categoryName) + revenue);
            } else {
              categoryMap.set(categoryName, revenue);
            }
          });
        }
      });

      // Convert to array and sort
      const categoryData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      setData(categoryData);
      setTotalRevenue(total);
    } catch (error) {
      console.error("Error fetching category data:", error);
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalRevenue > 0 ? ((data.value / totalRevenue) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-100">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            {new Intl.NumberFormat('vi-VN').format(data.value)}đ
          </p>
          <p className="text-xs text-gray-400">{percentage}% tổng doanh thu</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <FolderOpen size={18} className="text-indigo-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Danh mục bán chạy</h3>
            <p className="text-xs text-gray-400">Phân bố doanh thu theo danh mục</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <FolderOpen size={40} className="mb-2 opacity-50" />
            <p>Chưa có dữ liệu danh mục</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-4">
            {/* Pie Chart */}
            <div className="w-full lg:w-1/2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend List */}
            <div className="w-full lg:w-1/2 space-y-2">
              {data.map((item, index) => {
                const percentage = totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : 0;
                return (
                  <div 
                    key={item.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        {formatCurrency(item.value)}đ
                      </p>
                      <p className="text-xs text-gray-400">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {totalRevenue > 0 && (
        <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tổng doanh thu</span>
            <span className="font-bold text-indigo-600">
              {new Intl.NumberFormat('vi-VN').format(totalRevenue)}đ
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopCategories;
