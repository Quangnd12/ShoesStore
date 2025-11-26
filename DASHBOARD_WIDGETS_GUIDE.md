# Hướng dẫn thêm Widgets cho Dashboard

## Tổng quan

Đã tạo backend API cho 4 widgets mới:
1. ✅ **Top sản phẩm bán chạy**
2. ✅ **Tỷ lệ đơn hàng theo giờ**
3. ✅ **Tồn kho thấp (cảnh báo)**
4. ✅ **Tỷ lệ tăng trưởng doanh thu**

## Backend đã hoàn thành

### 1. Controller: `backend/src/controllers/dashboardController.js`

#### API Endpoints:

**GET /api/dashboard/top-selling**
- Query params: `period` (day/week/month), `limit` (default: 5)
- Response: Array sản phẩm bán chạy với total_sold, total_revenue

**GET /api/dashboard/orders-by-hour**
- Response: Array 24 giờ với order_count và revenue

**GET /api/dashboard/low-stock**
- Query params: `threshold` (default: 10), `limit` (default: 10)
- Response: Array sản phẩm tồn kho thấp

**GET /api/dashboard/revenue-growth**
- Query params: `period` (day/week/month)
- Response: So sánh current vs previous với growth percentage

### 2. Routes: `backend/src/routes/dashboard.js`
- Đã tạo routes cho tất cả endpoints
- Có authentication middleware

### 3. App.js
- Đã thêm `app.use("/api/dashboard", dashboardRoutes)`

### 4. Frontend API: `frontend/src/services/api.js`
- Đã thêm `dashboardAPI` với 4 methods

## Frontend Components cần tạo

### 1. TopSellingProducts Component

```jsx
// frontend/src/components/dashboard/TopSellingProducts.jsx
import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { dashboardAPI } from "../../services/api";

const TopSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [period, setPeriod] = useState("day");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopSelling();
  }, [period]);

  const fetchTopSelling = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getTopSelling({ period, limit: 5 });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching top selling:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <TrendingUp className="mr-2 text-green-600" size={20} />
          Sản phẩm bán chạy
        </h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="day">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-4">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-4 text-gray-500">Chưa có dữ liệu</div>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={product.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">{index + 1}</span>
              </div>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">
                  Đã bán: {product.total_sold} • {new Intl.NumberFormat("vi-VN").format(product.total_revenue)} ₫
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopSellingProducts;
```

### 2. OrdersByHour Component

```jsx
// frontend/src/components/dashboard/OrdersByHour.jsx
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
        <div className="space-y-2">
          {hourlyData.filter(d => d.order_count > 0).map((data) => (
            <div key={data.hour} className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 w-12">{data.hour}:00</span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(data.order_count / maxOrders) * 100}%` }}
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
```

### 3. LowStockAlert Component

```jsx
// frontend/src/components/dashboard/LowStockAlert.jsx
import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { dashboardAPI } from "../../services/api";

const LowStockAlert = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getLowStock({ threshold: 10, limit: 10 });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching low stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStockColor = (quantity) => {
    if (quantity === 0) return "text-red-600 bg-red-100";
    if (quantity <= 5) return "text-orange-600 bg-orange-100";
    return "text-yellow-600 bg-yellow-100";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold flex items-center mb-4">
        <AlertTriangle className="mr-2 text-red-600" size={20} />
        Cảnh báo tồn kho thấp
      </h3>

      {loading ? (
        <div className="text-center py-4">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-4 text-green-600">
          ✓ Tất cả sản phẩm đều đủ hàng
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border-l-4 border-red-400">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">
                  {product.category_name} • Size: {product.size || "N/A"}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${getStockColor(product.stock_quantity)}`}>
                {product.stock_quantity === 0 ? "Hết hàng" : `Còn ${product.stock_quantity}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;
```

### 4. RevenueGrowth Component

```jsx
// frontend/src/components/dashboard/RevenueGrowth.jsx
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
```

## Cập nhật Dashboard Page

```jsx
// frontend/src/pages/Dashboard.jsx
import TopSellingProducts from "../components/dashboard/TopSellingProducts";
import OrdersByHour from "../components/dashboard/OrdersByHour";
import LowStockAlert from "../components/dashboard/LowStockAlert";
import RevenueGrowth from "../components/dashboard/RevenueGrowth";

// Thêm vào layout hiện tại
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  <TopSellingProducts />
  <RevenueGrowth />
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  <OrdersByHour />
  <LowStockAlert />
</div>
```

## Testing

### Backend:
```bash
# Test API endpoints
GET http://localhost:5000/api/dashboard/top-selling?period=day&limit=5
GET http://localhost:5000/api/dashboard/orders-by-hour
GET http://localhost:5000/api/dashboard/low-stock?threshold=10
GET http://localhost:5000/api/dashboard/revenue-growth?period=day
```

### Frontend:
1. Tạo các component trong `frontend/src/components/dashboard/`
2. Import vào Dashboard page
3. Test với dữ liệu thật

## Tính năng nâng cao (Tương lai)

1. **Real-time updates**: WebSocket cho cập nhật real-time
2. **Export data**: Xuất báo cáo PDF/Excel
3. **Notifications**: Thông báo khi tồn kho thấp
4. **Customizable**: Cho phép user tùy chỉnh widgets
5. **More charts**: Thêm biểu đồ đường, tròn, etc.

## File đã tạo

### Backend:
- ✅ `backend/src/controllers/dashboardController.js`
- ✅ `backend/src/routes/dashboard.js`
- ✅ `backend/src/app.js` (updated)

### Frontend:
- ✅ `frontend/src/services/api.js` (updated)
- ⏳ Components cần tạo (4 files)
- ⏳ Dashboard page cần cập nhật

## Kết luận

Backend đã hoàn thành 100%. Frontend cần tạo 4 components và cập nhật Dashboard page. Tất cả code mẫu đã được cung cấp ở trên, chỉ cần copy và điều chỉnh theo design của bạn!
