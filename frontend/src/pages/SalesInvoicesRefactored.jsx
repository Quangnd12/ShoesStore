import React, { useEffect } from 'react';
import { Plus, FileSpreadsheet, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { salesInvoicesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useInvoiceData } from '../hooks/useInvoiceData';
import { useSalesInvoice } from '../hooks/useSalesInvoice';
import InvoiceFilters from '../components/invoices/InvoiceFilters';
import InvoiceList from '../components/invoices/InvoiceList';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import PaginationControls from '../components/invoices/PaginationControls';
import DynamicTabs from '../components/DynamicTabs';
import SalesInvoiceForm from '../components/invoices/sales/SalesInvoiceForm';
import ReturnExchangeModal from '../components/invoices/sales/ReturnExchangeModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ExportExcelModal from '../components/ExportExcelModal';

const SalesInvoices = () => {
  const { showToast } = useToast();
  
  // Invoice data management
  const {
    filteredInvoices,
    groupedInvoices,
    loading,
    currentPage,
    totalPages,
    itemsPerPage,
    filters,
    setFilters,
    clearFilters,
    expandedDates,
    toggleDate,
    fetchInvoices,
    handleDelete,
    handlePageChange,
    handleItemsPerPageChange,
    clearCache,
  } = useInvoiceData(salesInvoicesAPI, { customer: "" });

  // Sales invoice specific logic
  const {
    products,
    tabs,
    selectedInvoice,
    selectedInvoiceForReturn,
    returnForm,
    activeTabIndex,
    isDirty,
    showModal,
    showDetailModal,
    showReturnModal,
    showExportModal,
    showConfirmDialog,
    setShowModal,
    setShowDetailModal,
    setShowReturnModal,
    setShowExportModal,
    handleViewDetail,
    handleAddTab,
    handleTabClose,
    handleTabChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleTabDataChange,
    handleSubmit,
    handleOpenReturnModal,
    handleReturnFormChange,
    handleReturnItemChange,
    handleCreateReturnExchange,
    handleCloseModal,
    handleConfirmClose,
    handleCancelClose,
    resetAllTabs,
  } = useSalesInvoice();

  // Handle Excel export
  const handleExportExcel = async (options) => {
    try {
      showToast("Đang xuất file Excel...", "info");
      
      // Tạo params cho API dựa trên options
      let apiParams = { limit: 10000 };
      
      // Xử lý date range - sửa logic filter
      if (options.dateRange !== "all") {
        if (options.dateFrom) {
          apiParams.dateFrom = options.dateFrom;
        }
        if (options.dateTo) {
          apiParams.dateTo = options.dateTo;
        }
      }
      
      // Lấy tất cả hóa đơn theo filter
      const response = await salesInvoicesAPI.getAll(apiParams);
      const allInvoices = response.data?.invoices || response.data || [];
      
      // Filter client-side để đảm bảo chính xác
      let filteredInvoices = allInvoices;
      if (options.dateRange !== "all" && (options.dateFrom || options.dateTo)) {
        console.log("Filtering with dates:", options.dateFrom, "to", options.dateTo);
        filteredInvoices = allInvoices.filter(invoice => {
          const invoiceDate = new Date(invoice.invoice_date);
          const fromDate = options.dateFrom ? new Date(options.dateFrom + "T00:00:00") : null;
          const toDate = options.dateTo ? new Date(options.dateTo + "T23:59:59") : null;
          
          if (fromDate && invoiceDate < fromDate) return false;
          if (toDate && invoiceDate > toDate) return false;
          return true;
        });
        console.log(`Filtered from ${allInvoices.length} to ${filteredInvoices.length} invoices`);
      }
      
      if (filteredInvoices.length === 0) {
        showToast("Không có dữ liệu trong khoảng thời gian đã chọn", "warning");
        return;
      }

      showToast(`Đang xử lý ${filteredInvoices.length} hóa đơn...`, "info");

      // Lấy chi tiết từng hóa đơn
      const detailedInvoices = [];
      let processedCount = 0;
      
      for (const invoice of filteredInvoices) {
        try {
          processedCount++;
          if (processedCount % 10 === 0) {
            showToast(`Đang xử lý ${processedCount}/${filteredInvoices.length} hóa đơn...`, "info");
          }
          
          const detailResponse = await salesInvoicesAPI.getById(invoice.id);
          const invoiceDetail = detailResponse.data;
          
          if (options.format === "summary") {
            // Format tổng hợp - mỗi dòng là một hóa đơn
            const summaryRow = {
              "STT": detailedInvoices.length + 1,
              "Số hóa đơn": invoiceDetail.invoice_number,
              "Ngày bán": new Date(invoiceDetail.invoice_date).toLocaleDateString("vi-VN"),
            };

            if (options.includeCustomerInfo) {
              summaryRow["Khách hàng"] = invoiceDetail.customer_name || "";
              summaryRow["Số điện thoại"] = invoiceDetail.customer_phone || "";
              summaryRow["Email"] = invoiceDetail.customer_email || "";
            }

            summaryRow["Số sản phẩm"] = invoiceDetail.items?.length || 0;
            summaryRow["Tổng số lượng"] = invoiceDetail.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            if (options.includePaymentInfo) {
              summaryRow["Tổng tiền"] = invoiceDetail.final_amount || invoiceDetail.total_revenue || 0;
              summaryRow["Giảm giá"] = invoiceDetail.discount_amount || 0;
              summaryRow["Phương thức TT"] = invoiceDetail.payment_method === "cash" ? "Tiền mặt" : 
                                          invoiceDetail.payment_method === "card" ? "Thẻ" : 
                                          invoiceDetail.payment_method === "transfer" ? "Chuyển khoản" : "";
            }

            summaryRow["Ghi chú"] = invoiceDetail.notes || "";
            summaryRow["Người tạo"] = invoiceDetail.created_by || "";
            summaryRow["Ngày tạo"] = new Date(invoiceDetail.created_at).toLocaleDateString("vi-VN");

            detailedInvoices.push(summaryRow);
          } else {
            // Format chi tiết - mỗi dòng là một sản phẩm
            if (invoiceDetail.items && invoiceDetail.items.length > 0) {
              invoiceDetail.items.forEach((item) => {
                const detailRow = {
                  "STT": detailedInvoices.length + 1,
                  "Số hóa đơn": invoiceDetail.invoice_number,
                  "Ngày bán": new Date(invoiceDetail.invoice_date).toLocaleDateString("vi-VN"),
                };

                if (options.includeCustomerInfo) {
                  detailRow["Khách hàng"] = invoiceDetail.customer_name || "";
                  detailRow["Số điện thoại"] = invoiceDetail.customer_phone || "";
                  detailRow["Email"] = invoiceDetail.customer_email || "";
                }

                detailRow["Tên sản phẩm"] = item.product_name || item.name || "";

                if (options.includeProductDetails) {
                  detailRow["Màu sắc"] = item.color || "";
                  detailRow["Kích cỡ"] = item.size_eu || item.size || "";
                  detailRow["Thương hiệu"] = item.brand || "";
                }

                detailRow["Số lượng"] = item.quantity || 0;
                detailRow["Đơn giá"] = item.unit_price || 0;
                detailRow["Thành tiền"] = (item.quantity || 0) * (item.unit_price || 0);

                if (options.includePaymentInfo) {
                  detailRow["Tổng hóa đơn"] = invoiceDetail.final_amount || invoiceDetail.total_revenue || 0;
                  detailRow["Giảm giá"] = invoiceDetail.discount_amount || 0;
                  detailRow["Phương thức TT"] = invoiceDetail.payment_method === "cash" ? "Tiền mặt" : 
                                              invoiceDetail.payment_method === "card" ? "Thẻ" : 
                                              invoiceDetail.payment_method === "transfer" ? "Chuyển khoản" : "";
                }

                detailRow["Ghi chú"] = invoiceDetail.notes || "";
                detailRow["Người tạo"] = invoiceDetail.created_by || "";
                detailRow["Ngày tạo"] = new Date(invoiceDetail.created_at).toLocaleDateString("vi-VN");

                detailedInvoices.push(detailRow);
              });
            } else {
              // Hóa đơn không có sản phẩm
              const emptyRow = {
                "STT": detailedInvoices.length + 1,
                "Số hóa đơn": invoiceDetail.invoice_number,
                "Ngày bán": new Date(invoiceDetail.invoice_date).toLocaleDateString("vi-VN"),
              };

              if (options.includeCustomerInfo) {
                emptyRow["Khách hàng"] = invoiceDetail.customer_name || "";
                emptyRow["Số điện thoại"] = invoiceDetail.customer_phone || "";
                emptyRow["Email"] = invoiceDetail.customer_email || "";
              }

              emptyRow["Tên sản phẩm"] = "";

              if (options.includeProductDetails) {
                emptyRow["Màu sắc"] = "";
                emptyRow["Kích cỡ"] = "";
                emptyRow["Thương hiệu"] = "";
              }

              emptyRow["Số lượng"] = 0;
              emptyRow["Đơn giá"] = 0;
              emptyRow["Thành tiền"] = 0;

              if (options.includePaymentInfo) {
                emptyRow["Tổng hóa đơn"] = invoiceDetail.final_amount || invoiceDetail.total_revenue || 0;
                emptyRow["Giảm giá"] = invoiceDetail.discount_amount || 0;
                emptyRow["Phương thức TT"] = invoiceDetail.payment_method === "cash" ? "Tiền mặt" : 
                                            invoiceDetail.payment_method === "card" ? "Thẻ" : 
                                            invoiceDetail.payment_method === "transfer" ? "Chuyển khoản" : "";
              }

              emptyRow["Ghi chú"] = invoiceDetail.notes || "";
              emptyRow["Người tạo"] = invoiceDetail.created_by || "";
              emptyRow["Ngày tạo"] = new Date(invoiceDetail.created_at).toLocaleDateString("vi-VN");

              detailedInvoices.push(emptyRow);
            }
          }
        } catch (error) {
          console.error(`Error fetching invoice ${invoice.id}:`, error);
          // Thêm hóa đơn với thông tin cơ bản nếu không lấy được chi tiết
          const basicRow = {
            "STT": detailedInvoices.length + 1,
            "Số hóa đơn": invoice.invoice_number || "",
            "Ngày bán": new Date(invoice.invoice_date).toLocaleDateString("vi-VN"),
            "Khách hàng": invoice.customer_name || "",
            "Tổng tiền": invoice.final_amount || invoice.total_revenue || 0,
            "Ghi chú": "Lỗi khi lấy chi tiết hóa đơn",
          };
          detailedInvoices.push(basicRow);
        }
      }

      if (detailedInvoices.length === 0) {
        showToast("Không có dữ liệu chi tiết để xuất", "warning");
        return;
      }

      // Tạo workbook và worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(detailedInvoices);

      // Thiết lập độ rộng cột tự động
      const colWidths = Object.keys(detailedInvoices[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Thêm worksheet vào workbook
      const sheetName = options.format === "summary" ? "Tổng hợp hóa đơn" : "Chi tiết hóa đơn";
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Tạo tên file với timestamp và filter info
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 10).replace(/-/g, '');
      const formatSuffix = options.format === "summary" ? "tonghop" : "chitiet";
      const fileName = `hoa_don_ban_hang_${formatSuffix}_${timestamp}.xlsx`;

      // Xuất file
      XLSX.writeFile(wb, fileName);
      
      showToast(`Xuất thành công ${detailedInvoices.length} dòng dữ liệu!`, "success");
      
      // Đóng modal sau khi export thành công
      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      showToast("Có lỗi xảy ra khi xuất file Excel: " + (error.message || "Lỗi không xác định"), "error");
    }
  };

  // Refresh data after operations
  useEffect(() => {
    const handleInvoicesUpdated = () => {
      clearCache();
      fetchInvoices(true);
    };

    window.addEventListener('invoices-updated', handleInvoicesUpdated);
    return () => window.removeEventListener('invoices-updated', handleInvoicesUpdated);
  }, [clearCache, fetchInvoices]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showModal && !showConfirmDialog) {
        handleCloseModal();
      }
      if (e.key === "Escape" && showDetailModal) {
        setShowDetailModal(false);
      }
      if (e.key === "Escape" && showReturnModal) {
        setShowReturnModal(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, showDetailModal, showReturnModal, showConfirmDialog, handleCloseModal, setShowDetailModal, setShowReturnModal]);

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hóa đơn bán hàng</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FileSpreadsheet size={20} />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => {
              resetAllTabs();
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            <span>Thêm hóa đơn bán</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <InvoiceFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        type="sales"
      />

      {/* Invoice List */}
      <InvoiceList
        groupedInvoices={groupedInvoices}
        expandedDates={expandedDates}
        onToggleDate={toggleDate}
        onViewDetail={handleViewDetail}
        onDelete={handleDelete}
        onEdit={handleOpenReturnModal}
        type="sales"
      />

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredInvoices.length}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Create Invoice Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Thêm hóa đơn bán hàng</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <DynamicTabs
              tabs={tabs}
              onTabChange={handleTabChange}
              onTabClose={handleTabClose}
              onAddTab={handleAddTab}
              renderTabContent={(tab, tabIndex) => (
                <SalesInvoiceForm
                  tab={tab}
                  tabIndex={tabIndex}
                  products={products}
                  onSubmit={handleSubmit}
                  onTabDataChange={handleTabDataChange}
                  onItemChange={handleItemChange}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                  onCancel={handleCloseModal}
                />
              )}
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <InvoiceDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        invoice={selectedInvoice}
        type="sales"
      />

      {/* Return/Exchange Modal */}
      <ReturnExchangeModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        invoice={selectedInvoiceForReturn}
        products={products}
        returnForm={returnForm}
        onReturnFormChange={handleReturnFormChange}
        onReturnItemChange={handleReturnItemChange}
        onSubmit={handleCreateReturnExchange}
      />

      {/* Export Excel Modal */}
      <ExportExcelModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportExcel}
        totalRecords={filteredInvoices.length}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        show={showConfirmDialog}
        title="Xác nhận thoát"
        message="Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát?"
        confirmText="Thoát"
        cancelText="Tiếp tục chỉnh sửa"
        confirmColor="red"
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />
    </div>
  );
};

export default SalesInvoices;