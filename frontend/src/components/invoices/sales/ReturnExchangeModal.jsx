import React from 'react';
import { X } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Hoàn trả / Đổi hàng</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Thông tin hóa đơn</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Số hóa đơn:</span>
              <span className="ml-2 font-medium">{invoice.invoice_number}</span>
            </div>
            <div>
              <span className="text-gray-600">Khách hàng:</span>
              <span className="ml-2 font-medium">
                {invoice.customer_name || invoice.account_username || '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Ngày:</span>
              <span className="ml-2 font-medium">
                {new Date(invoice.invoice_date).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="ml-2 font-medium">
                {new Intl.NumberFormat("vi-VN").format(
                  invoice.final_amount || invoice.total_revenue || 0
                )} đ
              </span>
            </div>
          </div>
          
          {/* Hiển thị danh sách sản phẩm trong hóa đơn */}
          {invoice.items && invoice.items.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Sản phẩm trong hóa đơn:</h4>
              <div className="max-h-32 overflow-y-auto">
                {invoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1 text-xs border-b border-gray-200 last:border-b-0">
                    <span className="font-medium">
                      {item.product_name || item.name}
                      {item.size && <span className="text-gray-500 ml-1">({item.size})</span>}
                    </span>
                    <span className="text-gray-600">
                      SL: {item.quantity} - {new Intl.NumberFormat("vi-VN").format(item.unit_price || 0)}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại yêu cầu *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="return"
                  checked={returnForm.type === "return"}
                  onChange={(e) => onReturnFormChange("type", e.target.value)}
                  className="mr-2"
                />
                Hoàn trả
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="exchange"
                  checked={returnForm.type === "exchange"}
                  onChange={(e) => onReturnFormChange("type", e.target.value)}
                  className="mr-2"
                />
                Đổi hàng
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sản phẩm trong hóa đơn *
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
                  onReturnItemChange("quantity", selectedItem.quantity.toString());
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn sản phẩm</option>
              {invoice.items?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.product_name || item.name} 
                  {item.size && ` (${item.size})`}
                  {item.color && ` - ${item.color}`}
                  - SL: {item.quantity || 0} - 
                  Giá: {new Intl.NumberFormat("vi-VN").format(item.unit_price || 0)}đ
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng *
            </label>
            <input
              type="number"
              required
              min="1"
              value={returnForm.item.quantity}
              onChange={(e) => onReturnItemChange("quantity", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {returnForm.type === "exchange" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sản phẩm đổi *
                </label>
                <select
                  required={returnForm.type === "exchange"}
                  value={returnForm.item.new_product_id}
                  onChange={(e) => {
                    onReturnItemChange("new_product_id", e.target.value);
                    const product = products.find(p => p.id === parseInt(e.target.value));
                    if (product) {
                      onReturnItemChange("new_unit_price", product.price.toString());
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn sản phẩm mới</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {new Intl.NumberFormat("vi-VN").format(product.price)}đ
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá sản phẩm mới *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required={returnForm.type === "exchange"}
                  value={returnForm.item.new_unit_price}
                  onChange={(e) => onReturnItemChange("new_unit_price", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do *
            </label>
            <select
              required
              value={returnForm.reason}
              onChange={(e) => onReturnFormChange("reason", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn lý do</option>
              <option value="defective">Sản phẩm lỗi</option>
              <option value="wrong_item">Giao sai hàng</option>
              <option value="customer_change_mind">Khách hàng đổi ý</option>
              <option value="size_issue">Không vừa size</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={returnForm.notes}
              onChange={(e) => onReturnFormChange("notes", e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi chú thêm về yêu cầu hoàn trả/đổi hàng"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tạo yêu cầu {returnForm.type === "return" ? "hoàn trả" : "đổi hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnExchangeModal;