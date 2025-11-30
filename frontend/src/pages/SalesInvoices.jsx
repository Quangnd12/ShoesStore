import { useState, useEffect, useMemo } from "react";
import { Plus, Eye, Edit, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  salesInvoicesAPI,
  productsAPI,
  returnExchangesAPI,
} from "../services/api";
import { useToast } from "../contexts/ToastContext";
import DynamicTabs from "../components/DynamicTabs";
import { useFormDirty } from "../hooks/useFormDirty";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchableSelect from "../components/SearchableSelect";
import LoadingSpinner from "../components/LoadingSpinner";
import SkeletonLoader from "../components/SkeletonLoader";

const SalesInvoices = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedInvoiceForReturn, setSelectedInvoiceForReturn] =
    useState(null);
  
  // Multi-tab structure
  const [tabs, setTabs] = useState([
    {
      label: "Hóa đơn 1",
      data: {
        invoice_number: "",
        invoice_date: new Date().toISOString().split("T")[0],
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        notes: "",
        items: [{ product_id: "", quantity: "", unit_price: "" }],
      },
    },
  ]);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  // Check if current tab has changes
  const initialTabData = useMemo(() => ({
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    notes: "",
    items: [{ product_id: "", quantity: "", unit_price: "" }],
  }), []);

  const currentTabData = useMemo(() => {
    return tabs[activeTabIndex]?.data || initialTabData;
  }, [tabs, activeTabIndex, initialTabData]);

  const isDirty = useFormDirty(currentTabData, initialTabData);

  const [returnForm, setReturnForm] = useState({
    type: "return",
    reason: "",
    notes: "",
    sales_invoice_id: null,
    item: {
      sales_invoice_item_id: "",
      quantity: "",
      new_product_id: "",
      new_unit_price: "",
    },
  });

  const [filters, setFilters] = useState({
    invoiceNumber: "",
    customer: "",
    dateFrom: "",
    dateTo: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Accordion state - track which dates are expanded
  const [expandedDates, setExpandedDates] = useState({});

  // Cache cho pagination
  const [pageCache, setPageCache] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, itemsPerPage]);

  const fetchInvoices = async (forceRefresh = false) => {
    try {
      // Tạo cache key
      const cacheKey = JSON.stringify({
        page: currentPage,
        limit: itemsPerPage,
        filters: filters,
      });

      // Kiểm tra cache (skip nếu forceRefresh)
      if (!forceRefresh && pageCache[cacheKey]) {
        const cached = pageCache[cacheKey];
        setInvoices(cached.invoices);
        setTotalPages(cached.totalPages);
        setLoading(false);
        return;
      }

      const response = await salesInvoicesAPI.getAll({ 
        page: currentPage,
        limit: itemsPerPage 
      });
      // API trả về { invoices: [...], totalItems, totalPages, ... }
      const invoicesData = response.data?.invoices || [];
      const total = response.data?.totalItems || invoicesData.length;
      const pages = response.data?.totalPages || Math.ceil(total / itemsPerPage) || 1;
      
      setInvoices(invoicesData);
      setTotalPages(pages);

      // Lưu vào cache
      setPageCache((prev) => ({
        ...prev,
        [cacheKey]: {
          invoices: invoicesData,
          totalPages: pages,
          timestamp: Date.now(),
        },
      }));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      showToast("Không thể tải danh sách hóa đơn bán", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 1000 });
      // API trả về { products: [...], ... } trong response.data
      const productsData = response.data?.products || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Không thể tải danh sách sản phẩm", "error");
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await salesInvoicesAPI.getById(id);
      setSelectedInvoice(response.data);
      setShowDetailModal(true);
    } catch (error) {
      alert("Không thể tải chi tiết hóa đơn");
    }
  };

  const handleAddTab = async () => {
    try {
      // Gọi API để lấy số hóa đơn tiếp theo từ backend
      const response = await salesInvoicesAPI.getNextInvoiceNumber();
      const newInvoiceNumber = response.data.invoice_number;
      
      setTabs([
        ...tabs,
        {
          label: `Hóa đơn ${tabs.length + 1}`,
          data: {
            invoice_number: newInvoiceNumber,
            invoice_date: new Date().toISOString().split("T")[0],
            customer_name: "",
            customer_phone: "",
            customer_email: "",
            notes: "",
            items: [{ product_id: "", quantity: "", unit_price: "" }],
          },
        },
      ]);
    } catch (error) {
      // Fallback nếu API lỗi - tăng số thủ công
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const lastTab = tabs[tabs.length - 1];
      let nextNum = 1;
      
      if (lastTab?.data?.invoice_number) {
        const match = lastTab.data.invoice_number.match(/(\d+)$/);
        if (match) {
          nextNum = parseInt(match[1]) + 1;
        }
      }
      
      const fallbackNumber = `HD${dateStr}-${String(nextNum).padStart(3, "0")}`;
      
      setTabs([
        ...tabs,
        {
          label: `Hóa đơn ${tabs.length + 1}`,
          data: {
            invoice_number: fallbackNumber,
            invoice_date: new Date().toISOString().split("T")[0],
            customer_name: "",
            customer_phone: "",
            customer_email: "",
            notes: "",
            items: [{ product_id: "", quantity: "", unit_price: "" }],
          },
        },
      ]);
    }
  };

  const handleTabClose = (index) => {
    if (tabs.length > 1) {
      const newTabs = tabs.filter((_, i) => i !== index);
      setTabs(newTabs);
      // Adjust activeTabIndex if needed
      if (activeTabIndex >= newTabs.length) {
        setActiveTabIndex(Math.max(0, newTabs.length - 1));
      } else if (activeTabIndex > index) {
        setActiveTabIndex(activeTabIndex - 1);
      }
    }
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };

  const handleAddItem = (tabIndex) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items.push({
      product_id: "",
      quantity: "",
      unit_price: "",
    });
    setTabs(newTabs);
  };

  const handleRemoveItem = (tabIndex, itemIndex) => {
    const newTabs = [...tabs];
    if (newTabs[tabIndex].data.items.length > 1) {
      newTabs[tabIndex].data.items = newTabs[tabIndex].data.items.filter(
        (_, i) => i !== itemIndex
      );
      setTabs(newTabs);
    }
  };

  const handleItemChange = (tabIndex, itemIndex, field, value) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items[itemIndex][field] = value;

    // Auto-fill unit_price from product if not set
    if (field === "product_id" && value) {
      const product = products.find((p) => p.id === parseInt(value));
      if (product && !newTabs[tabIndex].data.items[itemIndex].unit_price) {
        newTabs[tabIndex].data.items[itemIndex].unit_price = product.price;
      }
    }

    setTabs(newTabs);
  };

  const handleTabDataChange = (tabIndex, field, value) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data[field] = value;
    setTabs(newTabs);
  };

  const handleSubmit = async (e, tabIndex) => {
    e.preventDefault();
    try {
      const tabData = tabs[tabIndex].data;
      const items = tabData.items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        unit_price: item.unit_price ? parseFloat(item.unit_price) : undefined,
      }));

      await salesInvoicesAPI.create({
        invoice_number: tabData.invoice_number,
        invoice_date: tabData.invoice_date,
        customer_name: tabData.customer_name || null,
        customer_phone: tabData.customer_phone || null,
        customer_email: tabData.customer_email || null,
        notes: tabData.notes || null,
        items,
      });

      showToast("Tạo hóa đơn bán hàng thành công!", "success");
      
      // Remove submitted tab
      const newTabs = tabs.filter((_, i) => i !== tabIndex);
      if (newTabs.length === 0) {
        setShowModal(false);
        resetAllTabs();
      } else {
        setTabs(newTabs);
        // Adjust activeTabIndex
        if (activeTabIndex === tabIndex) {
          // If we closed the active tab, move to previous or first tab
          setActiveTabIndex(Math.max(0, tabIndex - 1));
        } else if (activeTabIndex > tabIndex) {
          // If we closed a tab before the active one, shift index down
          setActiveTabIndex(activeTabIndex - 1);
        }
      }
      
      // Xóa cache vì dữ liệu đã thay đổi
      setPageCache({});
      // Reset về trang 1 để thấy hóa đơn mới
      setCurrentPage(1);
      // Force refresh để bỏ qua cache
      await fetchInvoices(true);
      await fetchProducts();
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const handleOpenReturnModal = async (invoiceId) => {
    try {
      const response = await salesInvoicesAPI.getById(invoiceId);
      setSelectedInvoiceForReturn(response.data);
      setReturnForm({
        type: "return",
        reason: "",
        notes: "",
        sales_invoice_id: invoiceId,
        item: {
          sales_invoice_item_id:
            response.data.items && response.data.items[0]
              ? response.data.items[0].id
              : "",
          quantity:
            response.data.items && response.data.items[0]
              ? response.data.items[0].quantity
              : "",
          new_product_id: "",
          new_unit_price: "",
        },
      });
      setShowReturnModal(true);
    } catch (error) {
      showToast("Không thể tải dữ liệu hóa đơn để tạo hoàn trả/đổi", "error");
    }
  };

  const handleReturnItemChange = (field, value) => {
    setReturnForm((prev) => ({
      ...prev,
      item: {
        ...prev.item,
        [field]: value,
      },
    }));
  };

  const handleCreateReturnExchange = async (e) => {
    e.preventDefault();
    if (
      !returnForm.sales_invoice_id ||
      !returnForm.item.sales_invoice_item_id
    ) {
      showToast("Vui lòng chọn sản phẩm trong hóa đơn", "error");
      return;
    }

    try {
      const payload = {
        sales_invoice_id: returnForm.sales_invoice_id,
        type: returnForm.type,
        reason: returnForm.reason,
        notes: returnForm.notes || undefined,
        items: [
          {
            sales_invoice_item_id: parseInt(
              returnForm.item.sales_invoice_item_id
            ),
            quantity: parseInt(returnForm.item.quantity),
            new_product_id:
              returnForm.type === "exchange" && returnForm.item.new_product_id
                ? parseInt(returnForm.item.new_product_id)
                : undefined,
            new_unit_price:
              returnForm.type === "exchange" && returnForm.item.new_unit_price
                ? parseFloat(returnForm.item.new_unit_price)
                : undefined,
          },
        ],
      };

      await returnExchangesAPI.create(payload);
      showToast("Tạo yêu cầu hoàn trả/đổi hàng thành công!", "success");
      setShowReturnModal(false);
      setSelectedInvoiceForReturn(null);
      await fetchInvoices();
      await fetchProducts();
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Không thể tạo yêu cầu hoàn trả/đổi hàng",
        "error"
      );
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const prefix = `HD${dateStr}`;

      // Lấy tất cả hóa đơn bán trong ngày hôm nay
      const response = await salesInvoicesAPI.getAll({ limit: 1000 });
      const todayInvoices = (response.data?.invoices || []).filter((inv) => {
        const invDate = new Date(inv.invoice_date).toISOString().split("T")[0];
        return invDate === today.toISOString().split("T")[0];
      });

      // Tìm số thứ tự tiếp theo
      let nextNumber = 1;
      if (todayInvoices.length > 0) {
        const numbers = todayInvoices
          .map((inv) => {
            const match = inv.invoice_number?.match(
              new RegExp(`^${prefix}-(\\d+)$`)
            );
            return match ? parseInt(match[1]) : 0;
          })
          .filter((n) => n > 0);
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        }
      }

      return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
    } catch (error) {
      // Fallback nếu có lỗi
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      return `HD${dateStr}-001`;
    }
  };

  const resetAllTabs = async () => {
    try {
      // Gọi API để lấy số hóa đơn tiếp theo từ backend
      const response = await salesInvoicesAPI.getNextInvoiceNumber();
      const invoiceNumber = response.data.invoice_number;
      
      setTabs([
        {
          label: "Hóa đơn 1",
          data: {
            invoice_number: invoiceNumber,
            invoice_date: new Date().toISOString().split("T")[0],
            customer_name: "",
            customer_phone: "",
            customer_email: "",
            notes: "",
            items: [{ product_id: "", quantity: "", unit_price: "" }],
          },
        },
      ]);
      setActiveTabIndex(0);
    } catch (error) {
      // Fallback nếu API lỗi
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const fallbackNumber = `HD${dateStr}-001`;
      
      setTabs([
        {
          label: "Hóa đơn 1",
          data: {
            invoice_number: fallbackNumber,
            invoice_date: new Date().toISOString().split("T")[0],
            customer_name: "",
            customer_phone: "",
            customer_email: "",
            notes: "",
            items: [{ product_id: "", quantity: "", unit_price: "" }],
          },
        },
      ]);
      setActiveTabIndex(0);
    }
  };

  const handleCloseModal = () => {
    if (isDirty) {
      setPendingAction(() => () => {
        setShowModal(false);
        resetAllTabs();
      });
      setShowConfirmDialog(true);
    } else {
      setShowModal(false);
      resetAllTabs();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesInvoiceNumber = filters.invoiceNumber
      ? invoice.invoice_number
          ?.toLowerCase()
          .includes(filters.invoiceNumber.toLowerCase())
      : true;

    const customerName =
      invoice.customer_name || invoice.account_username || "";
    const matchesCustomer = filters.customer
      ? customerName.toLowerCase().includes(filters.customer.toLowerCase())
      : true;

    const invoiceDate = invoice.invoice_date
      ? new Date(invoice.invoice_date)
      : null;

    const matchesDateFrom = filters.dateFrom
      ? invoiceDate && invoiceDate >= new Date(filters.dateFrom + "T00:00:00")
      : true;

    const matchesDateTo = filters.dateTo
      ? invoiceDate && invoiceDate <= new Date(filters.dateTo + "T23:59:59")
      : true;

    return (
      matchesInvoiceNumber &&
      matchesCustomer &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  // Gom nhóm hóa đơn theo ngày
  const groupedInvoices = useMemo(() => {
    const groups = {};
    
    filteredInvoices.forEach((invoice) => {
      const dateKey = new Date(invoice.invoice_date).toLocaleDateString("vi-VN");
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          invoices: [],
          totalRevenue: 0,
          totalProducts: 0,
        };
      }
      
      groups[dateKey].invoices.push(invoice);
      groups[dateKey].totalRevenue += parseFloat(invoice.total_revenue) || 0;
      
      // Sử dụng total_quantity từ backend (đã được tính sẵn)
      groups[dateKey].totalProducts += parseInt(invoice.total_quantity) || 0;
    });
    
    // Chuyển object thành array và sắp xếp theo ngày giảm dần
    return Object.values(groups).sort((a, b) => {
      const dateA = a.date.split("/").reverse().join("-");
      const dateB = b.date.split("/").reverse().join("-");
      return dateB.localeCompare(dateA);
    });
  }, [filteredInvoices]);

  // Toggle accordion
  const toggleDate = (dateKey) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showModal && !showConfirmDialog) {
        handleCloseModal();
      }
      if (e.key === "Escape" && showDetailModal) {
        setShowDetailModal(false);
        setSelectedInvoice(null);
      }
      if (e.key === "Escape" && showReturnModal) {
        setShowReturnModal(false);
        setSelectedInvoiceForReturn(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, showDetailModal, showReturnModal, showConfirmDialog, isDirty]);

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hóa đơn bán hàng</h1>
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

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">
            Bộ lọc hóa đơn bán hàng
          </h3>
          <button
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() =>
              setFilters({
                invoiceNumber: "",
                customer: "",
                dateFrom: "",
                dateTo: "",
              })
            }
          >
            Xóa bộ lọc
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Số hóa đơn
            </label>
            <input
              type="text"
              value={filters.invoiceNumber}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  invoiceNumber: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm theo số hóa đơn"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Khách hàng
            </label>
            <input
              type="text"
              value={filters.customer}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  customer: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Tên hoặc tài khoản"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Ngày từ</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateFrom: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Ngày đến</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateTo: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Grouped Invoices by Date */}
      <div className="space-y-4">
        {groupedInvoices.map((group) => {
          const isExpanded = expandedDates[group.date];
          
          return (
            <div key={group.date} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleDate(group.date)}
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
                          {new Intl.NumberFormat("vi-VN").format(group.totalRevenue)} ₫
                        </span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center">
                        <span className="font-medium text-purple-600">{group.totalProducts}</span>
                        <span className="ml-1">sản phẩm</span>
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
                          Khách hàng
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
                            {invoice.customer_name || invoice.account_username || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invoice.updated_at
                              ? new Date(invoice.updated_at).toLocaleDateString("vi-VN")
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat("vi-VN").format(invoice.total_revenue)} ₫
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleViewDetail(invoice.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Xem chi tiết"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleOpenReturnModal(invoice.id)}
                                className="text-amber-600 hover:text-amber-800"
                                title="Tạo hoàn trả / đổi hàng"
                              >
                                <Edit size={18} />
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
        
        {groupedInvoices.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Không có hóa đơn nào
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Hiển thị{" "}
            <span className="font-medium">
              {Math.min((currentPage - 1) * itemsPerPage + 1, filteredInvoices.length)}
            </span>{" "}
            -{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium">{filteredInvoices.length}</span> hóa đơn
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang đầu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang trước"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-4 py-2 text-sm">
            Trang <span className="font-medium">{currentPage}</span> /{" "}
            <span className="font-medium">{totalPages}</span>
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang sau"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang cuối"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

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
                <form
                  onSubmit={(e) => handleSubmit(e, tabIndex)}
                  className="space-y-4"
                >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số hóa đơn *
                  </label>
                  <input
                    type="text"
                    required
                    value={tab.data.invoice_number}
                    onChange={(e) =>
                      handleTabDataChange(
                        tabIndex,
                        "invoice_number",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày *
                  </label>
                  <input
                    type="date"
                    required
                    value={tab.data.invoice_date}
                    onChange={(e) =>
                      handleTabDataChange(tabIndex, "invoice_date", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng
                  </label>
                  <input
                    type="text"
                    value={tab.data.customer_name}
                    onChange={(e) =>
                      handleTabDataChange(tabIndex, "customer_name", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điện thoại
                  </label>
                  <input
                    type="tel"
                    value={tab.data.customer_phone}
                    onChange={(e) =>
                      handleTabDataChange(tabIndex, "customer_phone", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={tab.data.customer_email}
                    onChange={(e) =>
                      handleTabDataChange(tabIndex, "customer_email", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={tab.data.notes}
                  onChange={(e) =>
                    handleTabDataChange(tabIndex, "notes", e.target.value)
                  }
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sản phẩm *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddItem(tabIndex)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Thêm sản phẩm
                  </button>
                </div>
                {tab.data.items.map((item, index) => {
                  const selectedProduct = Array.isArray(products)
                    ? products.find((p) => p.id === parseInt(item.product_id))
                    : null;
                  
                  // Lấy danh sách ID sản phẩm đã được chọn ở các dòng khác
                  const selectedProductIds = tab.data.items
                    .map((itm, idx) => idx !== index ? parseInt(itm.product_id) : null)
                    .filter(id => id !== null && !isNaN(id));
                  
                  // Lọc sản phẩm: còn hàng và chưa được chọn ở dòng khác
                  const availableProducts = Array.isArray(products)
                    ? products.filter((p) => 
                        p.stock_quantity > 0 && 
                        !selectedProductIds.includes(p.id)
                      )
                    : [];
                  
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 mb-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Sản phẩm {index + 1}
                        </span>
                        {tab.data.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(tabIndex, index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <SearchableSelect
                            label="Sản phẩm"
                            required
                            value={item.product_id}
                            onChange={(value) =>
                              handleItemChange(
                                tabIndex,
                                index,
                                "product_id",
                                value
                              )
                            }
                            options={availableProducts}
                            getOptionLabel={(product) =>
                              `${product.name} - Size: ${product.size || "N/A"} (Còn: ${product.stock_quantity})`
                            }
                            getOptionValue={(product) => product.id}
                            placeholder="Chọn sản phẩm"
                            searchPlaceholder="Tìm kiếm sản phẩm..."
                            emptyMessage="Không tìm thấy sản phẩm"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Số lượng *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            max={selectedProduct?.stock_quantity || ""}
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                tabIndex,
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          {selectedProduct && (
                            <p className="text-xs text-gray-500 mt-1">
                              Tồn kho: {selectedProduct.stock_quantity}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Đơn giá
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleItemChange(
                                tabIndex,
                                index,
                                "unit_price",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Tự động từ sản phẩm"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Tạo hóa đơn
                    </button>
                  </div>
                </form>
              )}
            />
          </div>
        </div>
      )}

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

      {showReturnModal && selectedInvoiceForReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Hoàn trả / Đổi hàng cho hóa đơn{" "}
                {selectedInvoiceForReturn.invoice_number}
              </h2>
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedInvoiceForReturn(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReturnExchange} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại yêu cầu *
                  </label>
                  <select
                    value={returnForm.type}
                    onChange={(e) =>
                      setReturnForm((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="return">Hoàn trả</option>
                    <option value="exchange">Đổi hàng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sản phẩm trong hóa đơn *
                  </label>
                  <select
                    value={returnForm.item.sales_invoice_item_id}
                    onChange={(e) =>
                      handleReturnItemChange(
                        "sales_invoice_item_id",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {selectedInvoiceForReturn.items
                      ?.filter((item) => item.quantity > 0)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.product_name} - Size: {item.size_eu || "N/A"} (SL:{" "}
                          {item.quantity})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={returnForm.item.quantity}
                    onChange={(e) =>
                      handleReturnItemChange("quantity", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do *
                  </label>
                  <input
                    type="text"
                    value={returnForm.reason}
                    onChange={(e) =>
                      setReturnForm((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
              </div>

              {returnForm.type === "exchange" && (
                <div className="border-t pt-4 mt-2 space-y-3">
                  <h3 className="font-medium text-gray-800">
                    Thông tin sản phẩm đổi sang
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sản phẩm mới *
                      </label>
                      <select
                        value={returnForm.item.new_product_id}
                        onChange={(e) =>
                          handleReturnItemChange(
                            "new_product_id",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Chọn sản phẩm</option>
                        {Array.isArray(products) &&
                          products
                            .filter((p) => p.stock_quantity > 0)
                            .map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - Size: {product.size || "N/A"}{" "}
                                (Còn: {product.stock_quantity})
                              </option>
                            ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đơn giá mới
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={returnForm.item.new_unit_price}
                        onChange={(e) =>
                          handleReturnItemChange(
                            "new_unit_price",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Bỏ trống để dùng giá mặc định"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={returnForm.notes}
                  onChange={(e) =>
                    setReturnForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReturnModal(false);
                    setSelectedInvoiceForReturn(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Chi tiết hóa đơn bán</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Số hóa đơn</p>
                  <p className="font-medium">
                    {selectedInvoice.invoice_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Khách hàng</p>
                  <p className="font-medium">
                    {selectedInvoice.customer_name ||
                      selectedInvoice.account_username ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Điện thoại</p>
                  <p className="font-medium">
                    {selectedInvoice.customer_phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">
                    {selectedInvoice.customer_email || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày</p>
                  <p className="font-medium">
                    {new Date(selectedInvoice.invoice_date).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng tiền</p>
                  <p className="font-medium text-lg text-blue-600">
                    {new Intl.NumberFormat("vi-VN").format(
                      selectedInvoice.total_revenue
                    )}{" "}
                    đ
                  </p>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    Ghi chú
                  </p>
                  <p className="text-gray-800">{selectedInvoice.notes}</p>
                </div>
              )}

              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Chi tiết sản phẩm</h3>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Hình ảnh
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Sản phẩm
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Size
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          SL
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Đơn giá
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.product_name}
                                className="w-12 h-12 object-cover rounded border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">N/A</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.product_name}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.size_eu || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">
                            {new Intl.NumberFormat("vi-VN").format(
                              item.unit_price
                            )}{" "}
                            đ
                          </td>
                          <td className="px-4 py-2 text-sm font-medium">
                            {new Intl.NumberFormat("vi-VN").format(
                              item.total_price
                            )}{" "}
                            đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedInvoice.returnExchanges && selectedInvoice.returnExchanges.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 text-orange-600">Lịch sử hoàn trả / đổi hàng</h3>
                  <div className="space-y-3">
                    {selectedInvoice.returnExchanges.map((re, idx) => (
                      <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            re.type === 'return' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {re.type === 'return' ? 'Hoàn trả' : 'Đổi hàng'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(re.created_at).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-medium">Sản phẩm cũ:</span>{" "}
                            {re.old_product_name} - Size: {re.old_product_size || "N/A"} (SL: {re.return_quantity})
                          </p>
                          {re.type === 'exchange' && re.new_product_name && (
                            <p>
                              <span className="font-medium">Sản phẩm mới:</span>{" "}
                              {re.new_product_name} - Size: {re.new_product_size || "N/A"}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Lý do:</span> {re.reason}
                          </p>
                          {re.notes && (
                            <p>
                              <span className="font-medium">Ghi chú:</span> {re.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoices;
