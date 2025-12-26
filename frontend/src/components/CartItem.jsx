import { Plus, Minus, X, Package, Edit2, Check } from "lucide-react";
import { useState } from "react";
import ColorDisplay from "./ColorDisplay";

const CartItem = ({ item, onUpdateQuantity, onUpdatePrice, onRemove, maxQuantity = 99 }) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPrice, setEditedPrice] = useState(item.unit_price);
  
  // Kiểm tra đã đạt số lượng tối đa chưa
  const isMaxQuantity = item.quantity >= maxQuantity;

  const handlePriceEdit = () => {
    setIsEditingPrice(true);
    setEditedPrice(item.unit_price);
  };

  const handlePriceSave = () => {
    const newPrice = parseFloat(editedPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      onUpdatePrice(newPrice);
      setIsEditingPrice(false);
    }
  };

  const handlePriceCancel = () => {
    setEditedPrice(item.unit_price);
    setIsEditingPrice(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePriceSave();
    } else if (e.key === "Escape") {
      handlePriceCancel();
    }
  };

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={20} className="text-gray-300" />
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                {item.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {item.color && (
                  <ColorDisplay 
                    color={item.color} 
                    size="xs" 
                    showLabel={false}
                    style="circle"
                  />
                )}
                {/* Hiển thị size đã chọn */}
                {item.selectedSize && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">
                    Size: {item.selectedSize}
                  </span>
                )}
                {/* Fallback: hiển thị size gốc nếu không có selectedSize */}
                {!item.selectedSize && item.size && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                    {item.size}
                  </span>
                )}
                
                {/* Editable Price */}
                {isEditingPrice ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editedPrice}
                      onChange={(e) => setEditedPrice(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-20 px-1.5 py-0.5 text-xs border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={handlePriceSave}
                      className="text-green-600 hover:text-green-700"
                      title="Lưu"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={handlePriceCancel}
                      className="text-gray-400 hover:text-gray-600"
                      title="Hủy"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePriceEdit}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors group"
                    title="Chỉnh sửa giá"
                  >
                    <span>{new Intl.NumberFormat("vi-VN").format(item.unit_price)}₫</span>
                    <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Xóa"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Quantity and Total */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-sm font-semibold">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={isMaxQuantity}
                className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title={isMaxQuantity ? `Tối đa ${maxQuantity}` : ''}
              >
                <Plus size={12} />
              </button>
              {isMaxQuantity && (
                <span className="text-[10px] text-orange-600 ml-1">Max</span>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">Thành tiền</p>
              <p className="text-sm font-bold text-blue-600">
                {new Intl.NumberFormat("vi-VN").format(item.quantity * item.unit_price)}₫
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
