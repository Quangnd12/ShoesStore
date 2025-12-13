import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { productsAPI, salesInvoicesAPI } from "../services/api";
import ColorDisplay from "./ColorDisplay";

const ProductDetailModal = ({ product, onClose }) => {
  const [sizes, setSizes] = useState([]);
  const [soldSizes, setSoldSizes] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (product) {
      fetchProductSizes();
      fetchSoldSizes();
    }
  }, [product]);

  const fetchProductSizes = async () => {
    try {
      // Use getAll instead of search to avoid 500 error
      const response = await productsAPI.getAll({ limit: 1000 });
      const allProducts = response.data?.products || response.data || [];
      
      // Filter products by name
      const products = allProducts.filter((p) => p.name === product.name);
      
      setSizes(
        products
          .map((p) => ({
            id: p.id,
            size: p.size_eu || p.size || p.Size, // Try multiple field names
            stock_quantity: p.stock_quantity,
            price: p.price,
          }))
          .filter((p) => p.size) // Remove items without size
          .sort((a, b) => {
            const sizeA = parseFloat(a.size) || 0;
            const sizeB = parseFloat(b.size) || 0;
            return sizeA - sizeB;
          })
      );
    } catch (error) {
      console.error("Error fetching sizes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSoldSizes = async () => {
    try {
      const response = await salesInvoicesAPI.getAll({ limit: 1000 });
      const invoices = response.data?.invoices || [];
      const sold = new Set();

      for (const invoice of invoices) {
        const detailResponse = await salesInvoicesAPI.getById(invoice.id);
        const items = detailResponse.data?.items || [];
        items.forEach((item) => {
          if (item.product_name === product.name && item.size_eu) {
            sold.add(item.size_eu);
          }
        });
      }

      setSoldSizes(sold);
    } catch (error) {
      console.error("Error fetching sold sizes:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Giá</p>
            <p className="font-medium text-lg">
              {new Intl.NumberFormat("vi-VN").format(product.price)} đ
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Thương hiệu</p>
            <p className="font-medium">{product.brand || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Màu sắc</p>
            {product.color ? (
              <ColorDisplay 
                color={product.color} 
                size="md" 
                showLabel={true}
                style="inline"
              />
            ) : (
              <p className="font-medium text-gray-400">-</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">Danh mục</p>
            <p className="font-medium">
              {product.category?.name || product.category_name || "-"}
            </p>
          </div>
        </div>

        {product.description && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Mô tả</p>
            <p className="text-gray-800">{product.description}</p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">Các size có sẵn</h3>
          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : sizes.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {sizes.map((sizeItem) => {
                const isSold = soldSizes.has(String(sizeItem.size));
                return (
                  <div
                    key={sizeItem.id}
                    className={`border rounded-lg p-3 ${
                      isSold
                        ? "bg-gray-100 opacity-60"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-medium text-lg mb-1">
                        Size {sizeItem.size}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tồn kho: {sizeItem.stock_quantity}
                      </p>
                      {isSold && (
                        <p className="text-xs text-red-600 mt-1">Đã bán</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Không có size nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;






