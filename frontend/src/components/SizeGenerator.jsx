import { useState } from "react";
import { Plus } from "lucide-react";

/**
 * Component tự động tạo các size liên tiếp
 * @param {Function} onGenerate - Callback khi generate sizes (nhận array của sizes)
 */
const SizeGenerator = ({ onGenerate }) => {
  const [startSize, setStartSize] = useState("");
  const [count, setCount] = useState("");
  const [increment, setIncrement] = useState("0.5");

  const handleGenerate = () => {
    const start = parseFloat(startSize);
    const num = parseInt(count);
    const inc = parseFloat(increment);

    if (isNaN(start) || isNaN(num) || num <= 0 || isNaN(inc)) {
      alert("Vui lòng nhập giá trị hợp lệ");
      return;
    }

    const sizes = [];
    for (let i = 0; i < num; i++) {
      sizes.push((start + i * inc).toFixed(1));
    }

    onGenerate(sizes);
    
    // Reset form
    setStartSize("");
    setCount("");
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-900">
          🚀 Tạo nhanh nhiều size
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Size bắt đầu
          </label>
          <input
            type="number"
            step="0.5"
            value={startSize}
            onChange={(e) => setStartSize(e.target.value)}
            placeholder="VD: 36"
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          />
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
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Bước nhảy
          </label>
          <select
            value={increment}
            onChange={(e) => setIncrement(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="0.5">0.5</option>
            <option value="1">1.0</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center justify-center"
          >
            <Plus size={14} className="mr-1" />
            Tạo
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        VD: Size 36, số lượng 5, bước 0.5 → tạo: 36, 36.5, 37, 37.5, 38
      </p>
    </div>
  );
};

export default SizeGenerator;
