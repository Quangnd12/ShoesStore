import { Plus, Trash2 } from "lucide-react";
import SearchableSelect from "../../SearchableSelect";
import SalesInvoiceItem from "./SalesInvoiceItem";

const SalesInvoiceForm = ({
  formData,
  products,
  onFormChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  isSubmitting = false
}) => {
  const handleInputChange = (field, value) => {
    onFormChange(field, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      return total + (quantity * unitPrice);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông tin hóa đơn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số hóa đơn *
          </label>
          <input
            type="text"
            value={formData.invoice_number}
            onChange={(e) => handleInputChange("invoice_number", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày bán *
          </label>
          <input
            type="date"
            value={formData.invoice_date}
            onChange={(e) => handleInputChange("invoice_date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Thông tin khách hàng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên khách hàng
          </label>
          <input
            type="text"
            value={formData.customer_name}
            onChange={(e) => handleInputChange("customer_name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên khách hàng"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={formData.customer_phone}
            onChange={(e) => handleInputChange("customer_phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.customer_email}
            onChange={(e) => handleInputChange("customer_email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập email"
          />
        </div>
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

      {/* Danh sách sản phẩm */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Danh sách sản phẩm</h3>
          <button
            type="button"
            onClick={onAddItem}
            className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={16} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-800">Sản phẩm {index + 1}</h4>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveItem(index)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <SalesInvoiceItem
                item={item}
                itemIndex={index}
                products={products}
                onItemChange={onItemChange}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tổng kết */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tổng số lượng:</span>
            <span className="font-medium">
              {formData.items.reduce((total, item) => {
                return total + (parseInt(item.quantity) || 0);
              }, 0)}
            </span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
            <span>Tổng cộng:</span>
            <span className="text-green-600">
              {formatCurrency(calculateTotal())}
            </span>
          </div>
        </div>
      </div>

      {/* Nút submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Đang tạo..." : "Tạo hóa đơn"}
        </button>
      </div>
    </form>
  );
};

export default SalesInvoiceForm;