import { useState, useEffect } from "react";
import { X, Package, FileText, Truck, Calendar, DollarSign, Hash } from "lucide-react";
import { purchaseInvoicesAPI } from "../services/api";

const PurchaseHistoryModal = ({ isOpen, onClose, product }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedHistory, setGroupedHistory] = useState([]);

  useEffect(() => {
    if (isOpen && product) {
      fetchHistory();
    }
  }, [isOpen, product]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Lấy theo tên sản phẩm để bao gồm tất cả biến thể
      const response = await purchaseInvoicesAPI.getHistoryByProductName(product.name);
      const data = response.data || [];
      setHistory(data);
      
      // Group theo hóa đơn
      const grouped = data.reduce((acc, item) => {
        const key = item.invoice_id;
        if (!acc[key]) {
          acc[key] = {
            invoice_id: item.invoice_id,
            invoice_number: item.invoice_number,
            invoice_date: item.invoice_date,
            supplier_name: item.supplier_name,
            supplier_phone: item.supplier_phone,
            invoice_notes: item.invoice_notes,
            items: [],
            total_quantity: 0,
            total_cost: 0
          };
        }
        acc[key].items.push(item);
        acc[key].total_quantity += item.quantity || 0;
        acc[key].total_cost += parseFloat(item.total_cost) || 0;
        return acc;
      }, {});
      
      setGroupedHistory(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  // Tính tổng
  const totalStats = {
    invoices: groupedHistory.length,
    quantity: history.reduce((sum, item) => sum + (item.quantity || 0), 0),
    cost: history.reduce((sum, item) => sum + (parseFloat(item.total_cost) || 0), 0)
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText size={24} />
                Lịch sử nhập hàng
              </h2>
              <p className="text-blue-100 mt-1 text-sm">
                Sản phẩm: {product?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FileText size={16} />
              Số hóa đơn nhập
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalStats.invoices}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Package size={16} />
              Tổng số lượng nhập
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalStats.quantity}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <DollarSign size={16} />
              Tổng chi phí nhập
            </div>
            <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(totalStats.cost)}đ</p>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : groupedHistory.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Chưa có lịch sử nhập hàng</p>
              <p className="text-sm text-gray-400 mt-1">Sản phẩm này chưa được nhập từ hóa đơn nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedHistory.map((invoice, index) => (
                <div 
                  key={invoice.invoice_id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Invoice Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Hash size={16} className="text-blue-500" />
                        <span className="font-semibold text-blue-600">{invoice.invoice_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar size={14} />
                        {formatDate(invoice.invoice_date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Truck size={14} className="text-gray-400" />
                      <span className="text-gray-600">{invoice.supplier_name || "Không rõ NCC"}</span>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs uppercase">
                          <th className="text-left pb-2 font-medium">Size</th>
                          <th className="text-left pb-2 font-medium">Màu</th>
                          <th className="text-right pb-2 font-medium">Số lượng</th>
                          <th className="text-right pb-2 font-medium">Giá nhập</th>
                          <th className="text-right pb-2 font-medium">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {invoice.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-2">
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                {item.size_eu || "-"}
                              </span>
                            </td>
                            <td className="py-2 text-gray-600">{item.color || "-"}</td>
                            <td className="py-2 text-right font-medium">{item.quantity}</td>
                            <td className="py-2 text-right text-gray-600">{formatCurrency(item.unit_cost)}đ</td>
                            <td className="py-2 text-right font-medium text-green-600">{formatCurrency(item.total_cost)}đ</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-200">
                          <td colSpan="2" className="pt-2 font-medium text-gray-700">Tổng cộng</td>
                          <td className="pt-2 text-right font-bold text-blue-600">{invoice.total_quantity}</td>
                          <td className="pt-2"></td>
                          <td className="pt-2 text-right font-bold text-green-600">{formatCurrency(invoice.total_cost)}đ</td>
                        </tr>
                      </tfoot>
                    </table>

                    {invoice.invoice_notes && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                        <span className="font-medium">Ghi chú:</span> {invoice.invoice_notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistoryModal;
