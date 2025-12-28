import { useState, useEffect } from "react";
import { X, ZoomIn, Package } from "lucide-react";
import { productsAPI } from "../services/api";
import ColorDisplay from "./ColorDisplay";

// Simple Image Zoom - No animations
const ImageZoom = ({ src, alt, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white">
        <X size={24} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

const ProductDetailModal = ({ product, onClose }) => {
  const [availableSizes, setAvailableSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showZoom, setShowZoom] = useState(false);

  useEffect(() => {
    if (!product) return;
    
    // Use existing data first
    if (product.availableSizes?.length > 0) {
      setAvailableSizes(product.availableSizes);
      setLoading(false);
      return;
    }

    // Parse from size string
    if (product.size) {
      const sizes = product.size.split(',').map(s => s.trim()).filter(Boolean);
      const qty = Math.floor((product.stock_quantity || 0) / sizes.length) || 0;
      setAvailableSizes(sizes.map(s => ({ size: s, quantity: qty })));
      setLoading(false);
      return;
    }

    // Fetch from API as last resort
    productsAPI.getById(product.id)
      .then(res => {
        const data = res.data;
        if (data.availableSizes?.length > 0) {
          setAvailableSizes(data.availableSizes);
        } else if (data.size) {
          const sizes = data.size.split(',').map(s => s.trim()).filter(Boolean);
          const qty = Math.floor((data.stock_quantity || 0) / sizes.length) || 0;
          setAvailableSizes(sizes.map(s => ({ size: s, quantity: qty })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [product]);

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && !showZoom && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showZoom, onClose]);

  if (!product) return null;

  const totalStock = availableSizes.reduce((sum, s) => sum + (s.quantity || 0), 0) || product.stock_quantity || 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{product.name}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-60px)] p-5">
            <div className="flex gap-5">
              {/* Image */}
              <div 
                className="w-40 h-40 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden cursor-pointer relative group"
                onClick={() => product.image_url && setShowZoom(true)}
              >
                {product.image_url ? (
                  <>
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center">
                      <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={48} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-blue-600 mb-3">
                  {new Intl.NumberFormat("vi-VN").format(product.price)}đ
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Thương hiệu:</span>
                    <span className="ml-2 font-medium">{product.brand || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Danh mục:</span>
                    <span className="ml-2 font-medium">{product.category?.name || product.category_name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Màu sắc:</span>
                    <span className="ml-2">
                      {product.color ? (
                        <ColorDisplay color={product.color} size="sm" showLabel={true} style="inline" />
                      ) : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tổng tồn:</span>
                    <span className={`ml-2 font-bold ${totalStock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                      {totalStock}
                    </span>
                  </div>
                </div>

                {product.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                )}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-5 pt-4 border-t">
              <h3 className="font-semibold text-gray-800 mb-3">Tồn kho theo Size</h3>
              
              {loading ? (
                <div className="text-center py-4 text-gray-500">Đang tải...</div>
              ) : availableSizes.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableSizes.map((item, i) => (
                    <div
                      key={`${item.size}-${i}`}
                      className={`rounded-lg p-2 text-center border ${
                        item.quantity <= 0
                          ? "bg-gray-50 border-gray-200 text-gray-400"
                          : item.quantity < 3
                            ? "bg-orange-50 border-orange-200"
                            : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="font-bold text-lg">{item.size}</div>
                      <div className={`text-xs ${
                        item.quantity <= 0 ? 'text-gray-400' : item.quantity < 3 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {item.quantity <= 0 ? "Hết" : `Còn ${item.quantity}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Không có size - Tồn kho: {product.stock_quantity || 0}
                </div>
              )}

              {availableSizes.length > 0 && (
                <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Còn hàng
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Sắp hết
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span> Hết hàng
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showZoom && product.image_url && (
        <ImageZoom src={product.image_url} alt={product.name} onClose={() => setShowZoom(false)} />
      )}
    </>
  );
};

export default ProductDetailModal;
