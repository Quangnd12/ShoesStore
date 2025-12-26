import { Plus, Trash2 } from "lucide-react";

const PurchaseInvoiceVariants = ({
  variants,
  itemIndex,
  onVariantChange,
  onAddVariant,
  onRemoveVariant
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateSubtotal = (quantity, unitCost) => {
    const qty = parseInt(quantity) || 0;
    const cost = parseFloat(unitCost) || 0;
    return qty * cost;
  };

  return (
    <div className="space-y-3">
      {variants.map((variant, variantIndex) => (
        <div key={variantIndex} className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-3">
            <label className="block text-xs text-gray-600 mb-1">
              Kích cỡ
            </label>
            <input
              type="text"
              value={variant.size}
              onChange={(e) => onVariantChange(variantIndex, "size", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="VD: 39, M, L"
            />
          </div>

          <div className="col-span-3">
            <label className="block text-xs text-gray-600 mb-1">
              Số lượng *
            </label>
            <input
              type="number"
              value={variant.quantity}
              onChange={(e) => onVariantChange(variantIndex, "quantity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="col-span-3">
            <label className="block text-xs text-gray-600 mb-1">
              Giá nhập *
            </label>
            <input
              type="number"
              value={variant.unit_cost}
              onChange={(e) => onVariantChange(variantIndex, "unit_cost", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">
              Thành tiền
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
              {formatCurrency(calculateSubtotal(variant.quantity, variant.unit_cost))}
            </div>
          </div>

          <div className="col-span-1">
            <div className="flex space-x-1">
              {variantIndex === variants.length - 1 && (
                <button
                  type="button"
                  onClick={onAddVariant}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                  title="Thêm biến thể"
                >
                  <Plus size={16} />
                </button>
              )}
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveVariant(variantIndex)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  title="Xóa biến thể"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Tổng kết cho item này */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">Tổng sản phẩm này:</span>
          <div className="text-right">
            <div>
              Số lượng: {variants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0)}
            </div>
            <div className="font-semibold text-green-600">
              {formatCurrency(
                variants.reduce((sum, v) => sum + calculateSubtotal(v.quantity, v.unit_cost), 0)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoiceVariants;