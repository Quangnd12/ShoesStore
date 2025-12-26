import SearchableSelect from "../../SearchableSelect";

const SalesInvoiceItem = ({
  item,
  itemIndex,
  products,
  onItemChange
}) => {
  const handleFieldChange = (field, value) => {
    onItemChange(itemIndex, field, value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateSubtotal = () => {
    const quantity = parseInt(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return quantity * unitPrice;
  };

  // Lọc sản phẩm có tồn kho > 0
  const availableProducts = products.filter(product => {
    return product.total_stock > 0;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sản phẩm *
          </label>
          <SearchableSelect
            options={availableProducts.map((product) => ({
              value: product.id,
              label: `${product.name} - ${formatCurrency(product.price)} (Tồn: ${product.total_stock})`,
              disabled: product.total_stock <= 0
            }))}
            value={item.product_id}
            onChange={(value) => handleFieldChange("product_id", value)}
            placeholder="Chọn sản phẩm"
            required
          />
          {availableProducts.length === 0 && (
            <p className="text-sm text-red-600 mt-1">
              Không có sản phẩm nào có tồn kho
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng *
          </label>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => handleFieldChange("quantity", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="1"
            max={
              item.product_id 
                ? products.find(p => p.id === parseInt(item.product_id))?.total_stock || 0
                : undefined
            }
            required
          />
          {item.product_id && (
            <p className="text-xs text-gray-500 mt-1">
              Tồn kho: {products.find(p => p.id === parseInt(item.product_id))?.total_stock || 0}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đơn giá *
          </label>
          <input
            type="number"
            value={item.unit_price}
            onChange={(e) => handleFieldChange("unit_price", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
            step="1000"
            required
          />
        </div>
      </div>

      {/* Hiển thị thông tin sản phẩm đã chọn */}
      {item.product_id && (
        <div className="bg-gray-50 p-3 rounded-lg">
          {(() => {
            const selectedProduct = products.find(p => p.id === parseInt(item.product_id));
            if (!selectedProduct) return null;
            
            return (
              <div className="flex items-center space-x-4">
                {selectedProduct.image_url && (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{selectedProduct.name}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {selectedProduct.brand && (
                      <p>Thương hiệu: {selectedProduct.brand}</p>
                    )}
                    {selectedProduct.color && (
                      <p>Màu sắc: {selectedProduct.color}</p>
                    )}
                    <p>Giá gốc: {formatCurrency(selectedProduct.price)}</p>
                    <p>Tồn kho: {selectedProduct.total_stock}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Thành tiền:</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(calculateSubtotal())}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Cảnh báo nếu số lượng vượt quá tồn kho */}
      {item.product_id && item.quantity && (
        (() => {
          const selectedProduct = products.find(p => p.id === parseInt(item.product_id));
          const quantity = parseInt(item.quantity) || 0;
          const stock = selectedProduct?.total_stock || 0;
          
          if (quantity > stock) {
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">
                  ⚠️ Số lượng vượt quá tồn kho! Tồn kho hiện tại: {stock}
                </p>
              </div>
            );
          }
          return null;
        })()
      )}
    </div>
  );
};

export default SalesInvoiceItem;