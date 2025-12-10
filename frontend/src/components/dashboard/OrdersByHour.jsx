import { useState, useEffect } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { dashboardAPI } from "../../services/api";

const OrdersByHour = () => {
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchOrdersByHour();
    
    // Cập nhật thời gian hiện tại mỗi phút
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const fetchOrdersByHour = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getOrdersByHour();
      setHourlyData(response.data);
      setCurrentTime(new Date()); // Cập nhật thời gian khi fetch data
    } catch (error) {
      console.error("Error fetching orders by hour:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxOrders = Math.max(...hourlyData.map(d => d.order_count), 1);
  const currentHour = currentTime.getHours();
  const todayDate = currentTime.toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Clock className="mr-2 text-purple-600" size={20} />
            Đơn hàng theo giờ (Hôm nay)
          </h3>
          <p className="text-sm text-gray-500 mt-1">{todayDate}</p>
          <p className="text-xs text-gray-400">
            Hiện tại: {currentTime.toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <button
          onClick={fetchOrdersByHour}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Đang tải...</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {hourlyData.filter(d => d.order_count > 0).map((data) => (
            <div key={data.hour} className="flex items-center space-x-2">
              <span className={`text-xs w-12 font-medium ${
                data.hour === currentHour ? 'text-purple-600 bg-purple-50 px-2 py-1 rounded' : 'text-gray-600'
              }`}>
                {data.hour}:00
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className={`h-6 rounded-full flex items-center justify-end pr-2 ${
                    data.hour === currentHour ? 'bg-purple-600' : 'bg-purple-500'
                  }`}
                  style={{ width: `${(data.order_count / maxOrders) * 100}%`, minWidth: data.order_count > 0 ? '30px' : '0' }}
                >
                  <span className="text-xs text-white font-medium">
                    {data.order_count}
                  </span>
                </div>
              </div>
              {data.hour === currentHour && (
                <span className="text-xs text-purple-600 font-medium">Hiện tại</span>
              )}
            </div>
          ))}
          {hourlyData.every(d => d.order_count === 0) && (
            <div className="text-center py-4 text-gray-500">
              <Clock size={24} className="mx-auto mb-2 text-gray-300" />
              Chưa có đơn hàng hôm nay
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersByHour;
