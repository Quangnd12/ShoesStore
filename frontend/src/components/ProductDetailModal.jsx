import { useState, useEffect } from "react";
import { X, ZoomIn, Package, FileText, History } from "lucide-react";
import { productsAPI, purchaseInvoicesAPI } from "../services/api";
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
  const [activeTab, setActiveTab] = useState("stock"); // "stock" | "history"
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  // Fetch purchase history when tab changes
  useEffect(() => {
    if (activeTab === "history" && product && purchaseHistory.length === 0) {
      fetchPurchaseHistory();
    }
  }, [activeTab, product]);

  const fetchPurchaseHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await purchaseInvoicesAPI.getHistoryByProductName(product.name);
      const data = response.data || [];
      
      // Group by invoice
      const grouped = data.reduce((acc, item) => {
        const key = item.invoice_id;
        if (!acc[key]) {
          acc[key] = {
            invoice_id: item.invoice_id,
            invoice_number: item.invoice_number,
            invoice_date: item.invoice_date,
            supplier_name: item.supplier_name,
            items: [],
            total_quantity: 0,
            total_cost: 0
          };
        }
        acc[key].items.push(item);
        acc[key].total_quantity += item.quantity || 0;
        acc[key].total_cost += parseFloat(item.total_cost) || 0;
        return acc;
      }, {});
      
      setPurchaseHistory(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && !showZoom && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showZoom, onClose]);

  if (!product) return null;

  const totalStock = availableSizes.reduce((sum, s) => sum + (s.quantity || 0), 0) || product.stock_quantity || 0;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{product.name}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
            {/* Product Info */}
            <div className="p-5">
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
            </div>

            {/* Tabs */}
            <div className="border-t border-b bg-gray-50">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("stock")}
                  className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "stock"
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Package size={16} />
                  Tồn kho theo Size
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "history"
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <History size={16} />
                  Lịch sử nhập hàng
                  {purchaseHistory.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {purchaseHistory.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-5">
              {/* Stock Tab */}
              {activeTab === "stock" && (
                <>
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
                </>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <>
                  {historyLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : purchaseHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">Chưa có lịch sử nhập hàng</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {purchaseHistory.map((invoice) => (
                        <div 
                          key={invoice.invoice_id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                        >
                          <div className="bg-gray-50 px-4 py-2 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-blue-600">#{invoice.invoice_number}</span>
                              <span className="text-gray-500">{formatDate(invoice.invoice_date)}</span>
                            </div>
                            <span className="text-gray-600">{invoice.supplier_name || "Không rõ NCC"}</span>
                          </div>
                          <div className="p-3">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {invoice.items.map((item, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                                >
                                  {item.size_eu && <span className="font-medium">Size {item.size_eu}</span>}
                                  {item.color && <span>• {item.color}</span>}
                                  <span>• SL: {item.quantity}</span>
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">
                                Tổng: <span className="font-medium text-gray-700">{invoice.total_quantity} sản phẩm</span>
                              </span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(invoice.total_cost)}đ
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
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
