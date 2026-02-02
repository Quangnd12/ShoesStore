import { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

export const useInvoiceData = (api, initialFilters = {}) => {
  const { showToast } = useToast();
  const [allInvoices, setAllInvoices] = useState([]); // Tất cả hóa đơn
  const [loading, setLoading] = useState(true);
  
  // Input filters (thay đổi ngay khi user gõ)
  const [filters, setFilters] = useState({
    invoiceNumber: "",
    supplier: "",
    customer: "",
    dateFrom: "",
    dateTo: "",
    ...initialFilters
  });

  // Debounced filters (dùng để filter thực sự)
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const isFirstRender = useRef(true);

  // Pagination states - áp dụng SAU KHI filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Cache
  const [dataCache, setDataCache] = useState(null);

  // Accordion state
  const [expandedDates, setExpandedDates] = useState({});

  // Fetch TẤT CẢ hóa đơn một lần
  const fetchInvoices = async (forceRefresh = false) => {
    try {
      // Kiểm tra cache (5 phút)
      const CACHE_DURATION = 5 * 60 * 1000;
      const now = Date.now();

      if (!forceRefresh && dataCache && (now - dataCache.timestamp < CACHE_DURATION)) {
        setAllInvoices(dataCache.invoices);
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await api.getAll({ limit: 10000 }); // Lấy tất cả
      
      const invoicesData = response.data?.invoices || response.data || [];
      
      setAllInvoices(invoicesData);
      setDataCache({
        invoices: invoicesData,
        timestamp: now,
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      showToast("Không thể tải danh sách hóa đơn", "error");
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    setDataCache(null);
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

  // Filter tất cả hóa đơn
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((invoice) => {
      const matchesInvoiceNumber = debouncedFilters.invoiceNumber
        ? invoice.invoice_number
            ?.toLowerCase()
            .includes(debouncedFilters.invoiceNumber.toLowerCase())
        : true;

      const supplierName = invoice.supplier_name || "";
      const customerName = invoice.customer_name || invoice.account_username || "";
      const matchesSupplier = debouncedFilters.supplier
        ? supplierName.toLowerCase().includes(debouncedFilters.supplier.toLowerCase())
        : true;
      const matchesCustomer = debouncedFilters.customer
        ? customerName.toLowerCase().includes(debouncedFilters.customer.toLowerCase())
        : true;

      const invoiceDate = invoice.invoice_date ? new Date(invoice.invoice_date) : null;
      const matchesDateFrom = debouncedFilters.dateFrom
        ? invoiceDate && invoiceDate >= new Date(debouncedFilters.dateFrom + "T00:00:00")
        : true;
      const matchesDateTo = debouncedFilters.dateTo
        ? invoiceDate && invoiceDate <= new Date(debouncedFilters.dateTo + "T23:59:59")
        : true;

      return (
        matchesInvoiceNumber &&
        matchesSupplier &&
        matchesCustomer &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [allInvoices, debouncedFilters]);

  // Tính totalPages dựa trên filteredInvoices
  const totalPages = useMemo(() => {
    return Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  }, [filteredInvoices.length, itemsPerPage]);

  // Paginate sau khi filter
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInvoices.slice(startIndex, endIndex);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  // Group theo ngày - chỉ group những hóa đơn đã paginate
  const groupedInvoices = useMemo(() => {
    const groups = {};
    
    paginatedInvoices.forEach((invoice) => {
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
      
      const totalCost = parseFloat(invoice.total_cost) || 0;
      const totalRevenue = parseFloat(invoice.total_revenue) || parseFloat(invoice.final_amount) || 0;
      
      groups[dateKey].totalCost += totalCost;
      groups[dateKey].totalRevenue += totalRevenue;
      
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
  }, [paginatedInvoices]);

  const toggleDate = (dateKey) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    const emptyFilters = {
      invoiceNumber: "",
      supplier: "",
      customer: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(emptyFilters);
    setDebouncedFilters(emptyFilters);
    setCurrentPage(1);
  };

  // Debounce filters - chờ 300ms sau khi user ngừng gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
    // Expand tất cả các ngày khi filter
    setExpandedDates({});
  }, [debouncedFilters]);

  // Fetch data lần đầu
  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    // Data
    invoices: paginatedInvoices,
    filteredInvoices,
    groupedInvoices,
    loading,
    totalItems: filteredInvoices.length,
    
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