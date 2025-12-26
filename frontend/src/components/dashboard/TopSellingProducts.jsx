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
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
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
