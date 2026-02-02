import { useState, useEffect, useMemo } from "react";
import { Plus, X } from "lucide-react";
import ColorVariantManager from "./ColorVariantManager";
import GroupedSearchableSelect from "./GroupedSearchableSelect";
import SearchableSelect from "./SearchableSelect";
import SmartPriceInput from "./SmartPriceInput";

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

  // Get category name for product context
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === parseInt(categoryId));
    return category?.name || '';
  };

  // Chuyển đổi từ cấu trúc cũ (variants) sang cấu trúc mới (colorVariants)
  const convertToColorVariants = (item) => {
    if (item.colorVariants && item.colorVariants.length > 0) {
      return item.colorVariants;
    }
    
    // Nếu có variants cũ, chuyển đổi sang colorVariants
    if (item.variants && item.variants.length > 0) {
      // Nhóm variants theo màu
      const colorGroups = {};
      item.variants.forEach(v => {
        const color = v.color || item.color || "";
        if (!colorGroups[color]) {
          colorGroups[color] = {
            color: color,
            image: item.image_url || "",
            image_file: null,
            sizes: []
          };
        }
        colorGroups[color].sizes.push({
          size: v.size || "",
          quantity: v.quantity || "",
          unit_cost: v.unit_cost || ""
        });
      });
      
      const result = Object.values(colorGroups);
      return result.length > 0 ? result : [{ color: "", image: "", image_file: null, sizes: [{ size: "", quantity: "", unit_cost: "" }] }];
    }
    
    return [{ color: "", image: "", image_file: null, sizes: [{ size: "", quantity: "", unit_cost: "" }] }];
  };

  // Chuyển đổi từ colorVariants sang variants (để tương thích với API cũ)
  const convertToVariants = (colorVariants) => {
    const variants = [];
    colorVariants.forEach(cv => {
      cv.sizes?.forEach(s => {
        variants.push({
          size: s.size,
          quantity: s.quantity,
          unit_cost: s.unit_cost,
          color: cv.color,
          image_url: cv.image
        });
      });
    });
    return variants;
  };

  const handleAddProduct = () => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items.push({
      product_id: "",
      name: "",
      price: "",
      category_id: "",
      brand: "",
      image_url: "",
      color: "",
      // Hỗ trợ cả 2 cấu trúc
      colorVariants: [{ 
        color: "", 
        image: "", 
        image_file: null,
        sizes: [{ size: "", quantity: "", unit_cost: "" }] 
      }],
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
                <SmartPriceInput
                  value={currentItem.price}
                  onChange={(value) => handleItemChange(tabIndex, itemIndex, "price", value)}
                  placeholder="Nhập giá bán (VD: 100 → 100.000đ)"
                  unit="đ"
                  productContext={{
                    category: getCategoryName(currentItem.category_id),
                    name: currentItem.name
                  }}
                  className="border-2 border-gray-300 focus:border-blue-500 py-2.5 transition-all"
                  required={!currentItem.product_id}
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
            </>
          )}
        </div>

        {/* Color Variants Management - Quản lý biến thể theo màu sắc */}
        <div className="border-t-2 border-gray-200 pt-6">
          <ColorVariantManager
            colorVariants={convertToColorVariants(currentItem)}
            onColorVariantsChange={(newColorVariants) => {
              const newTabs = [...tabs];
              // Cập nhật cả colorVariants và variants để tương thích
              newTabs[tabIndex].data.items[itemIndex].colorVariants = newColorVariants;
              newTabs[tabIndex].data.items[itemIndex].variants = convertToVariants(newColorVariants);
              
              // Cập nhật image_url và color từ màu đầu tiên (cho tương thích ngược)
              if (newColorVariants.length > 0) {
                newTabs[tabIndex].data.items[itemIndex].image_url = newColorVariants[0].image || "";
                newTabs[tabIndex].data.items[itemIndex].color = newColorVariants[0].color || "";
              }
              
              setTabs(newTabs);
            }}
            productContext={{
              category: getCategoryName(currentItem.category_id),
              name: currentItem.name
            }}
            onImageFileChange={(colorIndex, file) => {
              // Callback để xử lý upload hình ảnh
              if (handleImageFileChange) {
                handleImageFileChange(tabIndex, itemIndex, file, colorIndex);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductTabsInvoice;
