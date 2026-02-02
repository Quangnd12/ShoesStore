import { useState, useEffect } from "react";
import { AlertTriangle, Package, RefreshCw, ShoppingCart, Eye } from "lucide-react";
import { dashboardAPI } from "../../services/api";

const LowStockAlert = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getLowStock({ threshold: 10, limit: 10 });
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching low stock:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get stock level info
  const getStockLevel = (quantity) => {
    if (quantity === 0) return { 
      label: "Hết hàng", 
      color: "bg-red-500", 
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      percentage: 0 
    };
    if (quantity <= 3) return { 
      label: "Sắp hết", 
      color: "bg-orange-500", 
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      percentage: (quantity / 10) * 100 
    };
    if (quantity <= 5) return { 
      label: "Thấp", 
      color: "bg-yellow-500", 
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      percentage: (quantity / 10) * 100 
    };
    return { 
      label: "Cần nhập", 
      color: "bg-blue-500", 
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      percentage: (quantity / 10) * 100 
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 rounded-lg relative">
            <AlertTriangle size={18} className="text-red-500" />
            {products.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {products.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Cảnh báo tồn kho</h3>
            <p className="text-xs text-gray-400">{products.length} sản phẩm cần chú ý</p>
          </div>
        </div>
        <button 
          onClick={fetchLowStock}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Làm mới"
        >
          <RefreshCw size={16} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-5 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-100 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package size={32} className="text-green-500" />
          </div>
          <p className="text-green-600 font-medium">Tất cả sản phẩm đều đủ hàng!</p>
          <p className="text-sm text-gray-400 mt-1">Không có sản phẩm nào cần nhập thêm</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {products.map((product, index) => {
            const stockLevel = getStockLevel(product.stock_quantity);
            const isHovered = hoveredId === product.id;
            
            return (
              <div 
                key={product.id}
                className="px-5 py-3 hover:bg-gray-50 transition-all cursor-pointer group"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeIn 0.3s ease-out forwards'
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Product Image */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 group-hover:ring-2 ring-blue-200 transition-all">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-gray-300" />
                      </div>
                    )}
                    {/* Stock badge overlay */}
                    <div className={`absolute bottom-0 left-0 right-0 text-center text-[10px] font-bold py-0.5 ${stockLevel.color} text-white`}>
                      {product.stock_quantity}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-800 text-sm truncate pr-2" title={product.name}>
                        {product.name}
                      </p>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${stockLevel.bgColor} ${stockLevel.textColor}`}>
                        {stockLevel.label}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stockLevel.color} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(stockLevel.percentage, 5)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-400">
                          {product.category_name || "Chưa phân loại"}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {product.stock_quantity}/10 tối thiểu
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className={`flex gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button 
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      title="Nhập hàng"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Legend */}
      {products.length > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-gray-500">Hết hàng (0)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-gray-500">Sắp hết (1-3)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span className="text-gray-500">Thấp (4-5)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-gray-500">Cần nhập (6-9)</span>
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default LowStockAlert;
