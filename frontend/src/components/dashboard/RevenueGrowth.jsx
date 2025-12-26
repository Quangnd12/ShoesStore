import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { dashboardAPI } from "../../services/api";

const RevenueGrowth = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("day");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrowth();
  }, [period]);

  const fetchGrowth = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getRevenueGrowth({ period });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching growth:", error);
    } finally {
      setLoading(false);
    }
  };

  const periodLabels = {
    day: { current: "Hôm nay", previous: "Hôm qua" },
    week: { current: "Tuần này", previous: "Tuần trước" },
    month: { current: "Tháng này", previous: "Tháng trước" },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Tăng trưởng doanh thu</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="day">Theo ngày</option>
          <option value="week">Theo tuần</option>
          <option value="month">Theo tháng</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-4">Đang tải...</div>
      ) : data ? (
        <div className="space-y-4">
          {/* Doanh thu */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Doanh thu</span>
              <div className="flex items-center space-x-2">
                {data.growth.revenue >= 0 ? (
                  <TrendingUp className="text-green-600" size={16} />
                ) : (
                  <TrendingDown className="text-red-600" size={16} />
                )}
                <span className={`text-sm font-bold ${data.growth.revenue >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {data.growth.revenue >= 0 ? "+" : ""}{data.growth.revenue}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-gray-600">{periodLabels[period].current}</p>
                <p className="text-lg font-bold text-blue-600">
                  {new Intl.NumberFormat("vi-VN").format(data.current.revenue)} ₫
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">{periodLabels[period].previous}</p>
                <p className="text-lg font-bold text-gray-600">
                  {new Intl.NumberFormat("vi-VN").format(data.previous.revenue)} ₫
                </p>
              </div>
            </div>
          </div>

          {/* Số đơn hàng */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Số đơn hàng</span>
              <div className="flex items-center space-x-2">
                {data.growth.orders >= 0 ? (
                  <TrendingUp className="text-green-600" size={16} />
                ) : (
                  <TrendingDown className="text-red-600" size={16} />
                )}
                <span className={`text-sm font-bold ${data.growth.orders >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {data.growth.orders >= 0 ? "+" : ""}{data.growth.orders}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-xs text-gray-600">{periodLabels[period].current}</p>
                <p className="text-lg font-bold text-purple-600">
                  {data.current.order_count} đơn
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">{periodLabels[period].previous}</p>
                <p className="text-lg font-bold text-gray-600">
                  {data.previous.order_count} đơn
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RevenueGrowth;
