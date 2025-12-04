import { Package, Plus, Check } from "lucide-react";

const ProductCard = ({ product, onDragStart, onAddToCart, isInCart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, product)}
      className={`group bg-white rounded-lg border transition-all cursor-move ${
        isInCart 
          ? "border-green-400 shadow-md" 
          : "border-gray-200 hover:border-blue-400 hover:shadow-md"
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-50 rounded-t-lg overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-gray-300" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {isInCart && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Check size={12} />
              Đã chọn
            </span>
          )}
          <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full shadow-sm ${
            product.stock_quantity < 10 
              ? "bg-orange-100 text-orange-700" 
              : "bg-green-100 text-green-700"
          }`}>
            SL: {product.stock_quantity}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[2.5rem] leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          {product.size && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold">
             Size: {product.size}
            </span>
          )}
          <span className="text-sm font-bold text-gray-900">
            {new Intl.NumberFormat("vi-VN").format(product.price)}₫
          </span>
        </div>

        {/* Add Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={isInCart}
          className={`w-full py-2 rounded text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            isInCart
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
          }`}
        >
          {isInCart ? (
            <>
              <Check size={14} />
              Đã thêm
            </>
          ) : (
            <>
              <Plus size={14} />
              Thêm
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
