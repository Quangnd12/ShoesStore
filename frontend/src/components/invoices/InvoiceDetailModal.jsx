import React from 'react';
import { X } from 'lucide-react';
import GroupedProductVariants from '../GroupedProductVariants';

const InvoiceDetailModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  type = 'purchase' // 'purchase' or 'sales'
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Chi tiết hóa đơn {type === 'purchase' ? 'nhập' : 'bán'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Số hóa đơn</p>
              <p className="font-medium">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {type === 'purchase' ? 'Nhà cung cấp' : 'Khách hàng'}
              </p>
              <p className="font-medium">
                {type === 'purchase' 
                  ? invoice.supplier_name 
                  : (invoice.customer_name || invoice.account_username || '-')
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày</p>
              <p className="font-medium">
                {new Date(invoice.invoice_date).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="font-medium text-lg text-blue-600">
                {new Intl.NumberFormat("vi-VN").format(
                  type === 'purchase' 
                    ? (invoice.total_cost || 0)
                    : (invoice.final_amount || invoice.total_revenue || 0)
                )} đ
              </p>
            </div>
          </div>

          {/* Sales invoice specific fields */}
          {type === 'sales' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {invoice.customer_phone && (
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-medium">{invoice.customer_phone}</p>
                  </div>
                )}
                {invoice.customer_email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{invoice.customer_email}</p>
                  </div>
                )}
                {invoice.payment_method && (
                  <div>
                    <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                    <p className="font-medium">
                      {invoice.payment_method === 'cash' ? 'Tiền mặt' : 
                       invoice.payment_method === 'card' ? 'Thẻ' : 
                       invoice.payment_method === 'transfer' ? 'Chuyển khoản' : 
                       invoice.payment_method}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Thông tin tổng tiền chi tiết cho sales */}
              {(invoice.discount_amount > 0 || invoice.subtotal) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Chi tiết thanh toán</h4>
                  <div className="space-y-2 text-sm">
                    {invoice.subtotal && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tạm tính:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("vi-VN").format(invoice.subtotal)} đ
                        </span>
                      </div>
                    )}
                    {invoice.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giảm giá:</span>
                        <span className="font-medium text-red-600">
                          -{new Intl.NumberFormat("vi-VN").format(invoice.discount_amount)} đ
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium text-gray-800">Tổng cộng:</span>
                      <span className="font-bold text-blue-600">
                        {new Intl.NumberFormat("vi-VN").format(
                          invoice.final_amount || invoice.total_revenue || 0
                        )} đ
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {invoice.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 font-medium mb-1">Ghi chú</p>
              <p className="text-gray-800">{invoice.notes}</p>
            </div>
          )}

          {invoice.items && invoice.items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiết sản phẩm
              </h3>
              {type === 'purchase' ? (
                <GroupedProductVariants items={invoice.items} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sản phẩm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hình ảnh
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lượng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Đơn giá
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div>
                              <div className="font-medium">{item.product_name || item.name || 'N/A'}</div>
                              {item.color && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Màu: {item.color}
                                </div>
                              )}
                              {item.brand && (
                                <div className="text-xs text-gray-500">
                                  Thương hiệu: {item.brand}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.product_name || item.name}
                                className="w-12 h-12 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-400">No img</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.size_eu || item.size || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Intl.NumberFormat("vi-VN").format(item.unit_price || 0)} đ
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat("vi-VN").format(
                              (item.quantity || 0) * (item.unit_price || 0)
                            )} đ
                          </td>
                        </tr>
                      ))}
                      {/* Tổng cộng */}
                      <tr className="bg-gray-50 font-medium">
                        <td colSpan="5" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Tổng cộng:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          {new Intl.NumberFormat("vi-VN").format(
                            invoice.items.reduce((total, item) => {
                              return total + ((item.quantity || 0) * (item.unit_price || 0));
                            }, 0)
                          )} đ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;