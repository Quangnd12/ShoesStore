import { useState, useEffect, useMemo } from 'react';
import { salesInvoicesAPI, productsAPI, returnExchangesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useFormDirty } from './useFormDirty';

export const useSalesInvoice = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoiceForReturn, setSelectedInvoiceForReturn] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

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

  const [returnForm, setReturnForm] = useState({
    type: "return",
    reason: "",
    notes: "",
    sales_invoice_id: null,
    item: {
      sales_invoice_item_id: "",
      quantity: "",
      max_quantity: "",
      new_product_id: "",
      new_unit_price: "",
      new_size: "",
    },
  });

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

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleViewDetail = async (id) => {
    try {
      const response = await salesInvoicesAPI.getById(id);
      setSelectedInvoice(response.data);
      setShowDetailModal(true);
    } catch (error) {
      showToast("Không thể tải chi tiết hóa đơn", "error");
    }
  };

  const handleAddTab = async () => {
    try {
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
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const fallbackNumber = `HD${dateStr}-${String(tabs.length + 1).padStart(3, "0")}`;
      
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
        customer_name: tabData.customer_name || null,
        customer_phone: tabData.customer_phone || null,
        customer_email: tabData.customer_email || null,
        notes: tabData.notes || null,
        items,
      });

      showToast("Tạo hóa đơn bán hàng thành công!", "success");
      
      const newTabs = tabs.filter((_, i) => i !== tabIndex);
      if (newTabs.length === 0) {
        setShowModal(false);
        await resetAllTabs();
      } else {
        setTabs(newTabs);
        if (activeTabIndex === tabIndex) {
          setActiveTabIndex(Math.max(0, tabIndex - 1));
        } else if (activeTabIndex > tabIndex) {
          setActiveTabIndex(activeTabIndex - 1);
        }
      }
      
      // Trigger refresh of invoice list
      window.dispatchEvent(new Event("invoices-updated"));
      await fetchProducts();
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const handleOpenReturnModal = async (invoiceId) => {
    try {
      const response = await salesInvoicesAPI.getById(invoiceId);
      setSelectedInvoiceForReturn(response.data);
      
      // Find first item with quantity > 0
      const firstValidItem = response.data.items?.find(item => item.quantity > 0);
      
      setReturnForm({
        type: "return",
        reason: "",
        notes: "",
        sales_invoice_id: invoiceId,
        item: {
          sales_invoice_item_id: firstValidItem ? firstValidItem.id : "",
          quantity: firstValidItem ? "1" : "",
          max_quantity: firstValidItem ? firstValidItem.quantity.toString() : "",
          new_product_id: "",
          new_unit_price: "",
          new_size: "",
        },
      });
      setShowReturnModal(true);
    } catch (error) {
      showToast("Không thể tải dữ liệu hóa đơn để tạo hoàn trả/đổi", "error");
    }
  };

  const handleReturnFormChange = (field, value) => {
    setReturnForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
            new_size:
              returnForm.type === "exchange" && returnForm.item.new_size
                ? returnForm.item.new_size
                : undefined,
          },
        ],
      };

      await returnExchangesAPI.create(payload);
      showToast("Tạo yêu cầu hoàn trả/đổi hàng thành công!", "success");
      setShowReturnModal(false);
      setSelectedInvoiceForReturn(null);
      
      // Trigger refresh of invoice list and products
      window.dispatchEvent(new Event("invoices-updated"));
      await fetchProducts();
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Không thể tạo yêu cầu hoàn trả/đổi hàng",
        "error"
      );
    }
  };

  const resetAllTabs = async () => {
    try {
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

  return {
    // Data
    products,
    tabs,
    selectedInvoice,
    selectedInvoiceForReturn,
    returnForm,
    activeTabIndex,
    isDirty,
    
    // UI State
    showModal,
    showDetailModal,
    showReturnModal,
    showExportModal,
    showConfirmDialog,
    
    // Actions
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
  };
};