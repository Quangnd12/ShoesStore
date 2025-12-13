import { useState } from "react";
import { Plus, X } from "lucide-react";
import SizeGenerator from "./SizeGenerator";
import GroupedSearchableSelect from "./GroupedSearchableSelect";
import SearchableSelect from "./SearchableSelect";
import ColorPicker from "./ColorPicker";
import ImageUploadWithColorDetection from "./ImageUploadWithColorDetection";

const ProductTabsInvoice = ({ 
  items, 
  tabIndex,
  products,
  categories,
  handleItemChange,
  handleImageFileChange,
  handleAddVariant,
  handleRemoveVariant,
  handleVariantChange,
  tabs,
  setTabs
}) => {
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  const handleAddProduct = () => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items.push({
      product_id: "",
      name: "",
      price: "",
      category_id: "",
      image_url: "",
      brand: "",
      color: "",
      variants: [{ size: "", quantity: "", unit_cost: "" }],
    });
    setTabs(newTabs);
    setActiveProductIndex(newTabs[tabIndex].data.items.length - 1);
  };

  const handleRemoveProduct = (productIndex) => {
    if (items.length === 1) {
      alert("Phải có ít nhất 1 sản phẩm trong hóa đơn");
      return;
    }
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items = newTabs[tabIndex].data.items.filter((_, i) => i !== productIndex);
    setTabs(newTabs);
    
    if (activeProductIndex >= newTabs[tabIndex].data.items.length) {
      setActiveProductIndex(Math.max(0, newTabs[tabIndex].data.items.length - 1));
    } else if (activeProductIndex > productIndex) {
      setActiveProductIndex(activeProductIndex - 1);
    }
  };

  const currentItem = items[activeProductIndex] || items[0];
  const itemIndex = activeProductIndex;

  return (
    <div className="space-y-4">
      {/* Product Tabs Header */}
      <div className="border-b border-gray-300">
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {items.map((item, index) => {
            const productName = item.product_id 
              ? products.find(p => p.id === parseInt(item.product_id))?.name 
              : item.name;
            const displayName = productName || `Sản phẩm ${index + 1}`;
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveProductIndex(index)}
                className={`
                  flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap
                  ${
                    activeProductIndex === index
                      ? "bg-blue-600 text-white font-semibold shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <span className="text-sm">{displayName}</span>
                {items.length > 1 && (
                  <X
                    size={14}
                    className={`transition-colors ${
                      activeProductIndex === index 
                        ? "hover:text-red-200" 
                        : "hover:text-red-600"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveProduct(index);
                    }}
                  />
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleAddProduct}
            className="flex items-center space-x-1 px-4 py-2.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all border-2 border-dashed border-blue-400 hover:border-blue-600 font-medium whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="text-sm">Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
        {/* Thông tin chung của sản phẩm */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn sản phẩm có sẵn (hoặc để trống để tạo mới)
            </label>
            <GroupedSearchableSelect
              products={Array.isArray(products) ? products : []}
              value={currentItem.product_id ? parseInt(currentItem.product_id) : null}
              onChange={(product) => {
                if (product) {
                  handleItemChange(tabIndex, itemIndex, "product_id", product.id.toString());
                } else {
                  handleItemChange(tabIndex, itemIndex, "product_id", "");
                }
              }}
              placeholder="-- Tạo sản phẩm mới --"
            />
          </div>
          
          {!currentItem.product_id && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required={!currentItem.product_id}
                  value={currentItem.name}
                  onChange={(e) =>
                    handleItemChange(tabIndex, itemIndex, "name", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh mục *
                </label>
                <SearchableSelect
                  options={categories}
                  value={currentItem.category_id}
                  onChange={(value) => handleItemChange(tabIndex, itemIndex, "category_id", value)}
                  placeholder="Chọn danh mục"
                  emptyText="Không tìm thấy danh mục"
                  labelKey="name"
                  valueKey="id"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá bán *
                </label>
                <input
                  type="number"
                  required={!currentItem.product_id}
                  value={currentItem.price}
                  onChange={(e) =>
                    handleItemChange(tabIndex, itemIndex, "price", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thương hiệu
                </label>
                <input
                  type="text"
                  value={currentItem.brand || ""}
                  onChange={(e) =>
                    handleItemChange(tabIndex, itemIndex, "brand", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  placeholder="Nhập thương hiệu"
                />
              </div>
              <div className="col-span-2">
                <ImageUploadWithColorDetection
                  imageUrl={currentItem.image_url}
                  onImageChange={(file, imageSrc) => {
                    handleImageFileChange(tabIndex, itemIndex, file);
                  }}
                  onColorDetected={(colorName, colorHex) => {
                    handleItemChange(tabIndex, itemIndex, "color", colorName);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Màu sắc
                </label>
                <ColorPicker
                  value={currentItem.color || ""}
                  onChange={(color) => handleItemChange(tabIndex, itemIndex, "color", color)}
                  imageUrl={currentItem.image_url}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        {/* Variants (nhiều size) */}
        <div className="border-t-2 border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Biến thể (Size) *
            </label>
            <button
              type="button"
              onClick={() => handleAddVariant(tabIndex, itemIndex)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              + Thêm size
            </button>
          </div>

          {/* Size Generator */}
          <div className="mb-4">
            <SizeGenerator
              onGenerate={(variants) => {
                const newTabs = [...tabs];
                newTabs[tabIndex].data.items[itemIndex].variants = variants;
                setTabs(newTabs);
              }}
            />
          </div>

          {/* Variants List */}
          <div className="space-y-3">
            {currentItem.variants &&
              currentItem.variants.map((variant, variantIndex) => (
                <div
                  key={variantIndex}
                  className="grid grid-cols-4 gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Size *
                    </label>
                    <input
                      type="text"
                      required
                      value={variant.size}
                      onChange={(e) =>
                        handleVariantChange(
                          tabIndex,
                          itemIndex,
                          variantIndex,
                          "size",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="38"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Số lượng *
                    </label>
                    <input
                      type="number"
                      required
                      value={variant.quantity}
                      onChange={(e) =>
                        handleVariantChange(
                          tabIndex,
                          itemIndex,
                          variantIndex,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Giá nhập *
                    </label>
                    <input
                      type="number"
                      required
                      value={variant.unit_cost}
                      onChange={(e) =>
                        handleVariantChange(
                          tabIndex,
                          itemIndex,
                          variantIndex,
                          "unit_cost",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="100000"
                    />
                  </div>
                  <div className="flex items-end">
                    {currentItem.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveVariant(tabIndex, itemIndex, variantIndex)
                        }
                        className="w-full px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTabsInvoice;
