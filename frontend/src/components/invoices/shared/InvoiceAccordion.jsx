import { ChevronDown, ChevronUp, Eye, Edit, Trash2 } from "lucide-react";

const InvoiceAccordion = ({
  groupedInvoices,
  expandedDates,
  onToggleDate,
  onViewDetail,
  onEdit,
  onDelete,
  type = "purchase" // "purchase" or "sales"
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getAmountField = () => {
    return type === "purchase" ? "totalCost" : "totalRevenue";
  };

  const getAmountLabel = () => {
    return type === "purchase" ? "Tổng chi phí" : "Tổng doanh thu";
  };

  return (
    <div className="space-y-4">
      {groupedInvoices.map((group) => (
        <div key={group.date} className="bg-white rounded-lg shadow">
          <button
            onClick={() => onToggleDate(group.date)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">{group.date}</h3>
                <p className="text-sm text-gray-600">
                  {group.invoices.length} hóa đơn • {group.totalProducts} sản phẩm
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {formatCurrency(group[getAmountField()])}
                </p>
                <p className="text-xs text-gray-500">{getAmountLabel()}</p>
              </div>
              {expandedDates[group.date] ? (
                <ChevronUp className="text-gray-400" size={20} />
              ) : (
                <ChevronDown className="text-gray-400" size={20} />
              )}
            </div>
          </button>

          {expandedDates[group.date] && (
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số hóa đơn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {type === "purchase" ? "Nhà cung cấp" : "Khách hàng"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getAmountLabel()}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoice_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {type === "purchase" 
                              ? (invoice.supplier_name || "N/A")
                              : (invoice.customer_name || invoice.account_username || "Khách lẻ")
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {type === "purchase" 
                              ? (invoice.items?.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0) || 0)
                              : (parseInt(invoice.total_quantity) || 0)
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(
                              type === "purchase" 
                                ? (parseFloat(invoice.total_cost) || 0)
                                : (parseFloat(invoice.total_revenue) || 0)
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(invoice.created_at).toLocaleString("vi-VN")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onViewDetail(invoice.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            {onEdit && (
                              <button
                                onClick={() => onEdit(invoice.id)}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Chỉnh sửa"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(invoice.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InvoiceAccordion;