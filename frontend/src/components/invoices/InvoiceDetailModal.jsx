import React, { useState, useEffect } from 'react';
import { X, Edit2, FileText, History, Printer, RotateCcw, ArrowLeftRight, User, Phone, Mail, CreditCard, Calendar, Package, Clock, Check, Save } from 'lucide-react';
import GroupedProductVariants from '../GroupedProductVariants';
import PurchaseInvoiceEditModal from './purchase/PurchaseInvoiceEditModal';
import ImageZoomModal from '../ImageZoomModal';

const InvoiceDetailModal = ({
  isOpen,
  onClose,
  invoice,
  type = 'purchase', // 'purchase' or 'sales'
  onInvoiceUpdated,
  onViewReceipt,
  onUpdateInvoice // Prop to handle sales invoice updates
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: "", alt: "" });
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNote, setEditedNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (invoice) {
      setEditedNote(invoice.notes || "");
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  const handleSaveNote = async () => {
    if (!onUpdateInvoice) return;
    setIsSaving(true);
    const success = await onUpdateInvoice(invoice.id, { notes: editedNote });
    setIsSaving(false);
    if (success) {
      setIsEditingNote(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    onInvoiceUpdated?.();
  };

  const handleImageClick = (imageUrl, productName) => {
    setSelectedImage({ url: imageUrl, alt: productName });
    setShowImageZoom(true);
  };

  const returnExchanges = invoice.return_exchanges || invoice.returnExchanges || [];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${type === 'purchase' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Chi tiết hóa đơn {type === 'purchase' ? 'nhập hàng' : 'bán hàng'}
                </h2>
                <p className="text-xs text-gray-500 font-medium">#{invoice.invoice_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {type === 'sales' && onViewReceipt && (
                <button
                  onClick={() => onViewReceipt(invoice.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm shadow-sm"
                >
                  <Printer size={18} />
                  <span>In hóa đơn</span>
                </button>
              )}
              {type === 'purchase' && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-sm shadow-md"
                >
                  <Edit2 size={18} />
                  <span>Chỉnh sửa</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Top Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                  <User size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">{type === 'purchase' ? 'Nhà cung cấp' : 'Khách hàng'}</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {type === 'purchase'
                    ? invoice.supplier_name
                    : (invoice.customer_name || invoice.account_username || 'Khách lẻ')
                  }
                </p>
                {type === 'sales' && (invoice.customer_phone || invoice.customer_email) && (
                  <div className="mt-3 space-y-1">
                    {invoice.customer_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        <span>{invoice.customer_phone}</span>
                      </div>
                    )}
                    {invoice.customer_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        <span>{invoice.customer_email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                  <Calendar size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Thời gian</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Ngày lập:</span>
                    <span className="font-semibold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString("vi-VN")}</span>
                  </div>
                  {invoice.created_at && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Giờ lập:</span>
                      <span className="font-semibold text-gray-900">{new Date(invoice.created_at).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                  {invoice.updated_at && (
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-50">
                      <span className="text-gray-500 italic">Cập nhật cuối:</span>
                      <span className="text-gray-600 italic">{new Date(invoice.updated_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                  <CreditCard size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Thanh toán</span>
                </div>
                <p className="text-2xl font-black text-blue-600 mb-2">
                  {new Intl.NumberFormat("vi-VN").format(
                    type === 'purchase'
                      ? (invoice.total_cost || 0)
                      : (invoice.final_amount || invoice.total_revenue || 0)
                  )} đ
                </p>
                {type === 'sales' && invoice.payment_method && (
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold w-fit">
                    {invoice.payment_method === 'cash' ? '💵 Tiền mặt' :
                      invoice.payment_method === 'card' ? '💳 Quẹt thẻ' :
                        invoice.payment_method === 'transfer' ? '🏦 Chuyển khoản' :
                          invoice.payment_method}
                  </div>
                )}
              </div>
            </div>

            {/* Note Section - More prominent and editable */}
            <div className={`bg-amber-50 border border-amber-100 rounded-2xl p-6 relative overflow-hidden transition-all ${isEditingNote ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
              <div className="absolute right-0 top-0 opacity-10 -rotate-12 translate-x-4 -translate-y-4">
                <FileText size={120} />
              </div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-amber-400 rounded-full"></div>
                  <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Ghi chú hóa đơn</h4>
                </div>
                {type === 'sales' && (
                  <div className="flex gap-2">
                    {isEditingNote ? (
                      <>
                        <button
                          onClick={handleSaveNote}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-bold disabled:opacity-50"
                        >
                          {isSaving ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : <Save size={14} />}
                          Lưu
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingNote(false);
                            setEditedNote(invoice.notes || "");
                          }}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-xs font-bold"
                        >
                          <X size={14} />
                          Hủy
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditingNote(true)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-xs font-bold shadow-sm"
                      >
                        <Edit2 size={14} />
                        Sửa ghi chú
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="relative z-10">
                {isEditingNote ? (
                  <textarea
                    autoFocus
                    value={editedNote}
                    onChange={(e) => setEditedNote(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-xl p-4 text-amber-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none min-h-[100px] shadow-inner"
                    placeholder="Nhập ghi chú mới cho hóa đơn này..."
                  />
                ) : (
                  invoice.notes ? (
                    <p className="text-amber-900/80 text-sm whitespace-pre-wrap leading-relaxed font-medium italic">
                      "{invoice.notes}"
                    </p>
                  ) : (
                    <p className="text-amber-900/40 text-sm italic">Hóa đơn này không có ghi chú đi kèm.</p>
                  )
                )}
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-gray-400" />
                  <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">Danh sách sản phẩm</h3>
                </div>
                <span className="bg-white px-3 py-1 rounded-lg border text-xs font-bold text-gray-500">
                  {invoice.items?.length || 0} mục
                </span>
              </div>

              {invoice.items && invoice.items.length > 0 ? (
                type === 'purchase' ? (
                  <div className="p-6">
                    <GroupedProductVariants items={invoice.items} />
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b">STT</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Sản phẩm</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Ảnh</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Size</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b">SL</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Đơn giá</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoice.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-400">{index + 1}</td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-gray-900 text-sm mb-1">{item.product_name || item.name || 'N/A'}</div>
                              {item.color && (
                                <div className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 uppercase">
                                  Màu: {item.color}
                                </div>
                              )}
                              {item.brand && (
                                <div className="text-[10px] text-gray-400 mt-1">
                                  {item.brand}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.image_url ? (
                              <div
                                className="w-12 h-12 mx-auto rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all cursor-zoom-in group shadow-sm"
                                onClick={() => handleImageClick(item.image_url, item.product_name || item.name)}
                              >
                                <img
                                  src={item.image_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                                <Package size={20} />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                            {item.size_eu || item.size || '-'}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-black text-gray-900 bg-gray-50/50">
                            {item.quantity || 0}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                            {new Intl.NumberFormat("vi-VN").format(item.unit_price || 0)}đ
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-black text-gray-900">
                            {new Intl.NumberFormat("vi-VN").format((item.quantity || 0) * (item.unit_price || 0))}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50/50">
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-right text-sm font-bold text-gray-500 uppercase tracking-widest">Tạm tính:</td>
                        <td className="px-6 py-4 text-right text-sm font-black text-gray-900">
                          {new Intl.NumberFormat("vi-VN").format(invoice.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}đ
                        </td>
                      </tr>
                      {type === 'sales' && invoice.discount_amount > 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-right text-sm font-bold text-red-500 uppercase tracking-widest">Giảm giá:</td>
                          <td className="px-6 py-4 text-right text-sm font-black text-red-600">
                            -{new Intl.NumberFormat("vi-VN").format(invoice.discount_amount)}đ
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                )
              ) : (
                <div className="p-12 text-center text-gray-400 italic">
                  Không có sản phẩm trong hóa đơn này.
                </div>
              )}
            </div>

            {/* Return/Exchange History - The main enhancement */}
            {type === 'sales' && returnExchanges.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <History size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 uppercase text-sm tracking-wide">Lịch sử hoàn trả / đổi hàng</h3>
                  <span className="bg-orange-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest">
                    {returnExchanges.length} YÊU CẦU
                  </span>
                </div>

                <div className="space-y-4">
                  {returnExchanges.map((re, idx) => (
                    <div
                      key={idx}
                      className={`
                        relative border rounded-2xl p-6 transition-all hover:shadow-md overflow-hidden bg-white
                        ${re.type === 'return' ? 'border-red-100 hover:border-red-200' : 'border-blue-100 hover:border-blue-200'}
                      `}
                    >
                      {/* Badge Type background decoration */}
                      <div className={`absolute -right-4 -bottom-4 opacity-5 rotate-12 ${re.type === 'return' ? 'text-red-600' : 'text-blue-600'}`}>
                        {re.type === 'return' ? <RotateCcw size={120} /> : <ArrowLeftRight size={120} />}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`
                            px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm
                            ${re.type === 'return' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}
                          `}>
                            {re.type === 'return' ? 'Hoàn trả' : 'Đổi hàng'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock size={14} />
                            <span className="text-xs font-bold">{new Date(re.created_at).toLocaleString("vi-VN")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lý do:</span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-black uppercase italic">
                            {re.reason === 'defective' ? 'Lỗi sản phẩm' :
                              re.reason === 'wrong_item' ? 'Giao sai hàng' :
                                re.reason === 'customer_change_mind' ? 'Đổi ý' :
                                  re.reason === 'size_issue' ? 'Không vừa size' : re.reason}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sản phẩm đầu vào</p>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center text-gray-300 flex-shrink-0">
                              <RotateCcw size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-900 truncate">{re.old_product_name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500 font-bold">Size: {re.old_product_size || "N/A"}</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-xs text-red-600 font-black tracking-widest">SỐ LƯỢNG: {re.return_quantity}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {re.type === 'exchange' && re.new_product_name && (
                          <div className="p-4 bg-blue-50/50 rounded-xl border border-dashed border-blue-200">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Đổi mới sang</p>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-white border border-blue-100 flex items-center justify-center text-blue-300 flex-shrink-0">
                                <ArrowLeftRight size={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-blue-900 truncate">{re.new_product_name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-blue-700/70 font-bold">Size mới: {re.new_product_size || "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {re.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-50 bg-gray-50/30 rounded-b-2xl -mx-6 -mb-6 px-6 pb-6 relative z-10">
                          <div className="flex gap-2">
                            <FileText size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ghi chú xử lý</p>
                              <p className="text-xs text-gray-600 italic font-medium">"{re.notes}"</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auxiliary Modals */}
      {type === 'purchase' && (
        <PurchaseInvoiceEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          invoice={invoice}
          onSuccess={handleEditSuccess}
        />
      )}

      <ImageZoomModal
        isOpen={showImageZoom}
        onClose={() => setShowImageZoom(false)}
        imageUrl={selectedImage.url}
        altText={selectedImage.alt}
      />
    </>
  );
};

export default InvoiceDetailModal;