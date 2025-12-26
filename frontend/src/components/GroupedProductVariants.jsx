import { useState } from "react";
import { ChevronDown, ChevronUp, Package } from "lucide-react";

const GroupedProductVariants = ({ items }) => {
  const [expandedProducts, setExpandedProducts] = useState({});

  // Nhóm items theo tên sản phẩm
  const groupedProducts = items.reduce((acc, item) => {
    const productName = item.product_name || item.name || "Sản phẩm không tên";
    
    if (!acc[productName]) {
      acc[productName] = {
        name: productName,
        variants: [],
        totalQuantity: 0,
        totalCost: 0,
        sizes: [],
        image_url: item.image_url || null, // Lấy hình ảnh từ item đầu tiên
      };
    }
    
    acc[productName].variants.push(item);
    acc[productName].totalQuantity += parseInt(item.quantity) || 0;
    acc[productName].totalCost += (parseFloat(item.unit_cost) || 0) * (parseInt(item.quantity) || 0);
    
    // Try multiple possible field names for size
    const size = item.size_eu || item.size || item.Size || item.product_size || item.variant_size || item.SIZE;
    
    if (size !== undefined && size !== null && size !== "") {
      acc[productName].sizes.push(String(size));
    }
    
    return acc;
  }, {});

  const productGroups = Object.values(groupedProducts);

  const toggleProduct = (productName) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productName]: !prev[productName],
    }));
  };

  return (
    <div className="space-y-3">
      {productGroups.map((group, index) => {
        const isExpanded = expandedProducts[group.name];
        
        return (
          <div
            key={index}
            className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-all"
          >
            {/* Product Summary Header */}
            <button
              onClick={() => toggleProduct(group.name)}
              className="w-full px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {/* Product Image */}
                  {group.image_url ? (
                    <img
                      src={group.image_url}
                      alt={group.name}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-blue-200 shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 shadow-sm flex-shrink-0">
                      <Package size={28} className="text-gray-400" />
                    </div>
                  )}
                  
                  {/* Product Info */}
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg shadow-sm flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-white" />
                        ) : (
                          <ChevronDown size={18} className="text-white" />
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 truncate">
                        {group.name}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {group.variants.length} biến thể
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                        {group.totalQuantity} sản phẩm
                      </span>
                      <span className="text-gray-600">
                        Sizes: <span className="font-semibold text-indigo-600">
                          {group.sizes.sort((a, b) => parseFloat(a) - parseFloat(b)).join(", ")}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Total Price */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-500 mb-1">Tổng giá trị</div>
                  <div className="text-xl font-bold text-green-600">
                    {new Intl.NumberFormat("vi-VN").format(group.totalCost)} ₫
                  </div>
                </div>
              </div>
            </button>

            {/* Variants Detail Table */}
            {isExpanded && (
              <div className="bg-white p-4">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Size
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Đơn giá
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.variants.map((variant, vIndex) => {
                      const subtotal = (parseFloat(variant.unit_cost) || 0) * (parseInt(variant.quantity) || 0);
                      // Try multiple possible field names for size
                      const size = variant.size_eu || variant.size || variant.Size || variant.product_size || variant.variant_size || variant.SIZE;
                      
                      return (
                        <tr key={vIndex} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800">
                              {size || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {variant.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-gray-700">
                              {new Intl.NumberFormat("vi-VN").format(variant.unit_cost)} ₫
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-bold text-gray-900">
                              {new Intl.NumberFormat("vi-VN").format(subtotal)} ₫
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-200">
                      <td colSpan="2" className="px-4 py-3 text-left">
                        <span className="text-sm font-bold text-gray-800">
                          Tổng cộng
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-purple-600">
                          {group.totalQuantity} sản phẩm
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-base font-bold text-green-600">
                          {new Intl.NumberFormat("vi-VN").format(group.totalCost)} ₫
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GroupedProductVariants;
