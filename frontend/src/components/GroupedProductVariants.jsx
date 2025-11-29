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
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg shadow-md">
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-white" />
                    ) : (
                      <ChevronDown size={20} className="text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <Package size={18} className="text-blue-600" />
                      <h4 className="text-base font-bold text-gray-900">
                        {group.name}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-4 mt-1.5 text-sm">
                      <span className="flex items-center text-gray-600">
                        <span className="font-semibold text-blue-600 mr-1">
                          {group.variants.length}
                        </span>
                        biến thể
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center text-gray-600">
                        <span className="font-semibold text-purple-600 mr-1">
                          {group.totalQuantity}
                        </span>
                        sản phẩm
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center text-gray-600">
                        Sizes:
                        <span className="font-semibold text-indigo-600 ml-1">
                          {group.sizes.sort((a, b) => parseFloat(a) - parseFloat(b)).join(", ")}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Tổng giá trị</div>
                  <div className="text-lg font-bold text-green-600">
                    {new Intl.NumberFormat("vi-VN").format(group.totalCost)} ₫
                  </div>
                </div>
              </div>
            </button>

            {/* Variants Detail Table */}
            {isExpanded && (
              <div className="bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {group.variants.map((variant, vIndex) => {
                      const subtotal = (parseFloat(variant.unit_cost) || 0) * (parseInt(variant.quantity) || 0);
                      // Try multiple possible field names for size
                      const size = variant.size_eu || variant.size || variant.Size || variant.product_size || variant.variant_size || variant.SIZE;
                      
                      return (
                        <tr key={vIndex} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {size || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {variant.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span className="text-sm text-gray-700">
                              {new Intl.NumberFormat("vi-VN").format(variant.unit_cost)} ₫
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-gray-900">
                              {new Intl.NumberFormat("vi-VN").format(subtotal)} ₫
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <tr>
                      <td colSpan="2" className="px-4 py-3 text-left">
                        <span className="text-sm font-bold text-gray-700">
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
