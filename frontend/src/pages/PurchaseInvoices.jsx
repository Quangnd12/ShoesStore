import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Eye, X, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import {
  purchaseInvoicesAPI,
  suppliersAPI,
  productsAPI,
  categoriesAPI,
} from "../services/api";
import { useToast } from "../contexts/ToastContext";
import DynamicTabs from "../components/DynamicTabs";
import SizeGenerator from "../components/SizeGenerator";
import { useFormDirty } from "../hooks/useFormDirty";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchableSelect from "../components/SearchableSelect";
import LoadingSpinner from "../components/LoadingSpinner";
import SkeletonLoader from "../components/SkeletonLoader";
import ProductTabsInvoice from "../components/ProductTabsInvoice";
import GroupedProductVariants from "../components/GroupedProductVariants";

const PurchaseInvoices = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [tabs, setTabs] = useState([
    {
      label: "Sản phẩm 1",
      data: {
        invoice_number: "",
        supplier_id: "",
        invoice_date: new Date().toISOString().split("T")[0],
        notes: "",
        items: [
          {
            product_id: "",
            name: "",
            price: "",
            category_id: "",
            image_url: "",
            brand: "",
            color: "",
            variants: [{ size: "", quantity: "", unit_cost: "" }],
          },
        ],
      },
    },
  ]);

  const [filters, setFilters] = useState({
    invoiceNumber: "",
    supplier: "",
    dateFrom: "",
    dateTo: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Cache cho pagination
  const [pageCache, setPageCache] = useState({});

  // Accordion state - track which dates are expanded
  const [expandedDates, setExpandedDates] = useState({});

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Check if current tab has changes
  const initialTabData = {
    invoice_number: "",
    supplier_id: "",
    invoice_date: new Date().toISOString().split("T")[0],
    notes: "",
    items: [
      {
        product_id: "",
        name: "",
        price: "",
        category_id: "",
        image_url: "",
        brand: "",
        color: "",
        variants: [{ size: "", quantity: "", unit_cost: "" }],
      },
    ],
  };
  const isDirty = useFormDirty(
    tabs[activeTabIndex]?.data || initialTabData,
    initialTabData
  );

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, itemsPerPage]);

  const generateInvoiceNumber = async () => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const prefix = `PN${dateStr}`;

      // Lấy tất cả hóa đơn nhập trong ngày hôm nay
      const response = await purchaseInvoicesAPI.getAll({ limit: 1000 });
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
      return `PN${dateStr}-001`;
    }
  };

  const handleImageFileChange = (tabIndex, itemIndex, file) => {
    const newTabs = [...tabs];

    if (!file) {
      newTabs[tabIndex].data.items[itemIndex].image_url = "";
      setTabs(newTabs);
      return;
    }

    // Resize và compress ảnh trước khi convert sang base64
    const maxWidth = 800;
    const maxHeight = 800;
    const maxSizeKB = 200; // Giới hạn 200KB
    const quality = 0.7; // Chất lượng JPEG

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính toán kích thước mới
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Tạo canvas để resize
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert sang base64 với chất lượng nén
        let base64 = canvas.toDataURL("image/jpeg", quality);

        // Nếu vẫn quá lớn, giảm chất lượng thêm
        while (base64.length > maxSizeKB * 1024 && quality > 0.3) {
          const newQuality = quality - 0.1;
          base64 = canvas.toDataURL("image/jpeg", newQuality);
        }

        const updatedTabs = [...newTabs];
        updatedTabs[tabIndex].data.items[itemIndex].image_url = base64;
        setTabs(updatedTabs);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

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

      const response = await purchaseInvoicesAPI.getAll({ 
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
      showToast("Không thể tải danh sách hóa đơn nhập", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      // API trả về array trực tiếp
      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      showToast("Không thể tải danh sách nhà cung cấp", "error");
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

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      // API trả về array trực tiếp
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
      alert("Không thể tải chi tiết hóa đơn");
    }
  };

  const handleAddTab = async () => {
    try {
      // Gọi API để lấy số hóa đơn tiếp theo từ backend
      const response = await purchaseInvoicesAPI.getNextInvoiceNumber();
      const newInvoiceNumber = response.data.invoice_number;
      
      setTabs([
        ...tabs,
        {
          label: `Sản phẩm ${tabs.length + 1}`,
          data: {
            invoice_number: newInvoiceNumber,
            supplier_id: "",
            invoice_date: new Date().toISOString().split("T")[0],
            notes: "",
            items: [
              {
                product_id: "",
                name: "",
                price: "",
                category_id: "",
                image_url: "",
                brand: "",
                color: "",
                variants: [{ size: "", quantity: "", unit_cost: "" }],
              },
            ],
          },
        },
      ]);
    } catch (error) {
      // Fallback nếu API lỗi
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
      
      const fallbackNumber = `PN${dateStr}-${String(nextNum).padStart(3, "0")}`;
      
      setTabs([
        ...tabs,
        {
          label: `Sản phẩm ${tabs.length + 1}`,
          data: {
            invoice_number: fallbackNumber,
            supplier_id: "",
            invoice_date: new Date().toISOString().split("T")[0],
            notes: "",
            items: [
              {
                product_id: "",
                name: "",
                price: "",
                category_id: "",
                image_url: "",
                brand: "",
                color: "",
                variants: [{ size: "", quantity: "", unit_cost: "" }],
              },
            ],
          },
        },
      ]);
    }
  };

  const handleTabClose = (index) => {
    if (tabs.length > 1) {
      setTabs(tabs.filter((_, i) => i !== index));
    }
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };

  const handleAddItem = (tabIndex) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items.push({
      product_id: "",
      name: "",
      price: "",
      category_id: "",
      image_url: "",
      brand: "",
      color: "",
      variants: [{ size: "", quantity: "", unit_cost: "" }],
    });
    setTabs(newTabs);
  };

  const handleAddVariant = (tabIndex, itemIndex) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items[itemIndex].variants.push({
      size: "",
      quantity: "",
      unit_cost: "",
    });
    setTabs(newTabs);
  };

  const handleRemoveVariant = (tabIndex, itemIndex, variantIndex) => {
    const newTabs = [...tabs];
    if (newTabs[tabIndex].data.items[itemIndex].variants.length > 1) {
      newTabs[tabIndex].data.items[itemIndex].variants = newTabs[
        tabIndex
      ].data.items[itemIndex].variants.filter((_, i) => i !== variantIndex);
      setTabs(newTabs);
    }
  };

  const handleVariantChange = (
    tabIndex,
    itemIndex,
    variantIndex,
    field,
    value
  ) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items[itemIndex].variants[variantIndex][field] =
      value;
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
    // Nếu chọn sản phẩm có sẵn, load thông tin sản phẩm
    if (field === "product_id" && value) {
      const product = products.find((p) => p.id === parseInt(value));
      if (product) {
        newTabs[tabIndex].data.items[itemIndex].name = product.name;
        newTabs[tabIndex].data.items[itemIndex].price = product.price;
        newTabs[tabIndex].data.items[itemIndex].category_id =
          product.category?.id || product.category_id;
        newTabs[tabIndex].data.items[itemIndex].image_url =
          product.image_url || "";
        newTabs[tabIndex].data.items[itemIndex].brand = product.brand || "";
        newTabs[tabIndex].data.items[itemIndex].color = product.color || "";
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
      const items = [];

      // Chuyển đổi từ cấu trúc variants sang items cho API
      tabData.items.forEach((item) => {
        if (item.product_id) {
          // Sản phẩm đã tồn tại - tạo một item cho mỗi variant
          item.variants.forEach((variant) => {
            items.push({
              product_id: parseInt(item.product_id),
              quantity: parseInt(variant.quantity),
              unit_cost: parseFloat(variant.unit_cost),
              size: variant.size || null,
            });
          });
        } else {
          // Sản phẩm mới - tạo một item cho mỗi variant
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

      // Xóa tab đã submit thành công
      const newTabs = tabs.filter((_, i) => i !== tabIndex);
      if (newTabs.length === 0) {
        // Nếu không còn tab nào, đóng modal và reset
        setShowModal(false);
        setTabs([
          {
            label: "Sản phẩm 1",
            data: {
              invoice_number: "",
              supplier_id: "",
              invoice_date: new Date().toISOString().split("T")[0],
              notes: "",
              items: [
                {
                  product_id: "",
                  name: "",
                  price: "",
                  category_id: "",
                  image_url: "",
                  brand: "",
                  color: "",
                  variants: [{ size: "", quantity: "", unit_cost: "" }],
                },
              ],
            },
          },
        ]);
        setActiveTabIndex(0);
      } else {
        setTabs(newTabs);
        // Điều chỉnh activeTabIndex nếu cần
        if (activeTabIndex >= newTabs.length) {
          setActiveTabIndex(Math.max(0, newTabs.length - 1));
        } else if (activeTabIndex > tabIndex) {
          setActiveTabIndex(activeTabIndex - 1);
        }
      }
      
      // Xóa cache vì dữ liệu đã thay đổi
      setPageCache({});
      fetchInvoices();
      // Refresh danh sách sản phẩm
      window.dispatchEvent(new Event("products-updated"));
      showToast("Tạo hóa đơn nhập thành công!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  // Tạo tất cả hóa đơn cùng lúc
  const handleSubmitAll = async () => {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < tabs.length; i++) {
      try {
        const tabData = tabs[i].data;
        const items = [];

        // Chuyển đổi từ cấu trúc variants sang items cho API
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

        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`${tabs[i].label}: ${error.response?.data?.message || "Lỗi không xác định"}`);
      }
    }

    // Đóng modal và reset
    setShowModal(false);
    setTabs([
      {
        label: "Sản phẩm 1",
        data: {
          invoice_number: "",
          supplier_id: "",
          invoice_date: new Date().toISOString().split("T")[0],
          notes: "",
          items: [
            {
              product_id: "",
              name: "",
              price: "",
              category_id: "",
              image_url: "",
              brand: "",
              color: "",
              variants: [{ size: "", quantity: "", unit_cost: "" }],
            },
          ],
        },
      },
    ]);
    setActiveTabIndex(0);
    
    // Xóa cache vì dữ liệu đã thay đổi
    setPageCache({});
    // Reset về trang 1 để thấy hóa đơn mới
    setCurrentPage(1);
    // Force refresh để bỏ qua cache
    await fetchInvoices(true);
    window.dispatchEvent(new Event("products-updated"));

    // Hiển thị kết quả
    if (errorCount === 0) {
      showToast(`Tạo thành công ${successCount} hóa đơn!`, "success");
    } else if (successCount === 0) {
      showToast(`Tất cả ${errorCount} hóa đơn đều thất bại!`, "error");
    } else {
      showToast(
        `Tạo thành công ${successCount} hóa đơn, thất bại ${errorCount} hóa đơn. ${errors.join("; ")}`,
        "warning"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return;
    try {
      await purchaseInvoicesAPI.delete(id);
      showToast("Xóa hóa đơn nhập thành công!", "success");
      
      // Xóa cache vì dữ liệu đã thay đổi
      setPageCache({});
      // Force refresh để bỏ qua cache
      await fetchInvoices(true);
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesInvoiceNumber = filters.invoiceNumber
      ? invoice.invoice_number
          ?.toLowerCase()
          .includes(filters.invoiceNumber.toLowerCase())
      : true;

    const supplierName = invoice.supplier_name || "";
    const matchesSupplier = filters.supplier
      ? supplierName.toLowerCase().includes(filters.supplier.toLowerCase())
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
      matchesSupplier &&
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
          totalCost: 0,
          totalProducts: 0,
        };
      }
      
      groups[dateKey].invoices.push(invoice);
      groups[dateKey].totalCost += parseFloat(invoice.total_cost) || 0;
      
      // Đếm tổng số sản phẩm (từ items nếu có)
      if (invoice.items && Array.isArray(invoice.items)) {
        groups[dateKey].totalProducts += invoice.items.reduce((sum, item) => {
          return sum + (parseInt(item.quantity) || 0);
        }, 0);
      }
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

  const resetAllTabs = async () => {
    try {
      // Gọi API để lấy số hóa đơn tiếp theo từ backend
      const response = await purchaseInvoicesAPI.getNextInvoiceNumber();
      const invoiceNumber = response.data.invoice_number;
      
      setTabs([
        {
          label: "Sản phẩm 1",
          data: {
            invoice_number: invoiceNumber,
            supplier_id: "",
            invoice_date: new Date().toISOString().split("T")[0],
            notes: "",
            items: [
              {
                product_id: "",
                name: "",
                price: "",
                category_id: "",
                image_url: "",
                brand: "",
                color: "",
                variants: [{ size: "", quantity: "", unit_cost: "" }],
              },
            ],
          },
        },
      ]);
      setActiveTabIndex(0);
    } catch (error) {
      // Fallback nếu API lỗi
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const fallbackNumber = `PN${dateStr}-001`;
      
      setTabs([
        {
          label: "Sản phẩm 1",
          data: {
            invoice_number: fallbackNumber,
            supplier_id: "",
            invoice_date: new Date().toISOString().split("T")[0],
            notes: "",
            items: [
              {
                product_id: "",
                name: "",
                price: "",
                category_id: "",
                image_url: "",
                brand: "",
                color: "",
                variants: [{ size: "", quantity: "", unit_cost: "" }],
              },
            ],
          },
        },
      ]);
      setActiveTabIndex(0);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showModal && !showConfirmDialog) {
        handleCloseModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, showConfirmDialog, isDirty]);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hóa đơn nhập hàng</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              setLoading(true);
              setPageCache({});
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

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">
            Bộ lọc hóa đơn nhập hàng
          </h3>
          <button
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() =>
              setFilters({
                invoiceNumber: "",
                supplier: "",
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
              Nhà cung cấp
            </label>
            <input
              type="text"
              value={filters.supplier}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  supplier: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Tên nhà cung cấp"
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
                          {new Intl.NumberFormat("vi-VN").format(group.totalCost)} ₫
                        </span>
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
                          Nhà cung cấp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ngày
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
                            {invoice.supplier_name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.invoice_date).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invoice.updated_at
                              ? new Date(invoice.updated_at).toLocaleDateString("vi-VN")
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat("vi-VN").format(invoice.total_cost)} đ
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewDetail(invoice.id)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(invoice.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={18} />
                            </button>
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
                        Nhà cung cấp *
                      </label>
                      <select
                        required
                        value={tab.data.supplier_id}
                        onChange={(e) =>
                          handleTabDataChange(
                            tabIndex,
                            "supplier_id",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn nhà cung cấp</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
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
                          handleTabDataChange(
                            tabIndex,
                            "invoice_date",
                            e.target.value
                          )
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
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Sản phẩm *
                      </label>
                      <ProductTabsInvoice
                        items={tab.data.items}
                        tabIndex={tabIndex}
                        products={products}
                        categories={categories}
                        handleItemChange={handleItemChange}
                        handleImageFileChange={handleImageFileChange}
                        handleAddVariant={handleAddVariant}
                        handleRemoveVariant={handleRemoveVariant}
                        handleVariantChange={handleVariantChange}
                        tabs={tabs}
                        setTabs={setTabs}
                      />
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div>
                      {tabs.length > 1 && (
                        <button
                          type="button"
                          onClick={handleSubmitAll}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                          <Plus size={18} />
                          <span>Tạo tất cả {tabs.length} hóa đơn</span>
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setTabs([
                            {
                              label: "Sản phẩm 1",
                              data: {
                                invoice_number: "",
                                supplier_id: "",
                                invoice_date: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                notes: "",
                                items: [
                                  {
                                    product_id: "",
                                    name: "",
                                    price: "",
                                    category_id: "",
                                    image_url: "",
                                    brand: "",
                                    color: "",
                                    variants: [
                                      { size: "", quantity: "", unit_cost: "" },
                                    ],
                                  },
                                ],
                              },
                            },
                          ]);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Hủy (ESC)
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Tạo hóa đơn này
                      </button>
                    </div>
                  </div>
                </form>
              )}
            />
          </div>
        </div>
      )}

      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Chi tiết hóa đơn nhập</h2>
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
                  <p className="text-sm text-gray-600">Nhà cung cấp</p>
                  <p className="font-medium">{selectedInvoice.supplier_name}</p>
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
                      selectedInvoice.total_cost
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
                 <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Chi tiết sản phẩm
                    </h3>
                    <GroupedProductVariants items={selectedInvoice.items} />
                 </div>
                </div>
              )}
            </div>
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
    </div>
  );
};

export default PurchaseInvoices;
