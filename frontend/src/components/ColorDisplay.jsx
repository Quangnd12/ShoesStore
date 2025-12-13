import { useState } from "react";

const ColorDisplay = ({ 
  color, 
  size = "md", 
  showLabel = true, 
  className = "",
  style = "circle" // "circle", "square", "inline"
}) => {
  const [imageError, setImageError] = useState(false);

  // Predefined color mapping
  const colorMap = {
    // Màu cơ bản
    "đen": "#000000",
    "trắng": "#FFFFFF", 
    "xám": "#808080",
    "đỏ": "#FF0000",
    "xanh dương": "#0000FF",
    "xanh lá": "#008000",
    "vàng": "#FFFF00",
    "cam": "#FFA500",
    "tím": "#800080",
    "hồng": "#FFC0CB",
    
    // Màu nâng cao
    "nâu": "#A52A2A",
    "xanh navy": "#000080",
    "xanh lam": "#00FFFF",
    "lime": "#00FF00",
    "magenta": "#FF00FF",
    "bạc": "#C0C0C0",
    "vàng gold": "#FFD700",
    "đỏ đậm": "#8B0000",
    "xanh teal": "#008080",
    "olive": "#808000",
    
    // Màu đặc biệt
    "xanh da trời": "#87CEEB",
    "tím nhạt": "#DDA0DD",
    "xanh lá nhạt": "#90EE90",
    "khaki": "#F0E68C",
    "đỏ cà chua": "#FF6347",
    "turquoise": "#40E0D0",
    "coral": "#FF7F50",
    "salmon": "#FA8072",
    "gold": "#FFD700",
    "silver": "#C0C0C0",
    
    // Màu hex phổ biến
    "#000000": "#000000",
    "#ffffff": "#FFFFFF",
    "#ff0000": "#FF0000",
    "#00ff00": "#00FF00",
    "#0000ff": "#0000FF",
    "#ffff00": "#FFFF00",
    "#ff00ff": "#FF00FF",
    "#00ffff": "#00FFFF",
    "#808080": "#808080",
    "#800000": "#800000",
    "#008000": "#008000",
    "#000080": "#000080",
    "#800080": "#800080",
    "#808000": "#808000",
    "#008080": "#008080",
    "#c0c0c0": "#C0C0C0",
    "#ffa500": "#FFA500",
    "#ffc0cb": "#FFC0CB",
    "#a52a2a": "#A52A2A",
    "#ffd700": "#FFD700",
    "#8b0000": "#8B0000",
    "#87ceeb": "#87CEEB",
    "#dda0dd": "#DDA0DD",
    "#90ee90": "#90EE90",
    "#f0e68c": "#F0E68C",
    "#ff6347": "#FF6347",
    "#40e0d0": "#40E0D0"
  };

  // Get hex color from name or return as is if already hex
  const getHexColor = (colorName) => {
    if (!colorName) return "#CCCCCC"; // Default gray
    
    const lowerColor = colorName.toLowerCase().trim();
    
    // Check if it's already a hex color
    if (lowerColor.startsWith("#")) {
      return lowerColor;
    }
    
    // Look up in color map
    return colorMap[lowerColor] || "#CCCCCC";
  };

  // Get readable color name
  const getColorName = (colorValue) => {
    if (!colorValue) return "Không xác định";
    
    const lowerColor = colorValue.toLowerCase().trim();
    
    // If it's a hex color, try to find the name
    if (lowerColor.startsWith("#")) {
      const foundEntry = Object.entries(colorMap).find(([name, hex]) => 
        hex.toLowerCase() === lowerColor
      );
      return foundEntry ? foundEntry[0] : colorValue;
    }
    
    // Return as is if it's already a name
    return colorValue;
  };

  const hexColor = getHexColor(color);
  const colorName = getColorName(color);

  // Size classes
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6", 
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };

  // Style classes
  const styleClasses = {
    circle: "rounded-full",
    square: "rounded",
    inline: "rounded-sm"
  };

  // Text size for labels
  const textSizes = {
    xs: "text-xs",
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base",
    xl: "text-lg"
  };

  // Special handling for white color (add border)
  const needsBorder = hexColor.toLowerCase() === "#ffffff" || 
                     hexColor.toLowerCase() === "#fff" ||
                     colorName.toLowerCase().includes("trắng");

  if (style === "inline") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${sizeClasses[size]} ${styleClasses[style]} border-2 ${
            needsBorder ? "border-gray-300" : "border-transparent"
          } flex-shrink-0`}
          style={{ backgroundColor: hexColor }}
          title={`${colorName} (${hexColor})`}
        />
        {showLabel && (
          <span className={`${textSizes[size]} text-gray-700 capitalize`}>
            {colorName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${styleClasses[style]} border-2 ${
          needsBorder ? "border-gray-300" : "border-transparent"
        } shadow-sm`}
        style={{ backgroundColor: hexColor }}
        title={`${colorName} (${hexColor})`}
      />
      {showLabel && (
        <span className={`${textSizes[size]} text-gray-600 text-center capitalize leading-tight`}>
          {colorName}
        </span>
      )}
    </div>
  );
};

// Component for multiple colors
export const MultiColorDisplay = ({ 
  colors = [], 
  size = "sm", 
  maxDisplay = 3,
  className = "" 
}) => {
  if (!colors || colors.length === 0) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <ColorDisplay color="" size={size} showLabel={false} />
        <span className="text-xs text-gray-500">Không có màu</span>
      </div>
    );
  }

  const displayColors = colors.slice(0, maxDisplay);
  const remainingCount = colors.length - maxDisplay;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {displayColors.map((color, index) => (
        <ColorDisplay
          key={index}
          color={color}
          size={size}
          showLabel={false}
          style="circle"
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

// Component for color with quantity info
export const ColorWithQuantity = ({ 
  color, 
  quantity = 0, 
  size = "md",
  className = "" 
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ColorDisplay 
        color={color} 
        size={size} 
        showLabel={false}
        style="circle"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium capitalize">{color || "Không xác định"}</span>
        <span className="text-xs text-gray-500">SL: {quantity}</span>
      </div>
    </div>
  );
};

export default ColorDisplay;