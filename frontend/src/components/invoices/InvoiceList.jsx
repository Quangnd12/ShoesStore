import React from 'react';
import { ChevronDown, ChevronUp, Eye, Trash2, Edit } from 'lucide-react';

const InvoiceList = ({
  groupedInvoices,
  expandedDates,
  onToggleDate,
  onViewDetail,
  onDelete,
  onEdit,
  type = 'purchase' // 'purchase' or 'sales'
}) => {
  return (
    <div className="space-y-4">
      {groupedInvoices.map((group) => {
        const isExpanded = expandedDates[group.date];
        
        return (
          <div key={group.date} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Accordion Header */}
            <button
              onClick={() => onToggleDate(group.date)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-blue-600" />
                  ) : (
                    <ChevronDown size={20} className="text-blue-600" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ngày {group.date}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center">
                      <span className="font-medium text-blue-600">{group.invoices.length}</span>
                      <span className="ml-1">hóa đơn</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center">
                      <span className="font-medium text-green-600">
                        {new Intl.NumberFormat("vi-VN").format(
                          type === 'purchase' 
                            ? (group.totalCost || 0)
                            : (group.totalRevenue || 0)
                        )} ₫
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {isExpanded ? "Thu gọn" : "Xem chi tiết"}
              </div>
            </button>

            {/* Accordion Content */}
            {isExpanded && (
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Số hóa đơn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {type === 'purchase' ? 'Nhà cung cấp' : 'Khách hàng'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ngày
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ngày cập nhật
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {type === 'purchase' 
                            ? (invoice.supplier_name || "-")
                            : (invoice.customer_name || invoice.account_username || "-")
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.invoice_date).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.updated_at
                            ? new Date(invoice.updated_at).toLocaleDateString("vi-VN")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat("vi-VN").format(
                            type === 'purchase' 
                              ? invoice.total_cost 
                              : (invoice.final_amount || invoice.total_revenue || 0)
                          )} đ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onViewDetail(invoice.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                            {onEdit && (
                              <button
                                onClick={() => onEdit(invoice.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Hoàn trả/Đổi hàng"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(invoice.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InvoiceList;