import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';

const SalesInvoiceModal = ({ isOpen, onClose, invoice }) => {
    const printRef = useRef();

    if (!isOpen || !invoice) return null;

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        windowPrint.document.write(`
      <html>
        <head>
          <title>In hóa đơn - ${invoice.invoice_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #fff; color: #1a1a1a; }
            .print-container { padding: 40px; max-width: 800px; margin: 0 auto; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .text-3xl { font-size: 1.875rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-lg { font-size: 1.125rem; }
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-blue-600 { color: #2563eb; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-10 { margin-bottom: 2.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .border-y { border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
            .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-y-4 { row-gap: 1rem; }
            .w-full { width: 100%; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 12px 0; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; color: #111827; }
            td { padding: 12px 0; vertical-align: top; border-bottom: 1px solid #f3f4f6; }
            .flex { display: flex; }
            .justify-end { justify-content: flex-end; }
            .items-center { align-items: center; }
            .gap-8 { gap: 2rem; }
            .uppercase { text-transform: uppercase; }
            @media print {
              body { padding: 0; }
              .print-container { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
        windowPrint.document.close();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Hóa đơn bán hàng</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                            <Printer size={18} />
                            <span>In hóa đơn</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-12">
                    <div
                        ref={printRef}
                        className="bg-white mx-auto p-12 max-w-[800px] text-gray-900 shadow-sm"
                    >
                        {/* Shop Header */}
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase">SHOP TRANG GIÀY DÉP</h1>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Địa chỉ: Ấp 1, Xã Phú Lộc, H.Thạnh Trị, P.Sóc Trăng, TP.Cần Thơ
                            </p>
                            <p className="text-sm text-gray-600 font-medium">Điện thoại: 0788821666</p>
                        </div>

                        {/* Invoice Title */}
                        <div className="border-y border-gray-100 py-6 mb-10">
                            <h2 className="text-2xl font-bold text-center text-gray-800 uppercase tracking-widest">HÓA ĐƠN BÁN HÀNG</h2>
                        </div>

                        {/* Invoice Metadata */}
                        <div className="grid grid-cols-2 gap-y-4 mb-10 text-sm">
                            <div>
                                <span className="text-gray-500">Số hóa đơn:</span>
                                <p className="font-bold text-gray-900 mt-1">{invoice.invoice_number}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-500">Ngày mua:</span>
                                <p className="font-medium text-gray-900 mt-1">
                                    {new Date(invoice.invoice_date).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500">Khách hàng:</span>
                                <p className="font-bold text-gray-900 mt-1">
                                    {invoice.customer_name || invoice.account_username || 'Khách lẻ'}
                                </p>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <table className="w-full mb-10">
                            <thead>
                                <tr className="border-b border-gray-900 border-opacity-10">
                                    <th className="py-3 w-12">STT</th>
                                    <th className="py-3">Sản phẩm</th>
                                    <th className="py-3 w-16 text-center">SL</th>
                                    <th className="py-3 w-32 text-right">Đơn giá</th>
                                    <th className="py-3 w-32 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invoice.items && invoice.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-4 text-gray-500 text-sm">{index + 1}</td>
                                        <td className="py-4">
                                            <div className="font-bold text-gray-900 text-sm">{item.product_name}</div>
                                            {(item.color || item.size_eu || item.size) && (
                                                <div className="text-xs text-gray-500 mt-1 font-medium">
                                                    {item.color && <span>Màu: {item.color}</span>}
                                                    {item.color && (item.size_eu || item.size) && <span className="mx-2">|</span>}
                                                    {(item.size_eu || item.size) && <span>Size: {item.size_eu || item.size}</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 text-center text-sm font-medium text-gray-700">{item.quantity}</td>
                                        <td className="py-4 text-right text-sm font-medium text-gray-700">
                                            {new Intl.NumberFormat('vi-VN').format(item.unit_price)} đ
                                        </td>
                                        <td className="py-4 text-right text-sm font-bold text-gray-900">
                                            {new Intl.NumberFormat('vi-VN').format(item.total_price || (item.quantity * item.unit_price))} đ
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Grand Total */}
                        <div className="flex justify-end pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-8">
                                <span className="text-lg font-black text-gray-900 uppercase">TỔNG CỘNG:</span>
                                <span className="text-2xl font-black text-blue-600">
                                    {new Intl.NumberFormat('vi-VN').format(invoice.final_amount || invoice.total_revenue)} đ
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesInvoiceModal;
