import { useState, useEffect } from "react";
import { AlertTriangle, Package } from "lucide-react";
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
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching low stock:", error);
    } finally {
      setLoading(false);
    }
  };

  // Parse sizes and their quantities from product
  const parseSizes = (product) => {
    // If availableSizes exists, use it
    if (product.availableSizes && product.availableSizes.length > 0) {
      return product.availableSizes;
    }
    
    // Parse from size string
    if (product.size) {
      const sizes = product.size.split(',').map(s => s.trim()).filter(Boolean);
      const qtyPerSize = Math.floor((product.stock_quantity || 0) / sizes.length) || 0;
      return sizes.map(s => ({ size: s, quantity: qtyPerSize }));
    }
    
    return [];
  };

  // Get tag color based on quantity
  const getSizeTagStyle = (quantity) => {
    if (quantity === 0) return "bg-red-100 text-red-700 border-red-200";
    if (quantity <= 2) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const getStockBadge = (quantity) => {
    if (quantity === 0) return { text: "Hết hàng", style: "bg-red-500 text-white" };
    if (quantity <= 3) return { text: `Còn ${quantity}`, style: "bg-orange-500 text-white" };
    return { text: `Còn ${quantity}`, style: "bg-yellow-500 text-white" };
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold flex items-center text-gray-800">
          <AlertTriangle className="mr-2 text-red-500" size={18} />
          Cảnh báo tồn kho
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {products.length} sản phẩm
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="p-8 text-center text-green-600">
          <Package size={32} className="mx-auto mb-2 text-green-400" />
          ✓ Tất cả sản phẩm đều đủ hàng
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Sản phẩm</th>
                <th className="px-3 py-2 text-left font-medium">Size</th>
                <th className="px-3 py-2 text-right font-medium">Tồn kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const sizes = parseSizes(product);
                const badge = getStockBadge(product.stock_quantity);
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    {/* Product info with thumbnail */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt="" 
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[150px]" title={product.name}>
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {product.category_name || "Chưa phân loại"}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Size tags */}
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {sizes.length > 0 ? (
                          sizes.slice(0, 6).map((sizeInfo, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${getSizeTagStyle(sizeInfo.quantity)}`}
                              title={`Size ${sizeInfo.size}: ${sizeInfo.quantity} sản phẩm`}
                            >
                              {sizeInfo.size}
                              {sizeInfo.quantity <= 2 && (
                                <span className="ml-0.5 text-[10px]">({sizeInfo.quantity})</span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                        {sizes.length > 6 && (
                          <span className="text-xs text-gray-400">+{sizes.length - 6}</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Stock badge */}
                    <td className="px-3 py-2 text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${badge.style}`}>
                        {badge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      {products.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Hết hàng
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Sắp hết (≤2)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Còn hàng
          </span>
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;
