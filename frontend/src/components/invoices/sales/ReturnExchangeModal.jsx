import React, { useState, useMemo, useEffect } from 'react';
import { X, Package, ChevronDown, ChevronRight, Search, Check, History } from 'lucide-react';

// Component chọn sản phẩm đổi với hình ảnh và group
const ProductExchangeSelector = ({
  products,
  selectedProductId,
  selectedSize,
  onSelect,
  onSizeSelect,
  onPriceChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  // Lọc sản phẩm còn hàng và theo search term
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.stock_quantity > 0 &&
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Group sản phẩm theo tên gốc (bỏ phần size/color)
  const groupedProducts = useMemo(() => {
    const groups = {};

    filteredProducts.forEach(product => {
      // Lấy tên gốc (bỏ phần trong ngoặc hoặc sau dấu -)
      const baseName = product.name?.split(' - ')[0]?.trim() || product.name;

      if (!groups[baseName]) {
        groups[baseName] = {
          name: baseName,
          products: [],
          totalStock: 0,
          image: product.image_url
        };
      }
      groups[baseName].products.push(product);
      groups[baseName].totalStock += product.stock_quantity || 0;
    });

    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredProducts]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Lấy danh sách sizes của sản phẩm
  const getProductSizes = (product) => {
    // Ưu tiên availableSizes từ API
    if (product.availableSizes && product.availableSizes.length > 0) {
      return product.availableSizes.filter(s => s.quantity > 0);
    }

    // Fallback: parse từ chuỗi size
    if (product.size && product.size.includes(',')) {
      const sizes = product.size.split(',').map(s => s.trim()).filter(s => s);
      const qtyPerSize = Math.floor(product.stock_quantity / sizes.length) || 1;
      return sizes.map(s => ({ size: s, quantity: qtyPerSize }));
    }

    // Single size hoặc không có size
    if (product.size) {
      return [{ size: product.size.trim(), quantity: product.stock_quantity }];
    }

    return [];
  };

  const handleSelectProduct = (product) => {
    const sizes = getProductSizes(product);
    onSelect(product.id.toString());
    onPriceChange(product.price.toString());

    // Nếu sản phẩm có nhiều size, reset size selection
    // Nếu chỉ có 1 size hoặc không có size, tự động chọn
    if (sizes.length === 1) {
      onSizeSelect(sizes[0].size);
    } else if (sizes.length === 0) {
      onSizeSelect('');
    } else {
      onSizeSelect(''); // Reset để user chọn size
    }
  };

  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));
  const selectedProductSizes = selectedProduct ? getProductSizes(selectedProduct) : [];
  const hasMultipleSizes = selectedProductSizes.length > 1;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Selected product preview */}
      {selectedProduct && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {selectedProduct.image_url ? (
                <img src={selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={20} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{selectedProduct.name}</p>
              <p className="text-xs text-gray-600">
                {new Intl.NumberFormat("vi-VN").format(selectedProduct.price)}đ
                <span className="ml-2 text-green-600">Tổng còn: {selectedProduct.stock_quantity}</span>
              </p>
            </div>
            <Check size={20} className="text-green-600 flex-shrink-0" />
          </div>

          {/* Size selection for products with multiple sizes */}
          {hasMultipleSizes && (
            <div className="pt-2 border-t border-green-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Chọn size cụ thể * <span className="text-red-500">(Bắt buộc)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProductSizes.map((sizeInfo) => {
                  const isSelected = selectedSize === sizeInfo.size;
                  const isOutOfStock = sizeInfo.quantity <= 0;

                  return (
                    <button
                      key={sizeInfo.size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => onSizeSelect(sizeInfo.size)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isOutOfStock
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isSelected
                          ? 'bg-green-600 text-white ring-2 ring-green-300'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-green-400'
                        }`}
                    >
                      <span>{sizeInfo.size}</span>
                      <span className={`ml-1 text-xs ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>
                        ({sizeInfo.quantity})
                      </span>
                    </button>
                  );
                })}
              </div>
              {!selectedSize && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  ⚠️ Vui lòng chọn size trước khi đổi hàng
                </p>
              )}
            </div>
          )}

          {/* Show selected size info */}
          {selectedSize && (
            <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded inline-block">
              ✓ Đã chọn size: <strong>{selectedSize}</strong>
              {selectedProductSizes.find(s => s.size === selectedSize) && (
                <span className="ml-1">
                  (Còn {selectedProductSizes.find(s => s.size === selectedSize)?.quantity})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Product list */}
      <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
        {groupedProducts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Không tìm thấy sản phẩm còn hàng
          </div>
        ) : (
          groupedProducts.map((group) => (
            <div key={group.name}>
              {/* Group header */}
              {group.products.length > 1 ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.name)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {group.image ? (
                      <img src={group.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{group.name}</p>
                    <p className="text-xs text-gray-500">
                      {group.products.length} biến thể • Tổng: {group.totalStock} sản phẩm
                    </p>
                  </div>
                  {expandedGroups[group.name] ? (
                    <ChevronDown size={18} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </button>
              ) : null}

              {/* Products in group */}
              {(group.products.length === 1 || expandedGroups[group.name]) && (
                <div className={group.products.length > 1 ? "bg-gray-50 divide-y divide-gray-100" : ""}>
                  {group.products.map((product) => {
                    const isSelected = parseInt(selectedProductId) === product.id;
                    const sizes = getProductSizes(product);
                    const hasMultiSize = sizes.length > 1;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        className={`w-full flex items-center gap-3 p-3 transition-colors ${group.products.length > 1 ? 'pl-6' : ''
                          } ${isSelected
                            ? 'bg-green-50 border-l-4 border-green-500'
                            : 'hover:bg-gray-50'
                          }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className={`text-sm truncate ${isSelected ? 'font-semibold text-green-900' : 'text-gray-900'}`}>
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            <span className="font-medium text-blue-600">
                              {new Intl.NumberFormat("vi-VN").format(product.price)}đ
                            </span>
                            {hasMultiSize ? (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                                {sizes.length} sizes
                              </span>
                            ) : sizes.length === 1 ? (
                              <span className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">
                                Size: {sizes[0].size}
                              </span>
                            ) : null}
                            {product.color && (
                              <span className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">
                                {product.color}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock_quantity < 5
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                            }`}>
                            Còn {product.stock_quantity}
                          </span>
                        </div>
                        {isSelected && (
                          <Check size={18} className="text-green-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ReturnExchangeModal = ({
  isOpen,
  onClose,
  invoice,
  products,
  returnForm,
  onReturnFormChange,
  onReturnItemChange,
  onSubmit
}) => {
  if (!isOpen || !invoice) return null;

  // Check if exchange form is valid
  const selectedProduct = products.find(p => p.id === parseInt(returnForm.item.new_product_id));
  const getProductSizes = (product) => {
    if (!product) return [];
    if (product.availableSizes && product.availableSizes.length > 0) {
      return product.availableSizes.filter(s => s.quantity > 0);
    }
    if (product.size && product.size.includes(',')) {
      const sizes = product.size.split(',').map(s => s.trim()).filter(s => s);
      const qtyPerSize = Math.floor(product.stock_quantity / sizes.length) || 1;
      return sizes.map(s => ({ size: s, quantity: qtyPerSize }));
    }
    if (product.size) {
      return [{ size: product.size.trim(), quantity: product.stock_quantity }];
    }
    return [];
  };

  const selectedProductSizes = selectedProduct ? getProductSizes(selectedProduct) : [];
  const needsSizeSelection = selectedProductSizes.length > 1;
  const isExchangeValid = returnForm.type !== "exchange" ||
    (returnForm.item.new_product_id && (!needsSizeSelection || returnForm.item.new_size));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (returnForm.type === "exchange" && needsSizeSelection && !returnForm.item.new_size) {
      alert("Vui lòng chọn size cho sản phẩm đổi!");
      return;
    }

    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-xl font-bold text-white">Hoàn trả / Đổi hàng</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Invoice Info */}
          <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-3 text-gray-800">Thông tin hóa đơn</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Số hóa đơn:</span>
                <span className="ml-2 font-medium text-gray-900">{invoice.invoice_number}</span>
              </div>
              <div>
                <span className="text-gray-500">Khách hàng:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {invoice.customer_name || invoice.account_username || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Ngày:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(invoice.invoice_date).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Tổng tiền:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {new Intl.NumberFormat("vi-VN").format(
                    invoice.final_amount || invoice.total_revenue || 0
                  )}đ
                </span>
              </div>
            </div>

            {/* Products in invoice */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Sản phẩm trong hóa đơn:</h4>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1.5 px-2 text-xs bg-white rounded border border-gray-100">
                      <span className="font-medium text-gray-800">
                        {item.product_name || item.name}
                        {item.size_eu && <span className="text-gray-500 ml-1">(Size {item.size_eu})</span>}
                      </span>
                      <span className="text-gray-600">
                        SL: {item.quantity} × {new Intl.NumberFormat("vi-VN").format(item.unit_price || 0)}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Request Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Loại yêu cầu *
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${returnForm.type === "return"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <input
                    type="radio"
                    name="type"
                    value="return"
                    checked={returnForm.type === "return"}
                    onChange={(e) => onReturnFormChange("type", e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-medium">🔄 Hoàn trả</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${returnForm.type === "exchange"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <input
                    type="radio"
                    name="type"
                    value="exchange"
                    checked={returnForm.type === "exchange"}
                    onChange={(e) => onReturnFormChange("type", e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-medium">🔃 Đổi hàng</span>
                </label>
              </div>
            </div>

            {/* Product in invoice */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Sản phẩm cần {returnForm.type === "return" ? "hoàn trả" : "đổi"} *
              </label>
              <select
                required
                value={returnForm.item.sales_invoice_item_id}
                onChange={(e) => {
                  const selectedItem = invoice.items?.find(
                    item => item.id === parseInt(e.target.value)
                  );
                  onReturnItemChange("sales_invoice_item_id", e.target.value);
                  if (selectedItem) {
                    onReturnItemChange("quantity", "1");
                    onReturnItemChange("max_quantity", selectedItem.quantity.toString());
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn sản phẩm</option>
                {invoice.items?.filter(item => item.quantity > 0).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.product_name || item.name}
                    {item.size_eu && ` (Size ${item.size_eu})`}
                    {item.color && ` - ${item.color}`}
                    {` • SL: ${item.quantity || 0} • `}
                    {new Intl.NumberFormat("vi-VN").format(item.unit_price || 0)}đ
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Số lượng *
                {returnForm.item.max_quantity && (
                  <span className="text-gray-500 font-normal ml-1">
                    (Tối đa: {returnForm.item.max_quantity})
                  </span>
                )}
              </label>
              <input
                type="number"
                required
                min="1"
                max={returnForm.item.max_quantity || 1}
                value={returnForm.item.quantity}
                onChange={(e) => {
                  const maxQty = parseInt(returnForm.item.max_quantity) || 1;
                  const newQty = Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQty);
                  onReturnItemChange("quantity", newQty.toString());
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {returnForm.item.max_quantity === "1" && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  ⚠️ Sản phẩm này chỉ có 1 đơn vị trong hóa đơn
                </p>
              )}
            </div>

            {/* Exchange product selection */}
            {returnForm.type === "exchange" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Sản phẩm đổi * <span className="font-normal text-gray-500">(Chỉ hiển thị sản phẩm còn hàng)</span>
                  </label>
                  <ProductExchangeSelector
                    products={products}
                    selectedProductId={returnForm.item.new_product_id}
                    selectedSize={returnForm.item.new_size || ''}
                    onSelect={(id) => {
                      onReturnItemChange("new_product_id", id);
                      onReturnItemChange("new_size", ''); // Reset size when product changes
                    }}
                    onSizeSelect={(size) => onReturnItemChange("new_size", size)}
                    onPriceChange={(price) => onReturnItemChange("new_unit_price", price)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Giá sản phẩm mới *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1000"
                      required={returnForm.type === "exchange"}
                      value={returnForm.item.new_unit_price}
                      onChange={(e) => onReturnItemChange("new_unit_price", e.target.value)}
                      className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">đ</span>
                  </div>
                </div>
              </>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Lý do *
              </label>
              <select
                required
                value={returnForm.reason}
                onChange={(e) => onReturnFormChange("reason", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn lý do</option>
                <option value="defective">🔧 Sản phẩm lỗi</option>
                <option value="wrong_item">📦 Giao sai hàng</option>
                <option value="customer_change_mind">💭 Khách hàng đổi ý</option>
                <option value="size_issue">📏 Không vừa size</option>
                <option value="other">📝 Khác</option>
              </select>
            </div>

            {/* Notes */}
            <div className="pb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Ghi chú
              </label>
              <textarea
                value={returnForm.notes}
                onChange={(e) => onReturnFormChange("notes", e.target.value)}
                rows="2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Ghi chú thêm về yêu cầu hoàn trả/đổi hàng..."
              />
            </div>

            {/* Previous History Section */}
            {(invoice.return_exchanges || invoice.returnExchanges)?.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <History className="text-gray-400" size={18} />
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Lịch sử đã xử lý</h4>
                </div>
                <div className="space-y-3">
                  {(invoice.return_exchanges || invoice.returnExchanges).map((re, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${re.type === 'return' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {re.type === 'return' ? 'Hoàn trả' : 'Đổi hàng'}
                        </span>
                        <span className="text-gray-400 font-medium">{new Date(re.created_at).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <p className="font-bold text-gray-800 mb-1">{re.old_product_name}</p>
                      <div className="flex gap-3 text-gray-500">
                        <span>SL: {re.return_quantity}</span>
                        <span>Size: {re.old_product_size || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!isExchangeValid}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${!isExchangeValid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : returnForm.type === "return"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-green-600 text-white hover:bg-green-700"
              }`}
          >
            {returnForm.type === "return" ? "🔄 Tạo hoàn trả" : "🔃 Tạo đổi hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnExchangeModal;
