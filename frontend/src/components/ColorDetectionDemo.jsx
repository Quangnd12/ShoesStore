import { useState } from "react";
import ColorPicker from "./ColorPicker";
import ImageUploadWithColorDetection from "./ImageUploadWithColorDetection";

const ColorDetectionDemo = () => {
  const [selectedColor, setSelectedColor] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleImageChange = (file, imageSrc) => {
    setImageUrl(imageSrc);
  };

  const handleColorDetected = (colorName, colorHex) => {
    setSelectedColor(colorName);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Demo: Nhận dạng màu sắc từ hình ảnh
      </h2>
      
      <div className="space-y-6">
        {/* Image Upload with Color Detection */}
        <ImageUploadWithColorDetection
          imageUrl={imageUrl}
          onImageChange={handleImageChange}
          onColorDetected={handleColorDetected}
        />
        
        {/* Color Picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Màu sắc đã chọn
          </label>
          <ColorPicker
            value={selectedColor}
            onChange={setSelectedColor}
            imageUrl={imageUrl}
          />
        </div>
        
        {/* Result Display */}
        {selectedColor && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Kết quả:</h3>
            <p className="text-sm text-gray-600">
              Màu sắc được chọn: <span className="font-medium">{selectedColor}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorDetectionDemo;