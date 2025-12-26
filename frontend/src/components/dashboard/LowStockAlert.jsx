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
        <div className="space-y-2 max-h-96 overflow-y-auto">
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
