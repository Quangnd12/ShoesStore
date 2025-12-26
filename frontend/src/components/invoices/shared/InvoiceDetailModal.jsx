import { X } from "lucide-react";

const InvoiceDetailModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  type = "purchase" // "purchase" or "sales"
}) => {
  if (!isOpen || !invoice) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Chi tiết hóa đơn {type === "purchase" ? "nhập" : "bán"}: {invoice.invoice_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Thông tin hóa đơn</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Số hóa đơn:</span>
                  <p className="font-medium">{invoice.invoice_number}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Ngày {type === "purchase" ? "nhập" : "bán"}:</span>
                  <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Ngày tạo:</span>
                  <p className="font-medium">{formatDateTime(invoice.created_at)}</p>
                </div>
                {invoice.notes && (
                  <div>
                    <span className="text-sm text-gray-600">Ghi chú:</span>
                    <p className="font-medium">{invoice.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {type === "purchase" ? "Thông tin nhà cung cấp" : "Thông tin khách hàng"}
              </h3>
              <div className="space-y-2">
                {type === "purchase" ? (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">Nhà cung cấp:</span>
                      <p className="font-medium">{invoice.supplier_name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Số điện thoại:</span>
                      <p className="font-medium">{invoice.supplier_phone || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{invoice.supplier_email || "N/A"}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">Khách hàng:</span>
                      <p className="font-medium">{invoice.customer_name || invoice.account_username || "Khách lẻ"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Số điện thoại:</span>
                      <p className="font-medium">{invoice.customer_phone || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{invoice.customer_email || "N/A"}</p>
                    </div>
                    {type === "sales" && (
                      <>
                        <div>
                          <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
                          <p className="font-medium">
                            {invoice.payment_method === "cash" ? "Tiền mặt" : 
                             invoice.payment_method === "card" ? "Thẻ" : 
                             invoice.payment_method === "transfer" ? "Chuyển khoản" : "N/A"}
                          </p>
                        </div>
                        {invoice.discount_amount > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">Giảm giá:</span>
                            <p className="font-medium text-red-600">{formatCurrency(invoice.discount_amount)}</p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Danh sách sản phẩm</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Màu sắc
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kích cỡ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {type === "purchase" ? "Giá nhập" : "Đơn giá"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.product_name || item.name}
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.product_name || item.name}
                            </div>
                            {item.brand && (
                              <div className="text-sm text-gray-500">{item.brand}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.color || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.size_eu || item.size || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.unit_cost || item.unit_price)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency((item.unit_cost || item.unit_price) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tổng kết */}
          <div className="mt-6 flex justify-end">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tổng số lượng:</span>
                  <span className="font-medium">
                    {invoice.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </span>
                </div>
                {type === "sales" && invoice.discount_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Giảm giá:</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(invoice.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {formatCurrency(
                      type === "purchase" 
                        ? (invoice.total_cost || 0)
                        : (invoice.final_amount || invoice.total_revenue || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;