import { useState, useRef } from "react";
import { Upload, X, Palette, RefreshCw } from "lucide-react";

const ImageUploadWithColorDetection = ({
  imageUrl = "",
  onImageChange,
  onColorDetected,
  className = ""
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedColors, setDetectedColors] = useState([]);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Predefined color names mapping
  const colorNames = {
    "#000000": "Đen", "#FFFFFF": "Trắng", "#FF0000": "Đỏ", "#00FF00": "Xanh lá",
    "#0000FF": "Xanh dương", "#FFFF00": "Vàng", "#FF00FF": "Magenta", "#00FFFF": "Cyan",
    "#808080": "Xám", "#800000": "Đỏ đậm", "#008000": "Xanh lá đậm", "#000080": "Xanh navy",
    "#800080": "Tím", "#808000": "Olive", "#008080": "Teal", "#C0C0C0": "Bạc",
    "#FFA500": "Cam", "#FFC0CB": "Hồng", "#A52A2A": "Nâu", "#FFD700": "Vàng gold",
    "#90EE90": "Xanh lá nhạt", "#87CEEB": "Xanh da trời", "#DDA0DD": "Tím nhạt",
    "#F0E68C": "Khaki", "#FF6347": "Đỏ cà chua", "#40E0D0": "Turquoise"
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  // Find closest color name
  const findClosestColorName = (targetHex) => {
    const target = hexToRgb(targetHex);
    if (!target) return targetHex;

    let closestColor = targetHex;
    let minDistance = Infinity;

    Object.entries(colorNames).forEach(([hex, name]) => {
      const color = hexToRgb(hex);
      if (color) {
        const distance = Math.sqrt(
          Math.pow(target.r - color.r, 2) +
          Math.pow(target.g - color.g, 2) +
          Math.pow(target.b - color.b, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = name;
        }
      }
    });

    return minDistance < 50 ? closestColor : targetHex;
  };

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Analyze image colors
  const analyzeImageColors = async (imageSrc) => {
    setIsAnalyzing(true);
    
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      return new Promise((resolve) => {
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // Resize image for faster processing
          const maxSize = 200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and analyze
          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          
          // Color frequency map
          const colorMap = new Map();
          
          // Sample pixels (every 4th pixel for performance)
          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Skip transparent/very light pixels
            if (a < 128 || (r > 240 && g > 240 && b > 240)) continue;
            
            // Group similar colors
            const roundedR = Math.round(r / 20) * 20;
            const roundedG = Math.round(g / 20) * 20;
            const roundedB = Math.round(b / 20) * 20;
            
            const hex = rgbToHex(roundedR, roundedG, roundedB);
            colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
          }
          
          // Get top 6 colors
          const topColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([hex, count]) => ({
              hex,
              name: findClosestColorName(hex),
              count,
              percentage: Math.round((count / (data.length / 4)) * 100)
            }));
          
          setDetectedColors(topColors);
          setIsAnalyzing(false);
          
          // Auto-select the most dominant color
          if (topColors.length > 0 && onColorDetected) {
            onColorDetected(topColors[0].name, topColors[0].hex);
          }
          
          resolve(topColors);
        };
        
        img.onerror = () => {
          setIsAnalyzing(false);
          resolve([]);
        };
        
        img.src = imageSrc;
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      setIsAnalyzing(false);
      return [];
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target.result;
      onImageChange(file, imageSrc);
      analyzeImageColors(imageSrc);
    };
    reader.readAsDataURL(file);
  };

  // Handle color selection
  const handleColorSelect = (colorName, colorHex) => {
    if (onColorDetected) {
      onColorDetected(colorName, colorHex);
    }
  };

  return (
    <div className={className}>
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        className="hidden"
      />

      {/* Upload area */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Hình ảnh sản phẩm
        </label>
        
        <div className="flex items-start gap-4">
          {/* Upload button/preview */}
          <div className="flex-shrink-0">
            {imageUrl ? (
              <div className="relative group">
                <img
                  src={imageUrl}
                  alt="Product preview"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white hover:text-gray-200 mr-2"
                    title="Thay đổi ảnh"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onImageChange(null, "");
                      setDetectedColors([]);
                    }}
                    className="text-white hover:text-red-200"
                    title="Xóa ảnh"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
              >
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Upload</span>
              </button>
            )}
          </div>

          {/* Color detection results */}
          <div className="flex-1">
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang phân tích màu sắc...
              </div>
            )}
            
            {detectedColors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Màu sắc được phát hiện:
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {detectedColors.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleColorSelect(color.name, color.hex)}
                      className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      title={`${color.name} (${color.hex}) - ${color.percentage}%`}
                    >
                      <div
                        className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1 text-left">
                        <div className="text-xs font-medium text-gray-700 group-hover:text-blue-700">
                          {color.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {color.percentage}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {!imageUrl && !isAnalyzing && (
              <div className="text-sm text-gray-500">
                <p className="mb-1">📸 Upload ảnh để tự động nhận dạng màu sắc</p>
                <p className="text-xs">Hệ thống sẽ phân tích và đề xuất màu sắc chính từ hình ảnh</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadWithColorDetection;