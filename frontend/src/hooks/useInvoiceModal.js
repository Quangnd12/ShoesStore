import { useState, useEffect } from "react";
import { useFormDirty } from "./useFormDirty";

export const useInvoiceModal = (api, type = "purchase") => {
  const [showModal, setShowModal] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Initial tab data
  const getInitialTabData = () => {
    if (type === "purchase") {
      return {
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
    } else {
      return {
        invoice_number: "",
        invoice_date: new Date().toISOString().split("T")[0],
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        notes: "",
        items: [{ product_id: "", quantity: "", unit_price: "" }],
      };
    }
  };

  const initialTabData = getInitialTabData();
  const currentTabData = tabs[activeTabIndex]?.data || initialTabData;
  const isDirty = useFormDirty(currentTabData, initialTabData);

  const generateInvoiceNumber = async () => {
    try {
      const response = await api.getNextInvoiceNumber();
      return response.data.invoice_number;
    } catch (error) {
      // Fallback
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const prefix = type === "purchase" ? "PN" : "HD";
      return `${prefix}${dateStr}-001`;
    }
  };

  const resetAllTabs = async () => {
    try {
      const invoiceNumber = await generateInvoiceNumber();
      const newTabData = {
        ...initialTabData,
        invoice_number: invoiceNumber,
      };
      
      setTabs([
        {
          label: type === "purchase" ? "Sản phẩm 1" : "Hóa đơn 1",
          data: newTabData,
        },
      ]);
      setActiveTabIndex(0);
    } catch (error) {
      console.error("Error resetting tabs:", error);
      setTabs([
        {
          label: type === "purchase" ? "Sản phẩm 1" : "Hóa đơn 1",
          data: initialTabData,
        },
      ]);
      setActiveTabIndex(0);
    }
  };

  const handleAddTab = async () => {
    try {
      const invoiceNumber = await generateInvoiceNumber();
      const newTabData = {
        ...initialTabData,
        invoice_number: invoiceNumber,
      };
      
      setTabs([
        ...tabs,
        {
          label: type === "purchase" 
            ? `Sản phẩm ${tabs.length + 1}` 
            : `Hóa đơn ${tabs.length + 1}`,
          data: newTabData,
        },
      ]);
    } catch (error) {
      console.error("Error adding tab:", error);
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

  const handleTabDataChange = (tabIndex, field, value) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data[field] = value;
    setTabs(newTabs);
  };

  const handleItemChange = (tabIndex, itemIndex, field, value) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items[itemIndex][field] = value;
    setTabs(newTabs);
  };

  const handleAddItem = (tabIndex) => {
    const newTabs = [...tabs];
    if (type === "purchase") {
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
    } else {
      newTabs[tabIndex].data.items.push({
        product_id: "",
        quantity: "",
        unit_price: "",
      });
    }
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

  const openModal = async () => {
    await resetAllTabs();
    setShowModal(true);
  };

  // Initialize tabs when component mounts
  useEffect(() => {
    if (tabs.length === 0) {
      resetAllTabs();
    }
  }, []);

  return {
    showModal,
    setShowModal,
    tabs,
    setTabs,
    activeTabIndex,
    setActiveTabIndex,
    showConfirmDialog,
    setShowConfirmDialog,
    pendingAction,
    setPendingAction,
    isDirty,
    currentTabData,
    initialTabData,
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
    resetAllTabs,
  };
};