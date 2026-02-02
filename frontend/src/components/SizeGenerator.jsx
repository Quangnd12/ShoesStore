import { useState } from "react";
import { Plus, Zap } from "lucide-react";

/**
 * Component tự động tạo các size liên tiếp
 * @param {Function} onGenerate - Callback khi generate sizes (nhận array của sizes với quantity và unit_cost)
 * @param {string} mode - "replace" (thay thế) hoặc "append" (thêm vào)
 * @param {boolean} showColor - Hiển thị ô màu sắc
 */
const SizeGenerator = ({ onGenerate, mode = "replace", showColor = false }) => {
  const [startSize, setStartSize] = useState("");
  const [count, setCount] = useState("");
  const [increment, setIncrement] = useState("0.5");
  const [defaultQuantity, setDefaultQuantity] = useState("");
  const [defaultUnitCost, setDefaultUnitCost] = useState("");
  const [defaultColor, setDefaultColor] = useState("");
  const [sizeType, setSizeType] = useState("number"); // number, letter, custom
  const [customSizes, setCustomSizes] = useState(""); // S, M, L, XL hoặc 36, 37, 38

  const handleGenerate = () => {
    let sizes = [];

    if (sizeType === "custom") {
      // Parse custom sizes (comma or space separated)
      const sizeList = customSizes.split(/[,\s]+/).filter(s => s.trim());
      if (sizeList.length === 0) {
        alert("Vui lòng nhập danh sách size");
        return;
      }
      sizes = sizeList.map(size => ({
        size: size.trim(),
        quantity: defaultQuantity || "",
        unit_cost: defaultUnitCost || "",
        color: defaultColor || "",
      }));
    } else if (sizeType === "letter") {
      // Letter sizes: XS, S, M, L, XL, XXL, XXXL
      const letterSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
      const startIdx = letterSizes.indexOf(startSize.toUpperCase());
      const num = parseInt(count);
      
      if (startIdx === -1 || isNaN(num) || num <= 0) {
        alert("Vui lòng chọn size bắt đầu hợp lệ (XS, S, M, L, XL, XXL, XXXL)");
        return;
      }
      
      for (let i = 0; i < num && (startIdx + i) < letterSizes.length; i++) {
        sizes.push({
          size: letterSizes[startIdx + i],
          quantity: defaultQuantity || "",
          unit_cost: defaultUnitCost || "",
          color: defaultColor || "",
        });
      }
    } else {
      // Number sizes
      const start = parseFloat(startSize);
      const num = parseInt(count);
      const inc = parseFloat(increment);

      if (isNaN(start) || isNaN(num) || num <= 0 || isNaN(inc)) {
        alert("Vui lòng nhập giá trị hợp lệ");
        return;
      }

      for (let i = 0; i < num; i++) {
        const sizeValue = start + i * inc;
        sizes.push({
          size: inc === 1 ? sizeValue.toString() : sizeValue.toFixed(1),
          quantity: defaultQuantity || "",
          unit_cost: defaultUnitCost || "",
          color: defaultColor || "",
        });
      }
    }

    onGenerate(sizes, mode);
    
    // Reset form
    setStartSize("");
    setCount("");
    setDefaultQuantity("");
    setDefaultUnitCost("");
    setDefaultColor("");
    setCustomSizes("");
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-blue-900 flex items-center gap-2">
          <Zap size={16} className="text-yellow-500" />
          Tạo nhanh biến thể
        </span>
        <div className="flex items-center gap-2">
          <select
            value={sizeType}
            onChange={(e) => setSizeType(e.target.value)}
            className="px-2 py-1 text-xs border border-blue-300 rounded bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="number">Size số (36, 37...)</option>
            <option value="letter">Size chữ (S, M, L...)</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
        </div>
      </div>

      {sizeType === "custom" ? (
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">
            Nhập danh sách size (cách nhau bởi dấu phẩy hoặc khoảng trắng)
          </label>
          <input
            type="text"
            value={customSizes}
            onChange={(e) => setCustomSizes(e.target.value)}
            placeholder="VD: S, M, L, XL hoặc 36 37 38 39 40"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Size bắt đầu
            </label>
            {sizeType === "letter" ? (
              <select
                value={startSize}
                onChange={(e) => setStartSize(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
              </select>
            ) : (
              <input
                type="number"
                step="0.5"
                value={startSize}
                onChange={(e) => setStartSize(e.target.value)}
                placeholder="VD: 36"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Số lượng size
            </label>
            <input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="VD: 5"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {sizeType === "number" && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Bước nhảy
              </label>
              <select
                value={increment}
                onChange={(e) => setIncrement(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="0.5">0.5</option>
                <option value="1">1.0</option>
                <option value="2">2.0</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div className={`grid ${showColor ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            SL mỗi size
          </label>
          <input
            type="number"
            min="0"
            value={defaultQuantity}
            onChange={(e) => setDefaultQuantity(e.target.value)}
            placeholder="Tùy chọn"
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Giá nhập
          </label>
          <input
            type="number"
            min="0"
            value={defaultUnitCost}
            onChange={(e) => setDefaultUnitCost(e.target.value)}
            placeholder="Tùy chọn"
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {showColor && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Màu sắc
            </label>
            <input
              type="text"
              value={defaultColor}
              onChange={(e) => setDefaultColor(e.target.value)}
              placeholder="VD: Đen"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center justify-center font-medium"
          >
            <Plus size={14} className="mr-1" />
            Tạo
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        💡 Nhập SL và Giá nhập để tự động điền cho tất cả biến thể được tạo
      </p>
    </div>
  );
};

export default SizeGenerator;
