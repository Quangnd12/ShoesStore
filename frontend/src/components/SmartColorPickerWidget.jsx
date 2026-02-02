import { useState, useEffect, useCallback, useRef } from "react";
import { Palette, X, Copy, Check, RotateCcw, Upload, Sparkles, Camera } from "lucide-react";

// Color database
const COLOR_DATABASE = {
  "đen": "#000000", "trắng": "#FFFFFF", "đỏ": "#FF0000", "xanh lá": "#008000",
  "xanh dương": "#0000FF", "vàng": "#FFFF00", "cam": "#FFA500", "tím": "#800080",
  "hồng": "#FFC0CB", "nâu": "#A52A2A", "xám": "#808080", "bạc": "#C0C0C0",
  "xanh navy": "#000080", "xanh lam": "#00FFFF", "xanh teal": "#008080",
  "vàng gold": "#FFD700", "đỏ đậm": "#8B0000", "xanh olive": "#808000",
  "black": "#000000", "white": "#FFFFFF", "red": "#FF0000", "green": "#008000",
  "blue": "#0000FF", "yellow": "#FFFF00", "orange": "#FFA500", "purple": "#800080",
  "pink": "#FFC0CB", "brown": "#A52A2A", "gray": "#808080", "silver": "#C0C0C0",
  "navy": "#000080", "cyan": "#00FFFF", "teal": "#008080", "gold": "#FFD700",
  "crimson": "#DC143C", "coral": "#FF7F50", "salmon": "#FA8072", "khaki": "#F0E68C",
  "lavender": "#E6E6FA", "beige": "#F5F5DC", "ivory": "#FFFFF0", "maroon": "#800000",
  "olive": "#808000", "lime": "#00FF00", "aqua": "#00FFFF", "magenta": "#FF00FF",
  "indigo": "#4B0082", "violet": "#EE82EE", "tan": "#D2B48C", "chocolate": "#D2691E",
};

const HEX_TO_NAME = Object.entries(COLOR_DATABASE).reduce((acc, [name, hex]) => {
  acc[hex.toUpperCase()] = name;
  return acc;
}, {});

const STORAGE_KEY = "smartColorPickerWidget";

// Quick colors for footwear
const QUICK_COLORS = [
  { name: "Đen", hex: "#000000" },
  { name: "Trắng", hex: "#FFFFFF" },
  { name: "Nâu", hex: "#A52A2A" },
  { name: "Navy", hex: "#000080" },
  { name: "Xám", hex: "#808080" },
  { name: "Đỏ", hex: "#FF0000" },
  { name: "Hồng", hex: "#FFC0CB" },
  { name: "Xanh", hex: "#008000" },
  { name: "Kem", hex: "#FFFDD0" },
  { name: "Be", hex: "#F5F5DC" },
];

const SmartColorPickerWidget = () => {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).isOpen : false;
    } catch { return false; }
  });
  
  const [activePanel, setActivePanel] = useState("color"); // "color" or "material"
  const [selectedColor, setSelectedColor] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).selectedColor : "#6366F1";
    } catch { return "#6366F1"; }
  });

  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.position || { x: window.innerWidth - 80, y: window.innerHeight - 80 };
      }
    } catch {}
    return { x: window.innerWidth - 80, y: window.innerHeight - 80 };
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [inputValue, setInputValue] = useState("");
  const [previewColor, setPreviewColor] = useState(null);
  const [copied, setCopied] = useState(false);
  const [recentColors, setRecentColors] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).recentColors || [] : [];
    } catch { return []; }
  });

  // Material detection states
  const [materialImage, setMaterialImage] = useState(null);
  const [detectedMaterial, setDetectedMaterial] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const buttonRef = useRef(null);
  const fileInputRef = useRef(null);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isOpen, selectedColor, recentColors, position
    }));
  }, [isOpen, selectedColor, recentColors, position]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(28, Math.min(window.innerWidth - 28, e.clientX - dragOffset.x)),
      y: Math.max(28, Math.min(window.innerHeight - 28, e.clientY - dragOffset.y))
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Parse color input
  const parseColorInput = useCallback((input) => {
    if (!input) return null;
    const trimmed = input.trim().toLowerCase();
    
    if (COLOR_DATABASE[trimmed]) return COLOR_DATABASE[trimmed];
    
    const hexMatch = trimmed.match(/^#?([a-f0-9]{6}|[a-f0-9]{3})$/i);
    if (hexMatch) {
      let hex = hexMatch[1];
      if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
      return `#${hex.toUpperCase()}`;
    }
    
    const rgbMatch = trimmed.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      if (r <= 255 && g <= 255 && b <= 255) {
        return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
      }
    }
    
    return null;
  }, []);

  const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string') return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getColorName = (hex) => {
    if (!hex || typeof hex !== 'string') return null;
    return HEX_TO_NAME[hex.toUpperCase()] || null;
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setPreviewColor(parseColorInput(e.target.value));
  };

  const handleSelectColor = (color) => {
    setSelectedColor(color);
    setPreviewColor(null);
    setInputValue("");
    setRecentColors(prev => [color, ...prev.filter(c => c !== color)].slice(0, 8));
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  // Material detection (simulated AI)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setMaterialImage(event.target.result);
      analyzeMaterial(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeMaterial = async (imageData) => {
    setAnalyzing(true);
    setDetectedMaterial(null);
    
    // Simulated AI analysis (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
  const materials = [
  // Nhóm Da
  { id: "genuine_leather", name: "Da thật", confidence: 92, description: "Da bò/heo tự nhiên, có lỗ chân lông, độ đàn hồi cao" },
  { id: "suede", name: "Da lộn", confidence: 85, description: "Bề mặt xám, có sợi nhỏ li ti, không bóng" },
  { id: "nubuck", name: "Da Nubuck", confidence: 80, description: "Bề mặt mịn như nhung, dày và bền hơn da lộn" },
  { id: "pu_leather", name: "Da tổng hợp (PU)", confidence: 85, description: "Bề mặt đồng nhất, có lớp phủ nhựa, vân nhân tạo" },
  { id: "patent_leather", name: "Da bóng", confidence: 95, description: "Bề mặt phản chiếu ánh sáng mạnh, bóng loáng" },

  // Nhóm Vải
  { id: "canvas", name: "Vải Canvas", confidence: 78, description: "Sợi dệt thô, vân vải đan chéo rõ rệt" },
  { id: "mesh", name: "Vải Mesh", confidence: 88, description: "Cấu trúc lưới có lỗ thoát khí" },
  { id: "knit", name: "Vải Knit", confidence: 82, description: "Dạng dệt sợi len co giãn, không có đường may" },

  // Nhóm Đế và Vật liệu khác
  { id: "rubber", name: "Cao su", confidence: 95, description: "Đế đặc, độ bám cao, thường có màu nâu/đen/trắng" },
  { id: "eva_foam", name: "EVA Foam", confidence: 90, description: "Xốp nhẹ, thường dùng cho đế giữa, bề mặt có thể có vết nhăn nhẹ" },
  { id: "tpu", name: "Nhựa TPU", confidence: 75, description: "Nhựa cứng, thường dùng làm khung hoặc gót giày" }
];
    
    setDetectedMaterial(materials[Math.floor(Math.random() * materials.length)]);
    setAnalyzing(false);
  };

  const displayColor = previewColor || selectedColor;
  const rgb = hexToRgb(displayColor);
  const colorName = getColorName(displayColor);

  return (
    <>
      {/* Floating Button */}
      <div
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        className={`fixed z-50 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ left: position.x, top: position.y, transform: "translate(-50%, -50%)" }}
      >
        <button
          onClick={() => !isDragging && setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          style={{ 
            backgroundColor: selectedColor,
            border: "3px solid white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}
        >
          <Palette 
            className="w-6 h-6" 
            style={{ color: rgb && (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 186 ? "#000" : "#FFF" }}
          />
        </button>
      </div>

      {/* Split Panel */}
      {isOpen && (
        <div 
          className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{
            width: 340,
            left: Math.min(position.x + 40, window.innerWidth - 360),
            top: Math.max(position.y - 300, 20),
          }}
        >
          {/* Header with tabs */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">Smart Tools</h3>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            {/* Tab buttons */}
            <div className="flex bg-white/20 rounded-lg p-0.5">
              <button
                onClick={() => setActivePanel("color")}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                  activePanel === "color" ? "bg-white text-indigo-600" : "text-white/90 hover:text-white"
                }`}
              >
                <Palette size={14} className="inline mr-1" />
                Màu sắc
              </button>
              <button
                onClick={() => setActivePanel("material")}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                  activePanel === "material" ? "bg-white text-indigo-600" : "text-white/90 hover:text-white"
                }`}
              >
                <Sparkles size={14} className="inline mr-1" />
                Chất liệu AI
              </button>
            </div>
          </div>

          {/* Color Panel */}
          {activePanel === "color" && (
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {/* Color Preview */}
              <div className="flex gap-3 mb-4">
                <div 
                  className="w-16 h-16 rounded-xl border-2 border-gray-200"
                  style={{ backgroundColor: displayColor }}
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{colorName || "Custom"}</p>
                  <div 
                    className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer hover:text-indigo-600"
                    onClick={() => handleCopy(displayColor)}
                  >
                    <span className="font-mono">{displayColor}</span>
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </div>
                  {rgb && <p className="text-xs text-gray-500">RGB({rgb.r}, {rgb.g}, {rgb.b})</p>}
                </div>
              </div>

              {/* Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && previewColor && handleSelectColor(previewColor)}
                  placeholder="Nhập: crimson, #FF5733, rgb(255,87,51)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
                {previewColor && (
                  <button
                    onClick={() => handleSelectColor(previewColor)}
                    className="mt-2 w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    Chọn màu này
                  </button>
                )}
              </div>

              {/* Quick Colors */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Màu phổ biến</p>
                <div className="grid grid-cols-5 gap-2">
                  {QUICK_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => handleSelectColor(color.hex)}
                      className={`w-full aspect-square rounded-lg border-2 ${
                        selectedColor === color.hex ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Recent Colors */}
              {recentColors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Gần đây</p>
                    <button onClick={() => setRecentColors([])} className="text-xs text-gray-400 hover:text-gray-600">
                      <RotateCcw size={12} className="inline mr-1" />Xóa
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {recentColors.map((color, i) => (
                      <button
                        key={`${color}-${i}`}
                        onClick={() => handleSelectColor(color)}
                        className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Material Panel */}
          {activePanel === "material" && (
            <div className="p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
              >
                {materialImage ? (
                  <img src={materialImage} alt="Uploaded" className="w-full h-32 object-cover rounded-lg mb-2" />
                ) : (
                  <>
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click để upload hình ảnh</p>
                    <p className="text-xs text-gray-400 mt-1">AI sẽ nhận dạng chất liệu</p>
                  </>
                )}
              </div>

              {/* Analysis result */}
              {analyzing && (
                <div className="mt-4 text-center py-4">
                  <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Đang phân tích chất liệu...</p>
                </div>
              )}

              {detectedMaterial && !analyzing && (
                <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-green-600">Kết quả AI</span>
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                      {detectedMaterial.confidence}% chính xác
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">{detectedMaterial.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{detectedMaterial.description}</p>
                  
                  <button
                    onClick={() => {
                      setMaterialImage(null);
                      setDetectedMaterial(null);
                    }}
                    className="mt-3 w-full py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Phân tích ảnh khác
                  </button>
                </div>
              )}

              {/* Tips */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-1">💡 Mẹo chụp ảnh</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Chụp cận cảnh bề mặt chất liệu</li>
                  <li>• Đảm bảo ánh sáng đủ, không bị bóng</li>
                  <li>• Tránh chụp qua kính hoặc bao bì</li>
                </ul>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center border-t">
            {activePanel === "color" ? "Hỗ trợ: Tên màu (EN/VN), Hex, RGB" : "AI Material Detection v1.0"}
          </div>
        </div>
      )}
    </>
  );
};

export default SmartColorPickerWidget;
