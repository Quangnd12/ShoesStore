import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { dashboardAPI } from "../../services/api";

const OrdersByHour = () => {
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrdersByHour();
  }, []);

  const fetchOrdersByHour = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getOrdersByHour();
      setHourlyData(response.data);
    } catch (error) {
      console.error("Error fetching orders by hour:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxOrders = Math.max(...hourlyData.map(d => d.order_count), 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold flex items-center mb-4">
        <Clock className="mr-2 text-purple-600" size={20} />
        Đơn hàng theo giờ (Hôm nay)
      </h3>

      {loading ? (
        <div className="text-center py-4">Đang tải...</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {hourlyData.filter(d => d.order_count > 0).map((data) => (
            <div key={data.hour} className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 w-12">{data.hour}:00</span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(data.order_count / maxOrders) * 100}%`, minWidth: data.order_count > 0 ? '30px' : '0' }}
                >
                  <span className="text-xs text-white font-medium">
                    {data.order_count}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {hourlyData.every(d => d.order_count === 0) && (
            <div className="text-center py-4 text-gray-500">Chưa có đơn hàng hôm nay</div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersByHour;
