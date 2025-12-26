import { useState, useEffect, useRef } from "react";
import { Palette, Upload, RefreshCw, Check } from "lucide-react";

const ColorPicker = ({ 
  value = "", 
  onChange, 
  imageUrl = null,
  onImageUpload = null,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [extractedColors, setExtractedColors] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [customColor, setCustomColor] = useState(value || "#000000");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Predefined color palette
  const predefinedColors = [
    { name: "Đen", hex: "#000000" },
    { name: "Trắng", hex: "#FFFFFF" },
    { name: "Xám", hex: "#808080" },
    { name: "Đỏ", hex: "#FF0000" },
    { name: "Xanh dương", hex: "#0000FF" },
    { name: "Xanh lá", hex: "#008000" },
    { name: "Vàng", hex: "#FFFF00" },
    { name: "Cam", hex: "#FFA500" },
    { name: "Tím", hex: "#800080" },
    { name: "Hồng", hex: "#FFC0CB" },
    { name: "Nâu", hex: "#A52A2A" },
    { name: "Xanh navy", hex: "#000080" },
    { name: "Xanh lam", hex: "#00FFFF" },
    { name: "Lime", hex: "#00FF00" },
    { name: "Magenta", hex: "#FF00FF" },
    { name: "Bạc", hex: "#C0C0C0" },
    { name: "Vàng gold", hex: "#FFD700" },
    { name: "Đỏ đậm", hex: "#8B0000" },
    { name: "Xanh teal", hex: "#008080" },
    { name: "Olive", hex: "#808000" }
  ];

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  // Get color name from hex
  const getColorName = (hex) => {
    const color = predefinedColors.find(c => c.hex.toLowerCase() === hex.toLowerCase());
    return color ? color.name : hex;
  };

  // Extract dominant colors from image
  const extractColorsFromImage = async (imageSrc) => {
    setIsExtracting(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Extract colors using simple sampling
          const colorMap = new Map();
          const sampleRate = 10; // Sample every 10th pixel for performance
          
          for (let i = 0; i < data.length; i += 4 * sampleRate) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Skip transparent pixels
            if (a < 128) continue;
            
            // Round colors to reduce noise
            const roundedR = Math.round(r / 32) * 32;
            const roundedG = Math.round(g / 32) * 32;
            const roundedB = Math.round(b / 32) * 32;
            
            const hex = rgbToHex(roundedR, roundedG, roundedB);
            
            if (colorMap.has(hex)) {
              colorMap.set(hex, colorMap.get(hex) + 1);
            } else {
              colorMap.set(hex, 1);
            }
          }
          
          // Sort by frequency and get top colors
          const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([hex, count]) => ({
              hex,
              name: getColorName(hex),
              count
            }));
          
          setExtractedColors(sortedColors);
          setIsExtracting(false);
          resolve(sortedColors);
        };
        
        img.onerror = () => {
          setIsExtracting(false);
          reject(new Error("Failed to load image"));
        };
        
        img.src = imageSrc;
      });
    } catch (error) {
      console.error("Error extracting colors:", error);
      setIsExtracting(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target.result;
      if (onImageUpload) {
        onImageUpload(file, imageSrc);
      }
      extractColorsFromImage(imageSrc);
    };
    reader.readAsDataURL(file);
  };

  // Extract colors when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      extractColorsFromImage(imageUrl);
    }
  }, [imageUrl]);

  // Update custom color when value changes
  useEffect(() => {
    if (value && value !== customColor) {
      setCustomColor(value);
    }
  }, [value]);

  const handleColorSelect = (colorHex, colorName) => {
    onChange(colorName || colorHex);
    setIsOpen(false);
  };

  const handleCustomColorChange = (hex) => {
    setCustomColor(hex);
    const colorName = getColorName(hex);
    onChange(colorName);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden canvas for color extraction */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleImageUpload(e.target.files?.[0])}
        className="hidden"
      />

      {/* Color input display */}
      <div className="flex items-center gap-2">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-gray-400 transition-all"
        >
          <div
            className="w-6 h-6 rounded border-2 border-gray-300 flex-shrink-0"
            style={{ backgroundColor: customColor }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 outline-none bg-transparent text-sm"
            placeholder="Chọn hoặc nhập màu sắc"
          />
          <Palette className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Color picker dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 p-4">
          {/* Image upload section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Nhận dạng màu từ hình ảnh</h4>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                <Upload className="w-3 h-3" />
                Upload
              </button>
            </div>
            
            {/* Extracted colors */}
            {isExtracting && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang phân tích màu sắc...
              </div>
            )}
            
            {extractedColors.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Màu sắc được trích xuất:</p>
                <div className="grid grid-cols-4 gap-2">
                  {extractedColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorSelect(color.hex, color.name)}
                      className="flex flex-col items-center p-2 rounded hover:bg-gray-50 transition-colors group"
                      title={`${color.name} (${color.hex})`}
                    >
                      <div
                        className="w-8 h-8 rounded border-2 border-gray-200 group-hover:border-gray-300 mb-1"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs text-gray-600 text-center leading-tight">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Predefined colors */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Màu sắc có sẵn</h4>
            <div className="grid grid-cols-5 gap-2">
              {predefinedColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorSelect(color.hex, color.name)}
                  className="flex flex-col items-center p-2 rounded hover:bg-gray-50 transition-colors group relative"
                  title={`${color.name} (${color.hex})`}
                >
                  <div
                    className="w-8 h-8 rounded border-2 border-gray-200 group-hover:border-gray-300 relative"
                    style={{ backgroundColor: color.hex }}
                  >
                    {value === color.name && (
                      <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-sm" />
                    )}
                  </div>
                  <span className="text-xs text-gray-600 text-center leading-tight mt-1">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom color picker */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Màu tùy chỉnh</h4>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="#000000"
              />
              <button
                onClick={() => handleColorSelect(customColor, getColorName(customColor))}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Chọn
              </button>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;