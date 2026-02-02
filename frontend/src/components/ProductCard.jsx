import { Package, Plus, Check, ShoppingBag } from "lucide-react";
import ColorDisplay from "./ColorDisplay";

/**
 * ProductCard component cho trang Quick Checkout
 * @param {Object} product - Thông tin sản phẩm (có availableSizes từ API)
 * @param {Function} onDragStart - Handler khi bắt đầu kéo
 * @param {Function} onAddToCart - Handler khi thêm vào giỏ
 * @param {boolean} isInCart - Sản phẩm đã có trong giỏ chưa
 * @param {Array} sizesInCart - Danh sách size đã có trong giỏ của sản phẩm này
 */
const ProductCard = ({ product, onDragStart, onAddToCart, isInCart, sizesInCart = [] }) => {
  // Lấy sizes từ availableSizes (từ API, chỉ chứa sizes còn hàng)
  const getAvailableSizes = () => {
    if (product.availableSizes && product.availableSizes.length > 0) {
      return product.availableSizes.filter(s => s.quantity > 0);
    }
    
    // Fallback: parse từ chuỗi size
    if (product.size) {
      const sizes = product.size.split(',').map(s => s.trim()).filter(s => s);
      const qtyPerSize = Math.floor(product.stock_quantity / sizes.length) || 0;
      return sizes.map(s => ({ size: s, quantity: qtyPerSize })).filter(s => s.quantity > 0);
    }
    
    return [];
  };

  const availableSizes = getAvailableSizes();
  const hasSizes = availableSizes.length > 0;
  
  // Tính số size còn lại chưa thêm vào giỏ và còn hàng
  const remainingSizes = availableSizes.filter(s => !sizesInCart.includes(s.size));
  const allSizesUsed = hasSizes && remainingSizes.length === 0;
  
  // Kiểm tra size đã trong giỏ
  const isSizeInCart = (size) => sizesInCart.includes(size);

  // Nếu sản phẩm hết hàng hoặc tất cả size đã trong giỏ, ẩn hoàn toàn card
  if (product.stock_quantity <= 0 || allSizesUsed) {
    return null;
  }

  // Nếu sản phẩm có sizes nhưng tất cả đã hết hàng
  if (hasSizes && availableSizes.length === 0) {
    return null;
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, product)}
      className={`group bg-white rounded-xl overflow-hidden transition-all duration-300 cursor-move ${
        isInCart 
          ? "ring-2 ring-green-500 shadow-lg shadow-green-100" 
          : "border border-gray-100 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1"
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-gray-300" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {isInCart && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Check size={10} />
              {hasSizes ? `${sizesInCart.length} size` : 'Đã chọn'}
            </span>
          )}
          <span className={`ml-auto text-[10px] font-bold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm ${
            product.stock_quantity < 10 
              ? "bg-orange-500/90 text-white" 
              : "bg-white/90 text-gray-700"
          }`}>
            Còn {product.stock_quantity}
          </span>
        </div>

        {/* Quick add button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-2 right-2 p-2.5 rounded-full shadow-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 hover:scale-110 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        {/* Product name */}
        <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Color & Brand row */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.color && (
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full">
              <ColorDisplay 
                color={product.color} 
                size="xs" 
                showLabel={false}
                style="circle"
              />
              <span className="text-[10px] text-gray-600 capitalize">{product.color}</span>
            </div>
          )}
          {product.brand && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {product.brand}
            </span>
          )}
        </div>

        {/* Sizes preview - chỉ hiển thị sizes còn hàng */}
        {hasSizes && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-gray-500">Size:</span>
            <div className="flex gap-0.5 flex-wrap">
              {availableSizes.slice(0, 5).map((sizeInfo, idx) => {
                const inCart = isSizeInCart(sizeInfo.size);
                return (
                  <span 
                    key={idx}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      inCart 
                        ? "bg-green-100 text-green-600 line-through" 
                        : "bg-gray-100 text-gray-600"
                    }`}
                    title={`SL: ${sizeInfo.quantity}`}
                  >
                    {sizeInfo.size}
                  </span>
                );
              })}
              {availableSizes.length > 5 && (
                <span className="text-[10px] text-gray-400 px-1">
                  +{availableSizes.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Price & Add button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN").format(product.price)}
            </span>
            <span className="text-[10px] text-gray-400">VNĐ</span>
          </div>
          
          <button
            onClick={() => onAddToCart(product)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
              isInCart && !hasSizes
                ? "bg-green-100 text-green-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-200 active:scale-95"
            }`}
          >
            {isInCart && !hasSizes ? (
              <>
                <Check size={12} />
                <span>Đã thêm</span>
              </>
            ) : isInCart && hasSizes ? (
              <>
                <Plus size={12} />
                <span>+Size</span>
              </>
            ) : (
              <>
                <ShoppingBag size={12} />
                <span>Thêm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
