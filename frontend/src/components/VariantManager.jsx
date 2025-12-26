import { useState, useMemo } from "react";
import { Plus, X, Copy, Trash2, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import SmartPriceInput from "./SmartPriceInput";
import ColorPicker from "./ColorPicker";

/**
 * Component quản lý biến thể sản phẩm nâng cao
 * Hỗ trợ: Size, Màu sắc, Số lượng, Giá nhập
 * Tính năng: Bulk actions, Copy, Thống kê tổng hợp
 */
const VariantManager = ({
  variants = [],
  onVariantsChange,
  productContext = null,
  showColor = true,
}) => {
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState("");
  const [bulkUnitCost, setBulkUnitCost] = useState("");
  const [bulkColor, setBulkColor] = useState("");
  const [expandedView, setExpandedView] = useState(true);

  // Tính toán thống kê
  const stats = useMemo(() => {
    const totalQuantity = variants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0);
    const totalCost = variants.reduce((sum, v) => {
      const qty = parseInt(v.quantity) || 0;
      const cost = parseFloat(v.unit_cost) || 0;
      return sum + (qty * cost);
    }, 0);
    const uniqueSizes = [...new Set(variants.map(v => v.size).filter(Boolean))].length;
    const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))].length;
    
    return { totalQuantity, totalCost, uniqueSizes, uniqueColors, variantCount: variants.length };
  }, [variants]);

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Thêm biến thể mới
  const handleAddVariant = () => {
    const newVariant = { 
      size: "", 
      quantity: "", 
      unit_cost: "", 
      color: variants.length > 0 ? variants[variants.length - 1].color || "" : ""
    };
    onVariantsChange([...variants, newVariant]);
  };

  // Xóa biến thể
  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) {
      alert("Phải có ít nhất 1 biến thể");
      return;
    }
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
    setSelectedVariants(selectedVariants.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  // Cập nhật biến thể
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onVariantsChange(newVariants);
  };

  // Sao chép biến thể
  const handleCopyVariant = (index) => {
    const variantToCopy = { ...variants[index], size: "" };
    const newVariants = [...variants];
    newVariants.splice(index + 1, 0, variantToCopy);
    onVariantsChange(newVariants);
  };

  // Toggle chọn biến thể
  const toggleSelectVariant = (index) => {
    if (selectedVariants.includes(index)) {
      setSelectedVariants(selectedVariants.filter(i => i !== index));
    } else {
      setSelectedVariants([...selectedVariants, index]);
    }
  };

  // Chọn tất cả
  const toggleSelectAll = () => {
    if (selectedVariants.length === variants.length) {
      setSelectedVariants([]);
    } else {
      setSelectedVariants(variants.map((_, i) => i));
    }
  };

  // Áp dụng bulk actions
  const applyBulkActions = () => {
    if (selectedVariants.length === 0) {
      alert("Vui lòng chọn ít nhất 1 biến thể");
      return;
    }

    const newVariants = variants.map((variant, index) => {
      if (selectedVariants.includes(index)) {
        return {
          ...variant,
          ...(bulkQuantity && { quantity: bulkQuantity }),
          ...(bulkUnitCost && { unit_cost: bulkUnitCost }),
          ...(bulkColor && { color: bulkColor }),
        };
      }
      return variant;
    });

    onVariantsChange(newVariants);
    setBulkQuantity("");
    setBulkUnitCost("");
    setBulkColor("");
    setShowBulkActions(false);
  };

  // Xóa các biến thể đã chọn
  const deleteSelectedVariants = () => {
    if (selectedVariants.length === 0) return;
    if (selectedVariants.length === variants.length) {
      alert("Không thể xóa tất cả biến thể");
      return;
    }
    
    const newVariants = variants.filter((_, index) => !selectedVariants.includes(index));
    onVariantsChange(newVariants);
    setSelectedVariants([]);
  };

  return (
    <div className="space-y-4">
      {/* Header với thống kê */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Settings2 size={16} className="text-blue-600" />
            Quản lý biến thể
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {stats.variantCount} biến thể
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
              {stats.totalQuantity} sản phẩm
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
              {formatCurrency(stats.totalCost)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpandedView(!expandedView)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          >
            {expandedView ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            type="button"
            onClick={handleAddVariant}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-300"
          >
            <Plus size={14} />
            Thêm
          </button>
        </div>
      </div>

      {expandedView && (
        <>
          {/* Bulk Actions Bar */}
          {selectedVariants.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Đã chọn {selectedVariants.length} biến thể
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showBulkActions ? "Ẩn" : "Sửa hàng loạt"}
                  </button>
                  <button
                    type="button"
                    onClick={deleteSelectedVariants}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={14} />
                    Xóa
                  </button>
                </div>
              </div>
              
              {showBulkActions && (
                <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-blue-200">
                  <div>
                    <label className="block text-xs text-blue-700 mb-1">Số lượng</label>
                    <input
                      type="number"
                      value={bulkQuantity}
                      onChange={(e) => setBulkQuantity(e.target.value)}
                      placeholder="Nhập SL"
                      className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-blue-700 mb-1">Giá nhập</label>
                    <input
                      type="number"
                      value={bulkUnitCost}
                      onChange={(e) => setBulkUnitCost(e.target.value)}
                      placeholder="Nhập giá"
                      className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {showColor && (
                    <div>
                      <label className="block text-xs text-blue-700 mb-1">Màu sắc</label>
                      <input
                        type="text"
                        value={bulkColor}
                        onChange={(e) => setBulkColor(e.target.value)}
                        placeholder="Nhập màu"
                        className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={applyBulkActions}
                      className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Variants Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className={`grid ${showColor ? 'grid-cols-6' : 'grid-cols-5'} gap-2 px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600`}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedVariants.length === variants.length && variants.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Size</span>
              </div>
              {showColor && <div>Màu sắc</div>}
              <div>Số lượng</div>
              <div>Giá nhập</div>
              <div>Thành tiền</div>
              <div className="text-center">Thao tác</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {variants.map((variant, index) => {
                const subtotal = (parseInt(variant.quantity) || 0) * (parseFloat(variant.unit_cost) || 0);
                const isSelected = selectedVariants.includes(index);
                
                return (
                  <div
                    key={index}
                    className={`grid ${showColor ? 'grid-cols-6' : 'grid-cols-5'} gap-2 px-3 py-2 items-center hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectVariant(index)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                        placeholder="38"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {showColor && (
                      <div>
                        <input
                          type="text"
                          value={variant.color || ""}
                          onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                          placeholder="Đen"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    <div>
                      <input
                        type="number"
                        value={variant.quantity}
                        onChange={(e) => handleVariantChange(index, "quantity", e.target.value)}
                        placeholder="10"
                        min="0"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <SmartPriceInput
                        value={variant.unit_cost}
                        onChange={(value) => handleVariantChange(index, "unit_cost", value)}
                        placeholder="80.000"
                        unit="đ"
                        productContext={productContext}
                        className="text-sm py-1.5"
                      />
                    </div>
                    
                    <div className="text-sm font-medium text-gray-700">
                      {formatCurrency(subtotal)}
                    </div>
                    
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyVariant(index)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Sao chép"
                      >
                        <Copy size={14} />
                      </button>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table Footer - Summary */}
            <div className={`grid ${showColor ? 'grid-cols-6' : 'grid-cols-5'} gap-2 px-3 py-2 bg-gray-50 border-t border-gray-200 text-sm font-semibold`}>
              <div className={showColor ? 'col-span-2' : ''}>Tổng cộng</div>
              {!showColor && <div></div>}
              <div className="text-blue-600">{stats.totalQuantity}</div>
              <div></div>
              <div className="text-green-600">{formatCurrency(stats.totalCost)}</div>
              <div></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VariantManager;
