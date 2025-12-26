import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../contexts/ToastContext';

export const useInvoiceData = (api, initialFilters = {}) => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    invoiceNumber: "",
    supplier: "",
    customer: "",
    dateFrom: "",
    dateTo: "",
    ...initialFilters
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Cache cho pagination
  const [pageCache, setPageCache] = useState({});

  // Accordion state
  const [expandedDates, setExpandedDates] = useState({});

  const fetchInvoices = async (forceRefresh = false) => {
    try {
      const cacheKey = JSON.stringify({
        page: currentPage,
        limit: itemsPerPage,
        filters: filters,
      });

      if (!forceRefresh && pageCache[cacheKey]) {
        const cached = pageCache[cacheKey];
        setInvoices(cached.invoices);
        setTotalPages(cached.totalPages);
        setLoading(false);
        return;
      }

      const response = await api.getAll({ 
        page: currentPage,
        limit: itemsPerPage 
      });
      
      const invoicesData = response.data?.invoices || [];
      const total = response.data?.totalItems || invoicesData.length;
      const pages = response.data?.totalPages || Math.ceil(total / itemsPerPage) || 1;
      
      setInvoices(invoicesData);
      setTotalPages(pages);

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
      showToast("Không thể tải danh sách hóa đơn", "error");
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    setPageCache({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return;
    try {
      await api.delete(id);
      showToast("Xóa hóa đơn thành công!", "success");
      clearCache();
      await fetchInvoices(true);
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesInvoiceNumber = filters.invoiceNumber
        ? invoice.invoice_number
            ?.toLowerCase()
            .includes(filters.invoiceNumber.toLowerCase())
        : true;

      const supplierName = invoice.supplier_name || "";
      const customerName = invoice.customer_name || invoice.account_username || "";
      const matchesSupplier = filters.supplier
        ? supplierName.toLowerCase().includes(filters.supplier.toLowerCase())
        : true;
      const matchesCustomer = filters.customer
        ? customerName.toLowerCase().includes(filters.customer.toLowerCase())
        : true;

      const invoiceDate = invoice.invoice_date ? new Date(invoice.invoice_date) : null;
      const matchesDateFrom = filters.dateFrom
        ? invoiceDate && invoiceDate >= new Date(filters.dateFrom + "T00:00:00")
        : true;
      const matchesDateTo = filters.dateTo
        ? invoiceDate && invoiceDate <= new Date(filters.dateTo + "T23:59:59")
        : true;

      return (
        matchesInvoiceNumber &&
        matchesSupplier &&
        matchesCustomer &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [invoices, filters]);

  const groupedInvoices = useMemo(() => {
    const groups = {};
    
    filteredInvoices.forEach((invoice) => {
      const dateKey = new Date(invoice.invoice_date).toLocaleDateString("vi-VN");
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          invoices: [],
          totalCost: 0,
          totalRevenue: 0,
          totalProducts: 0,
        };
      }
      
      groups[dateKey].invoices.push(invoice);
      
      // Handle different total amount fields safely
      const totalCost = parseFloat(invoice.total_cost) || 0;
      const totalRevenue = parseFloat(invoice.total_revenue) || parseFloat(invoice.final_amount) || 0;
      
      groups[dateKey].totalCost += totalCost;
      groups[dateKey].totalRevenue += totalRevenue;
      
      // Count total products
      if (invoice.items && Array.isArray(invoice.items)) {
        groups[dateKey].totalProducts += invoice.items.reduce((sum, item) => {
          return sum + (parseInt(item.quantity) || 0);
        }, 0);
      } else if (invoice.total_quantity) {
        groups[dateKey].totalProducts += parseInt(invoice.total_quantity) || 0;
      }
    });
    
    Object.values(groups).forEach(group => {
      group.invoices.sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return timeB - timeA;
      });
    });

    return Object.values(groups).sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split("/");
      const [dayB, monthB, yearB] = b.date.split("/");
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredInvoices]);

  const toggleDate = (dateKey) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      invoiceNumber: "",
      supplier: "",
      customer: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, itemsPerPage]);

  return {
    // Data
    invoices,
    filteredInvoices,
    groupedInvoices,
    loading,
    
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    
    // Filters
    filters,
    setFilters,
    clearFilters,
    
    // UI State
    expandedDates,
    toggleDate,
    
    // Actions
    fetchInvoices,
    handleDelete,
    handlePageChange,
    handleItemsPerPageChange,
    clearCache,
  };
};