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
      
      // Validate dữ liệu trả về
      if (response.data && Array.isArray(response.data)) {
        setHourlyData(response.data);
      } else {
        console.warn("Invalid data format from orders by hour API:", response.data);
        setHourlyData([]);
      }
      
      setCurrentTime(new Date()); // Cập nhật thời gian khi fetch data
    } catch (error) {
      console.error("Error fetching orders by hour:", error);
      setHourlyData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Tính max orders an toàn
  const maxOrders = hourlyData.length > 0 
    ? Math.max(...hourlyData.map(d => d.order_count || 0), 1)
    : 1;
  const currentHour = currentTime.getHours();
  
  // Format ngày tháng an toàn
  const formatDate = (date) => {
    try {
      return date.toLocaleDateString('vi-VN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      // Fallback nếu locale không hỗ trợ
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                     'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
  };

  // Format thời gian an toàn
  const formatTime = (date) => {
    try {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    } catch (error) {
      // Fallback
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  };

  const todayDate = formatDate(currentTime);
  const currentTimeString = formatTime(currentTime);

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
            Hiện tại: {currentTimeString}
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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {hourlyData.filter(d => (d.order_count || 0) > 0).map((data) => (
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
                  style={{ 
                    width: `${((data.order_count || 0) / maxOrders) * 100}%`, 
                    minWidth: (data.order_count || 0) > 0 ? '30px' : '0' 
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {data.order_count || 0}
                  </span>
                </div>
              </div>
              {data.hour === currentHour && (
                <span className="text-xs text-purple-600 font-medium">Hiện tại</span>
              )}
            </div>
          ))}
          {hourlyData.every(d => (d.order_count || 0) === 0) && (
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
