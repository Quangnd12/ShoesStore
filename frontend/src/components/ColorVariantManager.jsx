import { useState, useMemo } from "react";
import { Plus, X, Copy, Trash2, ChevronDown, ChevronUp, Image, Palette } from "lucide-react";
import SmartPriceInput from "./SmartPriceInput";

/**
 * Component quản lý biến thể theo màu sắc
 * Cấu trúc: Màu sắc → Hình ảnh → Sizes
 * 
 * Ví dụ: Giày Nike
 * - Màu Đỏ (hình ảnh đỏ) → Size 36, 37, 38, 39, 40
 * - Màu Trắng (hình ảnh trắng) → Size 36, 37, 38, 39, 40
 */
const ColorVariantManager = ({
  colorVariants = [], // [{ color, image, image_file, sizes: [{ size, quantity, unit_cost }] }]
  onColorVariantsChange,
  productContext = null,
  onImageFileChange, // callback để upload hình
}) => {
  const [expandedColors, setExpandedColors] = useState([0]);
  const [quickSizeStart, setQuickSizeStart] = useState("36");
  const [quickSizeCount, setQuickSizeCount] = useState("5");
  const [quickSizeStep, setQuickSizeStep] = useState("1");
  const [quickQuantity, setQuickQuantity] = useState("");
  const [quickUnitCost, setQuickUnitCost] = useState("");

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  // Tính toán thống kê
  const stats = useMemo(() => {
    let totalQuantity = 0;
    let totalCost = 0;
    let totalVariants = 0;

    colorVariants.forEach(cv => {
      cv.sizes?.forEach(s => {
        const qty = parseInt(s.quantity) || 0;
        const cost = parseFloat(s.unit_cost) || 0;
        totalQuantity += qty;
        totalCost += qty * cost;
        totalVariants++;
      });
    });

    return { totalQuantity, totalCost, totalVariants, colorCount: colorVariants.length };
  }, [colorVariants]);

  // Toggle expand color
  const toggleExpand = (index) => {
    if (expandedColors.includes(index)) {
      setExpandedColors(expandedColors.filter(i => i !== index));
    } else {
      setExpandedColors([...expandedColors, index]);
    }
  };

  // Thêm màu mới
  const handleAddColor = () => {
    const newColorVariant = {
      color: "",
      image: "",
      image_file: null,
      sizes: [{ size: "", quantity: "", unit_cost: "" }]
    };
    onColorVariantsChange([...colorVariants, newColorVariant]);
    setExpandedColors([...expandedColors, colorVariants.length]);
  };

  // Xóa màu
  const handleRemoveColor = (colorIndex) => {
    if (colorVariants.length <= 1) {
      alert("Phải có ít nhất 1 màu sắc");
      return;
    }
    const newVariants = colorVariants.filter((_, i) => i !== colorIndex);
    onColorVariantsChange(newVariants);
    setExpandedColors(expandedColors.filter(i => i !== colorIndex).map(i => i > colorIndex ? i - 1 : i));
  };

  // Sao chép màu (copy sizes, giữ nguyên cấu trúc)
  const handleCopyColor = (colorIndex) => {
    const colorToCopy = colorVariants[colorIndex];
    const newColorVariant = {
      color: "",
      image: "",
      image_file: null,
      sizes: colorToCopy.sizes.map(s => ({ ...s }))
    };
    const newVariants = [...colorVariants];
    newVariants.splice(colorIndex + 1, 0, newColorVariant);
    onColorVariantsChange(newVariants);
    setExpandedColors([...expandedColors, colorIndex + 1]);
  };

  // Cập nhật màu
  const handleColorChange = (colorIndex, field, value) => {
    const newVariants = [...colorVariants];
    newVariants[colorIndex] = { ...newVariants[colorIndex], [field]: value };
    onColorVariantsChange(newVariants);
  };

  // Xử lý upload hình ảnh cho màu
  const handleImageChange = (colorIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const newVariants = [...colorVariants];
      newVariants[colorIndex] = { 
        ...newVariants[colorIndex], 
        image: imageUrl,
        image_file: file 
      };
      onColorVariantsChange(newVariants);
      
      // Callback để parent xử lý upload
      if (onImageFileChange) {
        onImageFileChange(colorIndex, file);
      }
    }
  };

  // Thêm size cho màu
  const handleAddSize = (colorIndex) => {
    const newVariants = [...colorVariants];
    newVariants[colorIndex].sizes.push({ size: "", quantity: "", unit_cost: "" });
    onColorVariantsChange(newVariants);
  };

  // Xóa size
  const handleRemoveSize = (colorIndex, sizeIndex) => {
    const newVariants = [...colorVariants];
    if (newVariants[colorIndex].sizes.length <= 1) {
      alert("Phải có ít nhất 1 size");
      return;
    }
    newVariants[colorIndex].sizes = newVariants[colorIndex].sizes.filter((_, i) => i !== sizeIndex);
    onColorVariantsChange(newVariants);
  };

  // Cập nhật size
  const handleSizeChange = (colorIndex, sizeIndex, field, value) => {
    const newVariants = [...colorVariants];
    newVariants[colorIndex].sizes[sizeIndex] = {
      ...newVariants[colorIndex].sizes[sizeIndex],
      [field]: value
    };
    onColorVariantsChange(newVariants);
  };

  // Tạo nhanh sizes cho màu
  const handleQuickGenerateSizes = (colorIndex) => {
    const start = parseFloat(quickSizeStart);
    const count = parseInt(quickSizeCount);
    const step = parseFloat(quickSizeStep);

    if (isNaN(start) || isNaN(count) || count <= 0) {
      alert("Vui lòng nhập giá trị hợp lệ");
      return;
    }

    const newSizes = [];
    for (let i = 0; i < count; i++) {
      const sizeValue = start + i * step;
      newSizes.push({
        size: step === 1 ? sizeValue.toString() : sizeValue.toFixed(1),
        quantity: quickQuantity || "",
        unit_cost: quickUnitCost || ""
      });
    }

    const newVariants = [...colorVariants];
    newVariants[colorIndex].sizes = newSizes;
    onColorVariantsChange(newVariants);
  };

  // Áp dụng sizes từ màu này sang màu khác
  const handleApplySizesToAll = (sourceColorIndex) => {
    const sourceSizes = colorVariants[sourceColorIndex].sizes;
    const newVariants = colorVariants.map((cv, index) => {
      if (index === sourceColorIndex) return cv;
      return {
        ...cv,
        sizes: sourceSizes.map(s => ({ ...s }))
      };
    });
    onColorVariantsChange(newVariants);
  };

  return (
    <div className="space-y-4">
      {/* Header với thống kê */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
            <Palette size={18} className="text-purple-600" />
            Quản lý biến thể theo màu
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
              {stats.colorCount} màu
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              {stats.totalVariants} biến thể
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              {stats.totalQuantity} SP
            </span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
              {formatCurrency(stats.totalCost)}
            </span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleAddColor}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          <Plus size={14} />
          Thêm màu
        </button>
      </div>

      {/* Quick Size Generator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-xs font-medium text-blue-800 mb-2">⚡ Tạo nhanh sizes (áp dụng khi bấm "Tạo sizes" ở mỗi màu)</div>
        <div className="grid grid-cols-6 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Size bắt đầu</label>
            <input
              type="number"
              value={quickSizeStart}
              onChange={(e) => setQuickSizeStart(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Số lượng size</label>
            <input
              type="number"
              value={quickSizeCount}
              onChange={(e) => setQuickSizeCount(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Bước nhảy</label>
            <select
              value={quickSizeStep}
              onChange={(e) => setQuickSizeStep(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="0.5">0.5</option>
              <option value="1">1</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">SL mỗi size</label>
            <input
              type="number"
              value={quickQuantity}
              onChange={(e) => setQuickQuantity(e.target.value)}
              placeholder="Tùy chọn"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Giá nhập</label>
            <input
              type="number"
              value={quickUnitCost}
              onChange={(e) => setQuickUnitCost(e.target.value)}
              placeholder="Tùy chọn"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <div className="text-xs text-gray-500">← Cấu hình sẵn</div>
          </div>
        </div>
      </div>

      {/* Color Variants List */}
      <div className="space-y-3">
        {colorVariants.map((colorVariant, colorIndex) => {
          const isExpanded = expandedColors.includes(colorIndex);
          const colorTotal = colorVariant.sizes?.reduce((sum, s) => {
            return sum + ((parseInt(s.quantity) || 0) * (parseFloat(s.unit_cost) || 0));
          }, 0) || 0;
          const colorQty = colorVariant.sizes?.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0) || 0;

          return (
            <div
              key={colorIndex}
              className={`border-2 rounded-xl overflow-hidden transition-all ${
                isExpanded ? 'border-purple-300 shadow-md' : 'border-gray-200'
              }`}
            >
              {/* Color Header */}
              <div 
                className={`flex items-center justify-between p-3 cursor-pointer ${
                  isExpanded ? 'bg-purple-50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => toggleExpand(colorIndex)}
              >
                <div className="flex items-center gap-3">
                  {/* Color Image Preview */}
                  <div className="w-12 h-12 rounded-lg border-2 border-gray-300 overflow-hidden bg-white flex items-center justify-center">
                    {colorVariant.image ? (
                      <img src={colorVariant.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Image size={20} className="text-gray-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-800">
                      {colorVariant.color || `Màu ${colorIndex + 1}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {colorVariant.sizes?.length || 0} sizes • {colorQty} SP • {formatCurrency(colorTotal)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleCopyColor(colorIndex); }}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Sao chép màu này"
                  >
                    <Copy size={16} />
                  </button>
                  {colorVariants.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveColor(colorIndex); }}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Xóa màu"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Color Content */}
              {isExpanded && (
                <div className="p-4 bg-white">
                  {/* Color Info */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tên màu *</label>
                      <input
                        type="text"
                        value={colorVariant.color}
                        onChange={(e) => handleColorChange(colorIndex, "color", e.target.value)}
                        placeholder="VD: Đỏ, Trắng, Đen..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hình ảnh màu này</label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(colorIndex, e)}
                            className="hidden"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-sm text-gray-600">
                            {colorVariant.image ? "Đổi hình ảnh" : "Chọn hình ảnh"}
                          </span>
                        </label>
                        {colorVariant.image && (
                          <img src={colorVariant.image} alt="" className="w-10 h-10 rounded object-cover border" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sizes Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Danh sách sizes</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleQuickGenerateSizes(colorIndex); }}
                          className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded border border-blue-300"
                        >
                          Tạo sizes
                        </button>
                        {colorVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleApplySizesToAll(colorIndex); }}
                            className="text-xs px-2 py-1 text-purple-600 hover:bg-purple-50 rounded border border-purple-300"
                          >
                            Áp dụng cho tất cả màu
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleAddSize(colorIndex); }}
                          className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded border border-green-300"
                        >
                          + Thêm size
                        </button>
                      </div>
                    </div>

                    {/* Sizes Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600">
                        <div>Size</div>
                        <div>Số lượng</div>
                        <div>Giá nhập</div>
                        <div>Thành tiền</div>
                        <div className="text-center">Xóa</div>
                      </div>
                      <div className="divide-y max-h-48 overflow-y-auto">
                        {colorVariant.sizes?.map((size, sizeIndex) => {
                          const subtotal = (parseInt(size.quantity) || 0) * (parseFloat(size.unit_cost) || 0);
                          return (
                            <div key={sizeIndex} className="grid grid-cols-5 gap-2 px-3 py-2 items-center hover:bg-gray-50">
                              <input
                                type="text"
                                value={size.size}
                                onChange={(e) => handleSizeChange(colorIndex, sizeIndex, "size", e.target.value)}
                                placeholder="38"
                                className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <input
                                type="number"
                                value={size.quantity}
                                onChange={(e) => handleSizeChange(colorIndex, sizeIndex, "quantity", e.target.value)}
                                placeholder="10"
                                className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <SmartPriceInput
                                value={size.unit_cost}
                                onChange={(value) => handleSizeChange(colorIndex, sizeIndex, "unit_cost", value)}
                                placeholder="80.000"
                                productContext={productContext}
                                className="text-sm py-1.5"
                              />
                              <div className="text-sm font-medium text-gray-700">
                                {formatCurrency(subtotal)}
                              </div>
                              <div className="text-center">
                                {colorVariant.sizes.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleRemoveSize(colorIndex, sizeIndex); }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorVariantManager;
