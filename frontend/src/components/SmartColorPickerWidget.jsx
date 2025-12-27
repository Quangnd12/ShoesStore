import { useState, useEffect, useCallback, useRef } from "react";
import { Palette, X, Copy, Check, RotateCcw, Pipette, GripVertical } from "lucide-react";

// Comprehensive color name database (147 CSS named colors + Vietnamese)
const COLOR_DATABASE = {
  // Basic colors - Vietnamese
  "đen": "#000000", "trắng": "#FFFFFF", "đỏ": "#FF0000", "xanh lá": "#008000",
  "xanh dương": "#0000FF", "vàng": "#FFFF00", "cam": "#FFA500", "tím": "#800080",
  "hồng": "#FFC0CB", "nâu": "#A52A2A", "xám": "#808080", "bạc": "#C0C0C0",
  "xanh navy": "#000080", "xanh lam": "#00FFFF", "xanh teal": "#008080",
  "vàng gold": "#FFD700", "đỏ đậm": "#8B0000", "xanh olive": "#808000",
  
  // CSS Named Colors
  "aliceblue": "#F0F8FF", "antiquewhite": "#FAEBD7", "aqua": "#00FFFF",
  "aquamarine": "#7FFFD4", "azure": "#F0FFFF", "beige": "#F5F5DC",
  "bisque": "#FFE4C4", "black": "#000000", "blanchedalmond": "#FFEBCD",
  "blue": "#0000FF", "blueviolet": "#8A2BE2", "brown": "#A52A2A",
  "burlywood": "#DEB887", "cadetblue": "#5F9EA0", "chartreuse": "#7FFF00",
  "chocolate": "#D2691E", "coral": "#FF7F50", "cornflowerblue": "#6495ED",
  "cornsilk": "#FFF8DC", "crimson": "#DC143C", "cyan": "#00FFFF",
  "darkblue": "#00008B", "darkcyan": "#008B8B", "darkgoldenrod": "#B8860B",
  "darkgray": "#A9A9A9", "darkgreen": "#006400", "darkkhaki": "#BDB76B",
  "darkmagenta": "#8B008B", "darkolivegreen": "#556B2F", "darkorange": "#FF8C00",
  "darkorchid": "#9932CC", "darkred": "#8B0000", "darksalmon": "#E9967A",
  "darkseagreen": "#8FBC8F", "darkslateblue": "#483D8B", "darkslategray": "#2F4F4F",
  "darkturquoise": "#00CED1", "darkviolet": "#9400D3", "deeppink": "#FF1493",
  "deepskyblue": "#00BFFF", "dimgray": "#696969", "dodgerblue": "#1E90FF",
  "firebrick": "#B22222", "floralwhite": "#FFFAF0", "forestgreen": "#228B22",
  "fuchsia": "#FF00FF", "gainsboro": "#DCDCDC", "ghostwhite": "#F8F8FF",
  "gold": "#FFD700", "goldenrod": "#DAA520", "gray": "#808080",
  "green": "#008000", "greenyellow": "#ADFF2F", "honeydew": "#F0FFF0",
  "hotpink": "#FF69B4", "indianred": "#CD5C5C", "indigo": "#4B0082",
  "ivory": "#FFFFF0", "khaki": "#F0E68C", "lavender": "#E6E6FA",
  "lavenderblush": "#FFF0F5", "lawngreen": "#7CFC00", "lemonchiffon": "#FFFACD",
  "lightblue": "#ADD8E6", "lightcoral": "#F08080", "lightcyan": "#E0FFFF",
  "lightgoldenrodyellow": "#FAFAD2", "lightgray": "#D3D3D3", "lightgreen": "#90EE90",
  "lightpink": "#FFB6C1", "lightsalmon": "#FFA07A", "lightseagreen": "#20B2AA",
  "lightskyblue": "#87CEFA", "lightslategray": "#778899", "lightsteelblue": "#B0C4DE",
  "lightyellow": "#FFFFE0", "lime": "#00FF00", "limegreen": "#32CD32",
  "linen": "#FAF0E6", "magenta": "#FF00FF", "maroon": "#800000",
  "mediumaquamarine": "#66CDAA", "mediumblue": "#0000CD", "mediumorchid": "#BA55D3",
  "mediumpurple": "#9370DB", "mediumseagreen": "#3CB371", "mediumslateblue": "#7B68EE",
  "mediumspringgreen": "#00FA9A", "mediumturquoise": "#48D1CC", "mediumvioletred": "#C71585",
  "midnightblue": "#191970", "mintcream": "#F5FFFA", "mistyrose": "#FFE4E1",
  "moccasin": "#FFE4B5", "navajowhite": "#FFDEAD", "navy": "#000080",
  "oldlace": "#FDF5E6", "olive": "#808000", "olivedrab": "#6B8E23",
  "orange": "#FFA500", "orangered": "#FF4500", "orchid": "#DA70D6",
  "palegoldenrod": "#EEE8AA", "palegreen": "#98FB98", "paleturquoise": "#AFEEEE",
  "palevioletred": "#DB7093", "papayawhip": "#FFEFD5", "peachpuff": "#FFDAB9",
  "peru": "#CD853F", "pink": "#FFC0CB", "plum": "#DDA0DD",
  "powderblue": "#B0E0E6", "purple": "#800080", "rebeccapurple": "#663399",
  "red": "#FF0000", "rosybrown": "#BC8F8F", "royalblue": "#4169E1",
  "saddlebrown": "#8B4513", "salmon": "#FA8072", "sandybrown": "#F4A460",
  "seagreen": "#2E8B57", "seashell": "#FFF5EE", "sienna": "#A0522D",
  "silver": "#C0C0C0", "skyblue": "#87CEEB", "slateblue": "#6A5ACD",
  "slategray": "#708090", "snow": "#FFFAFA", "springgreen": "#00FF7F",
  "steelblue": "#4682B4", "tan": "#D2B48C", "teal": "#008080",
  "thistle": "#D8BFD8", "tomato": "#FF6347", "turquoise": "#40E0D0",
  "violet": "#EE82EE", "wheat": "#F5DEB3", "white": "#FFFFFF",
  "whitesmoke": "#F5F5F5", "yellow": "#FFFF00", "yellowgreen": "#9ACD32"
};

// Reverse lookup: hex to name
const HEX_TO_NAME = Object.entries(COLOR_DATABASE).reduce((acc, [name, hex]) => {
  acc[hex.toUpperCase()] = name;
  return acc;
}, {});

const STORAGE_KEY = "smartColorPickerWidget";

const SmartColorPickerWidget = () => {
  // State with localStorage persistence
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).isOpen : false;
  });
  
  const [selectedColor, setSelectedColor] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).selectedColor : "#6366F1";
  });

  // Position state with localStorage persistence
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.position || { x: window.innerWidth - 80, y: window.innerHeight - 80 };
    }
    return { x: window.innerWidth - 80, y: window.innerHeight - 80 };
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [inputValue, setInputValue] = useState("");
  const [previewColor, setPreviewColor] = useState(null);
  const [copied, setCopied] = useState(false);
  const [recentColors, setRecentColors] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).recentColors || [] : [];
  });
  
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isOpen,
      selectedColor,
      recentColors,
      position
    }));
  }, [isOpen, selectedColor, recentColors, position]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
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
    
    const newX = Math.max(28, Math.min(window.innerWidth - 28, e.clientX - dragOffset.x));
    const newY = Math.max(28, Math.min(window.innerHeight - 28, e.clientY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left - rect.width / 2,
      y: touch.clientY - rect.top - rect.height / 2
    });
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    const newX = Math.max(28, Math.min(window.innerWidth - 28, touch.clientX - dragOffset.x));
    const newY = Math.max(28, Math.min(window.innerHeight - 28, touch.clientY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragOffset]);

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 28),
        y: Math.min(prev.y, window.innerHeight - 28)
      }));
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Parse color input (name, hex, or RGB)
  const parseColorInput = useCallback((input) => {
    if (!input) return null;
    const trimmed = input.trim().toLowerCase();
    
    // Check color name database
    if (COLOR_DATABASE[trimmed]) {
      return COLOR_DATABASE[trimmed];
    }
    
    // Check hex format
    const hexMatch = trimmed.match(/^#?([a-f0-9]{6}|[a-f0-9]{3})$/i);
    if (hexMatch) {
      let hex = hexMatch[1];
      if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
      }
      return `#${hex.toUpperCase()}`;
    }
    
    // Check RGB format: rgb(r, g, b) or r, g, b or r g b
    const rgbMatch = trimmed.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      if (r <= 255 && g <= 255 && b <= 255) {
        return rgbToHex(r, g, b);
      }
    }
    
    // Check simple RGB: 255, 0, 0 or 255 0 0
    const simpleRgbMatch = trimmed.match(/^(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})$/);
    if (simpleRgbMatch) {
      const [, r, g, b] = simpleRgbMatch.map(Number);
      if (r <= 255 && g <= 255 && b <= 255) {
        return rgbToHex(r, g, b);
      }
    }
    
    return null;
  }, []);

  // Convert RGB to Hex
  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
  };

  // Convert Hex to RGB
  const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string') return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Get color name from hex
  const getColorName = (hex) => {
    if (!hex || typeof hex !== 'string') return null;
    return HEX_TO_NAME[hex.toUpperCase()] || null;
  };

  // Handle input change with live preview
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    const parsed = parseColorInput(value);
    setPreviewColor(parsed);
  };

  // Select color
  const handleSelectColor = (color) => {
    setSelectedColor(color);
    setPreviewColor(null);
    setInputValue("");
    
    // Add to recent colors
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 8);
    });
  };

  // Copy to clipboard
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Quick colors for footwear
  const quickColors = [
    { name: "Đen", hex: "#000000" },
    { name: "Trắng", hex: "#FFFFFF" },
    { name: "Nâu", hex: "#A52A2A" },
    { name: "Navy", hex: "#000080" },
    { name: "Xám", hex: "#808080" },
    { name: "Đỏ", hex: "#FF0000" },
    { name: "Hồng", hex: "#FFC0CB" },
    { name: "Xanh lá", hex: "#008000" },
  ];

  const displayColor = previewColor || selectedColor;
  const rgb = hexToRgb(displayColor);
  const colorName = getColorName(displayColor);

  return (
    <>
      {/* Floating Toggle Button - Draggable */}
      <div
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`fixed z-50 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)"
        }}
      >
        <button
          onClick={() => !isDragging && setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg 
            flex items-center justify-center transition-all duration-300 
            hover:scale-110 active:scale-95 ${isOpen ? "rotate-180" : ""}`}
          style={{ 
            backgroundColor: selectedColor,
            border: "3px solid white",
            boxShadow: isDragging 
              ? "0 8px 30px rgba(0,0,0,0.4)" 
              : "0 4px 20px rgba(0,0,0,0.3)"
          }}
          title="Smart Color Picker (Kéo để di chuyển)"
        >
          <Palette 
            className="w-6 h-6 transition-transform" 
            style={{ 
              color: rgb && (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 186 
                ? "#000000" : "#FFFFFF" 
            }}
          />
        </button>
        
        {/* Drag indicator */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full shadow 
            flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
            <GripVertical className="w-3 h-3 text-gray-500" />
          </div>
        )}
      </div>

      {/* Color Dashboard */}
      {isOpen && (
        <div 
          className="fixed z-50 w-80 bg-white rounded-2xl shadow-2xl 
            border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
          style={{
            left: Math.min(position.x + 40, window.innerWidth - 340),
            top: Math.max(position.y - 400, 20),
            maxHeight: "calc(100vh - 100px)"
          }}
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 
            flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pipette className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold">Smart Color Picker</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Color Preview */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex gap-4">
              <div 
                className="w-20 h-20 rounded-xl border-2 border-gray-200 shadow-inner"
                style={{ backgroundColor: displayColor }}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-800">
                    {colorName || "Custom"}
                  </span>
                  {previewColor && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                      Preview
                    </span>
                  )}
                </div>
                <div 
                  className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer 
                    hover:text-indigo-600 transition-colors"
                  onClick={() => handleCopy(displayColor)}
                >
                  <span className="font-mono">{displayColor}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </div>
                {rgb && (
                  <div className="text-xs text-gray-500 font-mono">
                    RGB({rgb.r}, {rgb.g}, {rgb.b})
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input Field */}
          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhập màu (tên, hex, RGB)
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && previewColor) {
                    handleSelectColor(previewColor);
                  }
                }}
                placeholder="vd: crimson, #FF5733, 255,87,51"
                className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg 
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                  transition-all text-sm"
              />
              {previewColor && (
                <div 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 
                    rounded border border-gray-300"
                  style={{ backgroundColor: previewColor }}
                />
              )}
            </div>
            {inputValue && !previewColor && (
              <p className="text-xs text-red-500 mt-1">Không nhận dạng được màu</p>
            )}
            {previewColor && (
              <button
                onClick={() => handleSelectColor(previewColor)}
                className="mt-2 w-full py-2 bg-indigo-600 text-white rounded-lg 
                  hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Chọn màu này
              </button>
            )}
          </div>

          {/* Quick Colors */}
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Màu phổ biến (Giày dép)</h4>
            <div className="grid grid-cols-8 gap-2">
              {quickColors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => handleSelectColor(color.hex)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 
                    ${selectedColor === color.hex 
                      ? "border-indigo-500 ring-2 ring-indigo-200" 
                      : "border-gray-200 hover:border-gray-300"}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Recent Colors */}
          {recentColors.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Màu gần đây</h4>
                <button
                  onClick={() => setRecentColors([])}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Xóa
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {recentColors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    onClick={() => handleSelectColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110
                      ${selectedColor === color 
                        ? "border-indigo-500 ring-2 ring-indigo-200" 
                        : "border-gray-200 hover:border-gray-300"}`}
                    style={{ backgroundColor: color }}
                    title={getColorName(color) || color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center">
            Hỗ trợ: Tên màu (EN/VN), Hex, RGB
          </div>
        </div>
      )}
    </>
  );
};

export default SmartColorPickerWidget;
