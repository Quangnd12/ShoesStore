import { useState } from "react";
import { X } from "lucide-react";
import SearchableSelect from "../../SearchableSelect";

const ReturnExchangeModal = ({
  isOpen,
  onClose,
  invoice,
  products,
  onSubmit,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    type: "return",
    reason: "",
    notes: "",
    item: {
      sales_invoice_item_id: "",
      quantity: "",
      new_product_id: "",
      new_unit_price: "",
    },
  });

  if (!isOpen || !invoice) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      item: {
        ...prev.item,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      sales_invoice_id: invoice.id
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const selectedItem = invoice.items?.find(
    item => item.id === parseInt(formData.item.sales_invoice_item_id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Hoàn trả/Đổi hàng - {invoice.invoice_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loại giao dịch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại giao dịch *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="return"
                  checked={formData.type === "return"}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="mr-2"
                />
                Hoàn trả
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="exchange"
                  checked={formData.type === "exchange"}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="mr-2"
                />
                Đổi hàng
              </label>
            </div>
          </div>

          {/* Chọn sản phẩm từ hóa đơn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sản phẩm cần {formData.type === "return" ? "hoàn trả" : "đổi"} *
            </label>
            <SearchableSelect
              options={invoice.items?.map((item) => ({
                value: item.id,
                label: `${item.product_name || item.name} - ${formatCurrency(item.unit_price)} (SL: ${item.quantity})`,
              })) || []}
              value={formData.item.sales_invoice_item_id}
              onChange={(value) => handleItemChange("sales_invoice_item_id", value)}
              placeholder="Chọn sản phẩm"
              required
            />
          </div>

          {/* Số lượng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng {formData.type === "return" ? "hoàn trả" : "đổi"} *
            </label>
            <input
              type="number"
              value={formData.item.quantity}
              onChange={(e) => handleItemChange("quantity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="1"
              max={selectedItem?.quantity || 0}
              required
            />
            {selectedItem && (
              <p className="text-xs text-gray-500 mt-1">
                Số lượng tối đa: {selectedItem.quantity}
              </p>
            )}
          </div>

          {/* Thông tin sản phẩm đổi (chỉ hiện khi type = exchange) */}
          {formData.type === "exchange" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sản phẩm mới *
                </label>
                <SearchableSelect
                  options={products.filter(p => p.total_stock > 0).map((product) => ({
                    value: product.id,
                    label: `${product.name} - ${formatCurrency(product.price)} (Tồn: ${product.total_stock})`,
                  }))}
                  value={formData.item.new_product_id}
                  onChange={(value) => handleItemChange("new_product_id", value)}
                  placeholder="Chọn sản phẩm mới"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá sản phẩm mới *
                </label>
                <input
                  type="number"
                  value={formData.item.new_unit_price}
                  onChange={(e) => handleItemChange("new_unit_price", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </>
          )}

          {/* Lý do */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do {formData.type === "return" ? "hoàn trả" : "đổi hàng"} *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn lý do</option>
              <option value="defective">Sản phẩm lỗi</option>
              <option value="wrong_size">Sai kích cỡ</option>
              <option value="wrong_color">Sai màu sắc</option>
              <option value="customer_change_mind">Khách hàng đổi ý</option>
              <option value="damaged_shipping">Hư hỏng khi vận chuyển</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Ghi chú thêm..."
            />
          </div>

          {/* Tính toán chênh lệch (chỉ hiện khi type = exchange) */}
          {formData.type === "exchange" && selectedItem && formData.item.new_unit_price && formData.item.quantity && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Tính toán chênh lệch</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Giá sản phẩm cũ:</span>
                  <span>{formatCurrency(selectedItem.unit_price * parseInt(formData.item.quantity || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giá sản phẩm mới:</span>
                  <span>{formatCurrency(parseFloat(formData.item.new_unit_price) * parseInt(formData.item.quantity || 0))}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Chênh lệch:</span>
                  <span className={
                    (parseFloat(formData.item.new_unit_price) * parseInt(formData.item.quantity || 0)) - 
                    (selectedItem.unit_price * parseInt(formData.item.quantity || 0)) >= 0 
                      ? "text-red-600" : "text-green-600"
                  }>
                    {formatCurrency(
                      Math.abs(
                        (parseFloat(formData.item.new_unit_price) * parseInt(formData.item.quantity || 0)) - 
                        (selectedItem.unit_price * parseInt(formData.item.quantity || 0))
                      )
                    )}
                    {(parseFloat(formData.item.new_unit_price) * parseInt(formData.item.quantity || 0)) - 
                     (selectedItem.unit_price * parseInt(formData.item.quantity || 0)) >= 0 
                      ? " (khách trả thêm)" : " (hoàn lại khách)"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang xử lý..." : `Tạo ${formData.type === "return" ? "hoàn trả" : "đổi hàng"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnExchangeModal;