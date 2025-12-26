import { useState, useEffect } from "react";
import { Plus, RefreshCw, FileSpreadsheet } from "lucide-react";
import {
  purchaseInvoicesAPI,
  suppliersAPI,
  productsAPI,
  categoriesAPI,
} from "../services/api";
import { useToast } from "../contexts/ToastContext";
import DynamicTabs from "../components/DynamicTabs";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import SkeletonLoader from "../components/SkeletonLoader";
import ImportExcelModal from "../components/ImportExcelModal";

// Import new components
import InvoiceFilters from "../components/invoices/shared/InvoiceFilters";
import InvoicePagination from "../components/invoices/shared/InvoicePagination";
import InvoiceAccordion from "../components/invoices/shared/InvoiceAccordion";
import InvoiceDetailModal from "../components/invoices/shared/InvoiceDetailModal";
import PurchaseInvoiceForm from "../components/invoices/purchase/PurchaseInvoiceForm";

// Import hooks
import { useInvoices } from "../hooks/useInvoices";
import { useInvoiceModal } from "../hooks/useInvoiceModal";

const PurchaseInvoicesRefactored = () => {
  const { showToast } = useToast();
  
  // Data states
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom hooks
  const {
    invoices,
    loading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    filters,
    setFilters,
    groupedInvoices,
    refreshInvoices,
    deleteInvoice,
    clearFilters,
  } = useInvoices(purchaseInvoicesAPI, "purchase");

  const {
    showModal,
    tabs,
    activeTabIndex,
    showConfirmDialog,
    isDirty,
    handleAddTab,
    handleTabClose,
    handleTabChange,
    handleTabDataChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    handleCloseModal,
    handleConfirmClose,
    handleCancelClose,
    openModal,
  } = useInvoiceModal(purchaseInvoicesAPI, "purchase");

  // Fetch data
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      showToast("Không thể tải danh sách nhà cung cấp", "error");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 1000 });
      const productsData = response.data?.products || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Không thể tải danh sách sản phẩm", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("Không thể tải danh sách danh mục", "error");
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await purchaseInvoicesAPI.getById(id);
      setSelectedInvoice(response.data);
      setShowDetailModal(true);
    } catch (error) {
      showToast("Không thể tải chi tiết hóa đơn", "error");
    }
  };

  const handleSubmit = async (e, tabIndex) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const tabData = tabs[tabIndex].data;
      const items = [];

      // Convert variants to items for API
      tabData.items.forEach((item) => {
        if (item.product_id) {
          item.variants.forEach((variant) => {
            items.push({
              product_id: parseInt(item.product_id),
              quantity: parseInt(variant.quantity),
              unit_cost: parseFloat(variant.unit_cost),
              size: variant.size || null,
            });
          });
        } else {
          item.variants.forEach((variant) => {
            items.push({
              name: item.name,
              price: parseFloat(item.price),
              category_id: parseInt(item.category_id),
              quantity: parseInt(variant.quantity),
              unit_cost: parseFloat(variant.unit_cost),
              size: variant.size || null,
              image_url: item.image_url || null,
              brand: item.brand || null,
              color: item.color || null,
            });
          });
        }
      });

      await purchaseInvoicesAPI.create({
        invoice_number: tabData.invoice_number,
        supplier_id: parseInt(tabData.supplier_id),
        invoice_date: tabData.invoice_date,
        notes: tabData.notes,
        items,
      });

      // Remove submitted tab
      const newTabs = tabs.filter((_, i) => i !== tabIndex);
      if (newTabs.length === 0) {
        handleCloseModal();
      } else {
        // Handle tab removal logic here
        handleTabClose(tabIndex);
      }
      
      await refreshInvoices();
      window.dispatchEvent(new Event("products-updated"));
      showToast("Tạo hóa đơn nhập thành công!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportExcel = async (invoicesData) => {
    try {
      const response = await purchaseInvoicesAPI.import(invoicesData);
      
      await refreshInvoices();

      const { success_count, error_count, errors } = response.data;

      if (error_count === 0) {
        showToast(`Import thành công ${success_count} hóa đơn!`, "success");
      } else if (success_count === 0) {
        const errorMessages = errors.map(err => `${err.invoice_number}: ${err.error}`).join("; ");
        showToast(`Import thất bại: ${errorMessages}`, "error");
      } else {
        const errorMessages = errors.map(err => `${err.invoice_number}: ${err.error}`).join("; ");
        showToast(
          `Import thành công ${success_count} hóa đơn, thất bại ${error_count} hóa đơn. ${errorMessages}`,
          "warning"
        );
      }
    } catch (error) {
      showToast("Có lỗi xảy ra khi import: " + (error.response?.data?.message || error.message), "error");
    }
  };

  const toggleDate = (dateKey) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
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
            onClick={refreshInvoices}
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
            onClick={openModal}
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
      <InvoiceAccordion
        groupedInvoices={groupedInvoices}
        expandedDates={expandedDates}
        onToggleDate={toggleDate}
        onViewDetail={handleViewDetail}
        onDelete={deleteInvoice}
        type="purchase"
      />

      {/* Pagination */}
      <InvoicePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Tạo hóa đơn nhập hàng
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <DynamicTabs
                tabs={tabs}
                activeTabIndex={activeTabIndex}
                onTabChange={handleTabChange}
                onTabClose={handleTabClose}
                onAddTab={handleAddTab}
                renderTabContent={(tab, tabIndex) => (
                  <PurchaseInvoiceForm
                    formData={tab.data}
                    suppliers={suppliers}
                    products={products}
                    categories={categories}
                    onFormChange={(field, value) => handleTabDataChange(tabIndex, field, value)}
                    onItemChange={(itemIndex, field, value) => handleItemChange(tabIndex, itemIndex, field, value)}
                    onAddItem={() => handleAddItem(tabIndex)}
                    onRemoveItem={(itemIndex) => handleRemoveItem(tabIndex, itemIndex)}
                    onSubmit={(e) => handleSubmit(e, tabIndex)}
                    isSubmitting={isSubmitting}
                  />
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <InvoiceDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        type="purchase"
      />

      {/* Import Modal */}
      {showImportModal && (
        <ImportExcelModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportExcel}
          type="purchase"
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Xác nhận đóng"
        message="Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn đóng không?"
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />
    </div>
  );
};

export default PurchaseInvoicesRefactored;