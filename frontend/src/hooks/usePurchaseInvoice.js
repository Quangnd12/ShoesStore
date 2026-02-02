import { useState, useEffect } from 'react';
import { purchaseInvoicesAPI, suppliersAPI, productsAPI, categoriesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useFormDirty } from './useFormDirty';

export const usePurchaseInvoice = () => {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

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

  const handleAddTab = async () => {
    try {
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
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const fallbackNumber = `PN${dateStr}-${String(tabs.length + 1).padStart(3, "0")}`;
      
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

  const handleTabDataChange = (tabIndex, field, value) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data[field] = value;
    setTabs(newTabs);
  };

  const handleItemChange = (tabIndex, itemIndex, field, value) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items[itemIndex][field] = value;
    
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

  const handleImageFileChange = (tabIndex, itemIndex, file, colorIndex = null) => {
    const newTabs = [...tabs];

    if (!file) {
      if (colorIndex !== null && newTabs[tabIndex].data.items[itemIndex].colorVariants) {
        // Xóa hình ảnh của màu cụ thể
        newTabs[tabIndex].data.items[itemIndex].colorVariants[colorIndex].image = "";
        newTabs[tabIndex].data.items[itemIndex].colorVariants[colorIndex].image_file = null;
      } else {
        newTabs[tabIndex].data.items[itemIndex].image_url = "";
      }
      setTabs(newTabs);
      return;
    }

    const maxWidth = 800;
    const maxHeight = 800;
    const maxSizeKB = 200;
    const quality = 0.7;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let base64 = canvas.toDataURL("image/jpeg", quality);
        let currentQuality = quality;

        while (base64.length > maxSizeKB * 1024 && currentQuality > 0.3) {
          currentQuality = currentQuality - 0.1;
          base64 = canvas.toDataURL("image/jpeg", currentQuality);
        }

        const updatedTabs = [...newTabs];
        
        if (colorIndex !== null && updatedTabs[tabIndex].data.items[itemIndex].colorVariants) {
          // Cập nhật hình ảnh cho màu cụ thể
          updatedTabs[tabIndex].data.items[itemIndex].colorVariants[colorIndex].image = base64;
          updatedTabs[tabIndex].data.items[itemIndex].colorVariants[colorIndex].image_file = file;
        } else {
          // Cập nhật hình ảnh chung của sản phẩm
          updatedTabs[tabIndex].data.items[itemIndex].image_url = base64;
        }
        
        setTabs(updatedTabs);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
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

  const handleVariantChange = (tabIndex, itemIndex, variantIndex, field, value) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items[itemIndex].variants[variantIndex][field] = value;
    setTabs(newTabs);
  };

  const handleSubmit = async (e, tabIndex) => {
    e.preventDefault();
    try {
      const tabData = tabs[tabIndex].data;
      const items = [];

      // Chuyển đổi từ cấu trúc colorVariants/variants sang items cho API
      tabData.items.forEach((item) => {
        // Ưu tiên sử dụng colorVariants nếu có
        if (item.colorVariants && item.colorVariants.length > 0) {
          item.colorVariants.forEach((colorVariant) => {
            // Mỗi màu sắc = 1 sản phẩm riêng biệt
            const hasMultipleColors = item.colorVariants.length > 1;
            const productNameWithColor = hasMultipleColors && colorVariant.color 
              ? `${item.name} - ${colorVariant.color}`
              : item.name;
            
            colorVariant.sizes?.forEach((sizeData) => {
              if (item.product_id) {
                // Sản phẩm đã tồn tại
                items.push({
                  product_id: parseInt(item.product_id),
                  quantity: parseInt(sizeData.quantity) || 0,
                  unit_cost: parseFloat(sizeData.unit_cost) || 0,
                  size: sizeData.size || null,
                  color: colorVariant.color || null,
                  image_url: colorVariant.image || null,
                });
              } else {
                // Sản phẩm mới - mỗi màu là 1 sản phẩm riêng
                items.push({
                  name: productNameWithColor,
                  price: parseFloat(item.price) || 0,
                  category_id: parseInt(item.category_id),
                  quantity: parseInt(sizeData.quantity) || 0,
                  unit_cost: parseFloat(sizeData.unit_cost) || 0,
                  size: sizeData.size || null,
                  image_url: colorVariant.image || item.image_url || null,
                  brand: item.brand || null,
                  color: colorVariant.color || null,
                });
              }
            });
          });
        } else if (item.variants && item.variants.length > 0) {
          // Fallback: sử dụng cấu trúc variants cũ
          item.variants.forEach((variant) => {
            if (item.product_id) {
              items.push({
                product_id: parseInt(item.product_id),
                quantity: parseInt(variant.quantity) || 0,
                unit_cost: parseFloat(variant.unit_cost) || 0,
                size: variant.size || null,
                color: variant.color || item.color || null,
                image_url: variant.image_url || item.image_url || null,
              });
            } else {
              items.push({
                name: item.name,
                price: parseFloat(item.price) || 0,
                category_id: parseInt(item.category_id),
                quantity: parseInt(variant.quantity) || 0,
                unit_cost: parseFloat(variant.unit_cost) || 0,
                size: variant.size || null,
                image_url: variant.image_url || item.image_url || null,
                brand: item.brand || null,
                color: variant.color || item.color || null,
              });
            }
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

      const newTabs = tabs.filter((_, i) => i !== tabIndex);
      if (newTabs.length === 0) {
        setShowModal(false);
        await resetAllTabs();
      } else {
        setTabs(newTabs);
        if (activeTabIndex >= newTabs.length) {
          setActiveTabIndex(Math.max(0, newTabs.length - 1));
        } else if (activeTabIndex > tabIndex) {
          setActiveTabIndex(activeTabIndex - 1);
        }
      }
      
      window.dispatchEvent(new Event("products-updated"));
      showToast("Tạo hóa đơn nhập thành công!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const handleSubmitAll = async () => {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < tabs.length; i++) {
      try {
        const tabData = tabs[i].data;
        const items = [];

        // Chuyển đổi từ cấu trúc colorVariants/variants sang items cho API
        tabData.items.forEach((item) => {
          // Ưu tiên sử dụng colorVariants nếu có
          if (item.colorVariants && item.colorVariants.length > 0) {
            item.colorVariants.forEach((colorVariant) => {
              const hasMultipleColors = item.colorVariants.length > 1;
              const productNameWithColor = hasMultipleColors && colorVariant.color 
                ? `${item.name} - ${colorVariant.color}`
                : item.name;
              
              colorVariant.sizes?.forEach((sizeData) => {
                if (item.product_id) {
                  items.push({
                    product_id: parseInt(item.product_id),
                    quantity: parseInt(sizeData.quantity) || 0,
                    unit_cost: parseFloat(sizeData.unit_cost) || 0,
                    size: sizeData.size || null,
                    color: colorVariant.color || null,
                    image_url: colorVariant.image || null,
                  });
                } else {
                  items.push({
                    name: productNameWithColor,
                    price: parseFloat(item.price) || 0,
                    category_id: parseInt(item.category_id),
                    quantity: parseInt(sizeData.quantity) || 0,
                    unit_cost: parseFloat(sizeData.unit_cost) || 0,
                    size: sizeData.size || null,
                    image_url: colorVariant.image || item.image_url || null,
                    brand: item.brand || null,
                    color: colorVariant.color || null,
                  });
                }
              });
            });
          } else if (item.variants && item.variants.length > 0) {
            item.variants.forEach((variant) => {
              if (item.product_id) {
                items.push({
                  product_id: parseInt(item.product_id),
                  quantity: parseInt(variant.quantity) || 0,
                  unit_cost: parseFloat(variant.unit_cost) || 0,
                  size: variant.size || null,
                  color: variant.color || item.color || null,
                  image_url: variant.image_url || item.image_url || null,
                });
              } else {
                items.push({
                  name: item.name,
                  price: parseFloat(item.price) || 0,
                  category_id: parseInt(item.category_id),
                  quantity: parseInt(variant.quantity) || 0,
                  unit_cost: parseFloat(variant.unit_cost) || 0,
                  size: variant.size || null,
                  image_url: variant.image_url || item.image_url || null,
                  brand: item.brand || null,
                  color: variant.color || item.color || null,
                });
              }
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

    setShowModal(false);
    await resetAllTabs();
    window.dispatchEvent(new Event("products-updated"));

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

  const handleImportExcel = async (invoicesData) => {
    try {
      const response = await purchaseInvoicesAPI.import(invoicesData);
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

  const resetAllTabs = async () => {
    try {
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
    suppliers,
    products,
    categories,
    tabs,
    selectedInvoice,
    activeTabIndex,
    isDirty,
    
    // UI State
    showModal,
    showDetailModal,
    showImportModal,
    showConfirmDialog,
    
    // Actions
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
  };
};