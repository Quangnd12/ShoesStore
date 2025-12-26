import React, { useEffect } from 'react';
import { Plus, RefreshCw, FileSpreadsheet, X } from 'lucide-react';
import { purchaseInvoicesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useInvoiceData } from '../hooks/useInvoiceData';
import { usePurchaseInvoice } from '../hooks/usePurchaseInvoice';
import InvoiceFilters from '../components/invoices/InvoiceFilters';
import InvoiceList from '../components/invoices/InvoiceList';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import PaginationControls from '../components/invoices/PaginationControls';
import DynamicTabs from '../components/DynamicTabs';
import PurchaseInvoiceForm from '../components/invoices/purchase/PurchaseInvoiceForm';
import ConfirmDialog from '../components/ConfirmDialog';
import ImportExcelModal from '../components/ImportExcelModal';
import SkeletonLoader from '../components/SkeletonLoader';

const PurchaseInvoices = () => {
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
  } = useInvoiceData(purchaseInvoicesAPI);

  // Purchase invoice specific logic
  const {
    suppliers,
    products,
    categories,
    tabs,
    selectedInvoice,
    activeTabIndex,
    isDirty,
    showModal,
    showDetailModal,
    showImportModal,
    showConfirmDialog,
    setShowModal,
    setShowDetailModal,
    setShowImportModal,
    handleViewDetail,
    handleAddTab,
    handleTabClose,
    handleTabChange,
    handleTabDataChange,
    handleItemChange,
    handleImageFileChange,
    handleAddVariant,
    handleRemoveVariant,
    handleVariantChange,
    handleSubmit,
    handleSubmitAll,
    handleImportExcel,
    handleCloseModal,
    handleConfirmClose,
    handleCancelClose,
    resetAllTabs,
    setTabs,
  } = usePurchaseInvoice();

  // Refresh data after operations
  useEffect(() => {
    const handleProductsUpdated = () => {
      clearCache();
      fetchInvoices(true);
    };

    window.addEventListener('products-updated', handleProductsUpdated);
    return () => window.removeEventListener('products-updated', handleProductsUpdated);
  }, [clearCache, fetchInvoices]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showModal && !showConfirmDialog) {
        handleCloseModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, showConfirmDialog, handleCloseModal]);

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        <SkeletonLoader type="list" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hóa đơn nhập hàng</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              clearCache();
              await fetchInvoices(true);
              showToast("Đã làm mới danh sách hóa đơn", "success");
            }}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            title="Làm mới danh sách"
          >
            <RefreshCw size={20} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FileSpreadsheet size={20} />
            <span>Import Excel</span>
          </button>
          <button
            onClick={async () => {
              await resetAllTabs();
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            <span>Thêm hóa đơn nhập</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <InvoiceFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        type="purchase"
      />

      {/* Invoice List */}
      <InvoiceList
        groupedInvoices={groupedInvoices}
        expandedDates={expandedDates}
        onToggleDate={toggleDate}
        onViewDetail={handleViewDetail}
        onDelete={handleDelete}
        type="purchase"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Thêm hóa đơn nhập hàng</h2>
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
                <PurchaseInvoiceForm
                  tab={tab}
                  tabIndex={tabIndex}
                  suppliers={suppliers}
                  products={products}
                  categories={categories}
                  tabs={tabs}
                  setTabs={setTabs}
                  onSubmit={handleSubmit}
                  onTabDataChange={handleTabDataChange}
                  onItemChange={handleItemChange}
                  onImageFileChange={handleImageFileChange}
                  onAddVariant={handleAddVariant}
                  onRemoveVariant={handleRemoveVariant}
                  onVariantChange={handleVariantChange}
                  onSubmitAll={handleSubmitAll}
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
        type="purchase"
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

      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportExcel}
        suppliers={suppliers}
        categories={categories}
        products={products}
      />
    </div>
  );
};

export default PurchaseInvoices;