import { useState, useEffect } from "react";
import { X, ShoppingCart, Package, Minus, Plus, Check, AlertTriangle } from "lucide-react";
import ColorDisplay from "./ColorDisplay";

/**
 * Modal chọn size trước khi thêm sản phẩm vào giỏ hàng
 * @param {Object} product - Sản phẩm cần thêm (có availableSizes từ API)
 * @param {boolean} isOpen - Trạng thái mở modal
 * @param {Function} onClose - Callback đóng modal
 * @param {Function} onConfirm - Callback xác nhận thêm vào giỏ
 * @param {Array} cartItems - Danh sách sản phẩm trong giỏ hàng (để check size đã chọn)
 */
const SizeSelectModal = ({ product, isOpen, onClose, onConfirm, cartItems = [] }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [maxQuantity, setMaxQuantity] = useState(1);

  // Reset state khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setSelectedSize(null);
      setQuantity(1);
      setMaxQuantity(1);
    }
  }, [isOpen, product?.id]);

  // Cập nhật maxQuantity khi chọn size
  useEffect(() => {
    if (selectedSize && product?.availableSizes) {
      const sizeInfo = product.availableSizes.find(s => s.size === selectedSize);
      if (sizeInfo) {
        setMaxQuantity(sizeInfo.quantity);
        // Reset quantity nếu vượt quá max
        if (quantity > sizeInfo.quantity) {
          setQuantity(Math.min(1, sizeInfo.quantity));
        }
      }
    }
  }, [selectedSize, product?.availableSizes]);

  if (!isOpen || !product) return null;

  // Lấy sizes từ availableSizes (từ API, chỉ chứa sizes còn hàng)
  // Fallback: parse từ chuỗi size nếu không có availableSizes
  const getAvailableSizes = () => {
    if (product.availableSizes && product.availableSizes.length > 0) {
      return product.availableSizes;
    }
    
    // Fallback: parse từ chuỗi
    if (product.size) {
      const sizes = product.size.split(',').map(s => s.trim()).filter(s => s);
      const qtyPerSize = Math.floor(product.stock_quantity / sizes.length) || 1;
      return sizes.map(s => ({ size: s, quantity: qtyPerSize }));
    }
    
    return [];
  };

  const availableSizes = getAvailableSizes();
  const hasSizes = availableSizes.length > 0;

  // Lấy danh sách size đã có trong giỏ hàng của sản phẩm này
  const getSizesInCart = () => {
    return cartItems
      .filter(item => item.id === product.id && item.selectedSize)
      .map(item => item.selectedSize);
  };

  const sizesInCart = getSizesInCart();

  // Kiểm tra size đã có trong giỏ chưa
  const isSizeInCart = (size) => sizesInCart.includes(size);

  // Lọc sizes còn lại (chưa trong giỏ và còn hàng)
  const remainingSizes = availableSizes.filter(s => !isSizeInCart(s.size) && s.quantity > 0);

  // Lấy quantity của size được chọn
  const getSelectedSizeQuantity = () => {
    if (!selectedSize) return 1;
    const sizeInfo = availableSizes.find(s => s.size === selectedSize);
    return sizeInfo?.quantity || 1;
  };

  const handleConfirm = () => {
    if (hasSizes && !selectedSize) {
      return;
    }
    
    onConfirm({
      ...product,
      selectedSize: selectedSize,
      quantity: quantity,
      maxQuantityPerSize: getSelectedSizeQuantity(),
    });
    
    setSelectedSize(null);
    setQuantity(1);
    onClose();
  };

  const handleClose = () => {
    setSelectedSize(null);
    setQuantity(1);
    onClose();
  };

  const incrementQuantity = () => {
    const max = getSelectedSizeQuantity();
    if (quantity < max) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const currentMaxQuantity = getSelectedSizeQuantity();

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <ShoppingCart size={20} />
            Thêm vào giỏ hàng
          </h3>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package size={36} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mb-3">
                {product.color && (
                  <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
                    <ColorDisplay 
                      color={product.color} 
                      size="sm" 
                      showLabel={false}
                      style="circle"
                    />
                    <span className="text-xs text-gray-600 capitalize">{product.color}</span>
                  </div>
                )}
                {product.brand && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{product.brand}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat("vi-VN").format(product.price)}₫
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  product.stock_quantity < 10 
                    ? "bg-orange-100 text-orange-700" 
                    : "bg-green-100 text-green-700"
                }`}>
                  Còn {product.stock_quantity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Size Selection */}
        {hasSizes && (
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-800">
                Chọn size <span className="text-red-500">*</span>
              </label>
              {sizesInCart.length > 0 && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Đã chọn {sizesInCart.length} size
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((sizeInfo) => {
                const { size, quantity: sizeQty } = sizeInfo;
                const inCart = isSizeInCart(size);
                const isSelected = selectedSize === size;
                const isOutOfStock = sizeQty <= 0;
                
                // Ẩn size đã hết hàng hoặc đã trong giỏ
                if (isOutOfStock || inCart) {
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled
                      className="min-w-[52px] px-4 py-2.5 rounded-xl border-2 text-sm font-bold relative border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                    >
                      {size}
                      {inCart && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </span>
                      )}
                      {isOutOfStock && !inCart && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <X size={10} className="text-white" />
                        </span>
                      )}
                    </button>
                  );
                }
                
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[52px] px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200 relative ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    <span>{size}</span>
                    <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                      SL: {sizeQty}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* Thông báo */}
            {!selectedSize && remainingSizes.length > 0 && (
              <p className="text-xs text-orange-600 mt-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Vui lòng chọn size trước khi thêm vào giỏ hàng
              </p>
            )}
            {remainingSizes.length === 0 && (
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                <AlertTriangle size={12} />
                Tất cả size đã hết hàng hoặc đã trong giỏ
              </p>
            )}
          </div>
        )}

        {/* Quantity */}
        <div className="p-5 border-b border-gray-100">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Số lượng
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                min="1"
                max={currentMaxQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), currentMaxQuantity));
                }}
                className="w-16 h-12 text-center bg-transparent font-bold text-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={incrementQuantity}
                disabled={quantity >= currentMaxQuantity}
                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Plus size={18} />
              </button>
            </div>
            <span className="text-sm text-gray-500">
              (Tối đa: {currentMaxQuantity})
            </span>
          </div>
        </div>

        {/* Total & Actions */}
        <div className="p-5 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center justify-between mb-5">
            <span className="text-gray-600 font-medium">Tạm tính:</span>
            <span className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN").format(product.price * quantity)}₫
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={(hasSizes && !selectedSize) || remainingSizes.length === 0}
              className={`flex-1 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                (hasSizes && !selectedSize) || remainingSizes.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-300 active:scale-95"
              }`}
            >
              <ShoppingCart size={18} />
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeSelectModal;
