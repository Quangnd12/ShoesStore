import { useState } from "react";
import { Upload, X } from "lucide-react";
import SearchableSelect from "../../SearchableSelect";
import PurchaseInvoiceVariants from "./PurchaseInvoiceVariants";
import ColorPicker from "../../ColorPicker";
import SizeGenerator from "../../SizeGenerator";

const PurchaseInvoiceItem = ({
  item,
  itemIndex,
  products,
  categories,
  onItemChange
}) => {
  const [showSizeGenerator, setShowSizeGenerator] = useState(false);

  const handleFieldChange = (field, value) => {
    onItemChange(itemIndex, field, value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Resize và compress ảnh
    const maxWidth = 800;
    const maxHeight = 800;
    const maxSizeKB = 200;
    const quality = 0.7;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính toán kích thước mới
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Tạo canvas để resize
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert sang base64 với chất lượng nén
        let base64 = canvas.toDataURL("image/jpeg", quality);

        // Nếu vẫn quá lớn, giảm chất lượng thêm
        let currentQuality = quality;
        while (base64.length > maxSizeKB * 1024 && currentQuality > 0.3) {
          currentQuality -= 0.1;
          base64 = canvas.toDataURL("image/jpeg", currentQuality);
        }

        handleFieldChange("image_url", base64);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSizeGenerated = (sizes) => {
    const newVariants = sizes.map(size => ({
      size: size,
      quantity: "",
      unit_cost: ""
    }));
    handleFieldChange("variants", newVariants);
    setShowSizeGenerator(false);
  };

  return (
    <div className="space-y-4">
      {/* Chọn sản phẩm có sẵn hoặc tạo mới */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sản phẩm có sẵn
          </label>
          <SearchableSelect
            options={products.map((product) => ({
              value: product.id,
              label: `${product.name} - ${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.price)}`,
            }))}
            value={item.product_id}
            onChange={(value) => handleFieldChange("product_id", value)}
            placeholder="Chọn sản phẩm có sẵn (tùy chọn)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục *
          </label>
          <SearchableSelect
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            value={item.category_id}
            onChange={(value) => handleFieldChange("category_id", value)}
            placeholder="Chọn danh mục"
            required
          />
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            value={item.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giá bán *
          </label>
          <input
            type="number"
            value={item.price}
            onChange={(e) => handleFieldChange("price", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập giá bán"
            min="0"
            step="1000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thương hiệu
          </label>
          <input
            type="text"
            value={item.brand}
            onChange={(e) => handleFieldChange("brand", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập thương hiệu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Màu sắc
          </label>
          <ColorPicker
            value={item.color}
            onChange={(color) => handleFieldChange("color", color)}
            placeholder="Chọn hoặc nhập màu sắc"
          />
        </div>
      </div>

      {/* Upload ảnh */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hình ảnh sản phẩm
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id={`image-upload-${itemIndex}`}
            />
            <label
              htmlFor={`image-upload-${itemIndex}`}
              className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
            >
              <Upload size={20} className="mr-2" />
              <span>Chọn ảnh</span>
            </label>
          </div>
          {item.image_url && (
            <div className="relative">
              <img
                src={item.image_url}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleFieldChange("image_url", "")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Variants (Size, Quantity, Unit Cost) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Biến thể sản phẩm *
          </label>
          <button
            type="button"
            onClick={() => setShowSizeGenerator(true)}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
          >
            Tạo size tự động
          </button>
        </div>

        <PurchaseInvoiceVariants
          variants={item.variants}
          itemIndex={itemIndex}
          onVariantChange={(variantIndex, field, value) => {
            const newVariants = [...item.variants];
            newVariants[variantIndex][field] = value;
            handleFieldChange("variants", newVariants);
          }}
          onAddVariant={() => {
            const newVariants = [...item.variants, { size: "", quantity: "", unit_cost: "" }];
            handleFieldChange("variants", newVariants);
          }}
          onRemoveVariant={(variantIndex) => {
            if (item.variants.length > 1) {
              const newVariants = item.variants.filter((_, i) => i !== variantIndex);
              handleFieldChange("variants", newVariants);
            }
          }}
        />
      </div>

      {/* Size Generator Modal */}
      {showSizeGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tạo size tự động</h3>
              <button
                onClick={() => setShowSizeGenerator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <SizeGenerator
              onGenerate={handleSizeGenerated}
              onCancel={() => setShowSizeGenerator(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoiceItem;