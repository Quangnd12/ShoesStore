import { useState, useEffect } from "react";
import { Plus, Trash2, Eye, X } from "lucide-react";
import {
  purchaseInvoicesAPI,
  suppliersAPI,
  productsAPI,
  categoriesAPI,
} from "../services/api";
import { useToast } from "../contexts/ToastContext";
import DynamicTabs from "../components/DynamicTabs";

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

  useEffect(() => {
    fetchInvoices();
    fetchSuppliers();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await purchaseInvoicesAPI.getAll({ limit: 100 });
      // API trả về { invoices: [...], ... } trong response.data
      setInvoices(response.data?.invoices || []);
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

  const handleAddTab = () => {
    setTabs([
      ...tabs,
      {
        label: `Sản phẩm ${tabs.length + 1}`,
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
  };

  const handleTabClose = (index) => {
    if (tabs.length > 1) {
      setTabs(tabs.filter((_, i) => i !== index));
    }
  };

  const handleTabChange = (index) => {
    // Tab changed
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
      fetchInvoices();
      // Refresh danh sách sản phẩm
      window.dispatchEvent(new Event("products-updated"));
      showToast("Tạo hóa đơn nhập thành công!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return;
    try {
      await purchaseInvoicesAPI.delete(id);
      showToast("Xóa hóa đơn nhập thành công!", "success");
      fetchInvoices();
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showModal) {
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
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hóa đơn nhập hàng</h1>
        <button
          onClick={() => {
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
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>Thêm hóa đơn nhập</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
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

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
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
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Thêm hóa đơn nhập hàng</h2>
              <button
                onClick={() => {
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
                            variants: [
                              { size: "", quantity: "", unit_cost: "" },
                            ],
                          },
                        ],
                      },
                    },
                  ]);
                }}
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
                    {tab.data.items.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 mb-3"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Sản phẩm {index + 1}
                          </span>
                          {tab.data.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(tabIndex, index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Xóa sản phẩm
                            </button>
                          )}
                        </div>

                        {/* Thông tin chung của sản phẩm */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Chọn sản phẩm có sẵn (hoặc để trống để tạo mới)
                            </label>
                            <select
                              value={item.product_id}
                              onChange={(e) =>
                                handleItemChange(
                                  tabIndex,
                                  index,
                                  "product_id",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">-- Tạo sản phẩm mới --</option>
                              {Array.isArray(products) &&
                                products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} - Size:{" "}
                                    {product.size || "N/A"}
                                  </option>
                                ))}
                            </select>
                          </div>
                          {!item.product_id && (
                            <>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Tên sản phẩm *
                                </label>
                                <input
                                  type="text"
                                  required={!item.product_id}
                                  value={item.name}
                                  onChange={(e) =>
                                    handleItemChange(
                                      tabIndex,
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Danh mục *
                                </label>
                                <select
                                  required={!item.product_id}
                                  value={item.category_id}
                                  onChange={(e) =>
                                    handleItemChange(
                                      tabIndex,
                                      index,
                                      "category_id",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                  <option value="">Chọn danh mục</option>
                                  {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Giá bán *
                                </label>
                                <input
                                  type="number"
                                  required={!item.product_id}
                                  value={item.price}
                                  onChange={(e) =>
                                    handleItemChange(
                                      tabIndex,
                                      index,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Thương hiệu
                                </label>
                                <input
                                  type="text"
                                  value={item.brand || ""}
                                  onChange={(e) =>
                                    handleItemChange(
                                      tabIndex,
                                      index,
                                      "brand",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Màu sắc
                                </label>
                                <input
                                  type="text"
                                  value={item.color || ""}
                                  onChange={(e) =>
                                    handleItemChange(
                                      tabIndex,
                                      index,
                                      "color",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  URL hình ảnh
                                </label>
                                <input
                                  type="url"
                                  value={item.image_url || ""}
                                  onChange={(e) =>
                                    handleItemChange(
                                      tabIndex,
                                      index,
                                      "image_url",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {/* Variants (nhiều size) */}
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Biến thể (Size) *
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddVariant(tabIndex, index)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Thêm size
                            </button>
                          </div>
                          {item.variants &&
                            item.variants.map((variant, variantIndex) => (
                              <div
                                key={variantIndex}
                                className="grid grid-cols-3 gap-3 mb-2 p-2 bg-gray-50 rounded"
                              >
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Size *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={variant.size}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        tabIndex,
                                        index,
                                        variantIndex,
                                        "size",
                                        e.target.value
                                      )
                                    }
                                    placeholder="VD: 36, 37, 38"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
                                    value={variant.quantity}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        tabIndex,
                                        index,
                                        variantIndex,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                </div>
                                <div className="flex items-end gap-2">
                                  <div className="flex-1">
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Giá nhập (đơn vị) *
                                    </label>
                                    <input
                                      type="number"
                                      required
                                      min="0"
                                      step="0.01"
                                      value={variant.unit_cost}
                                      onChange={(e) =>
                                        handleVariantChange(
                                          tabIndex,
                                          index,
                                          variantIndex,
                                          "unit_cost",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                  </div>
                                  {item.variants.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveVariant(
                                          tabIndex,
                                          index,
                                          variantIndex
                                        )
                                      }
                                      className="text-red-600 hover:text-red-800 text-sm px-2 py-2"
                                      title="Xóa size"
                                    >
                                      X
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
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
                      Tạo hóa đơn
                    </button>
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
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Chi tiết sản phẩm</h3>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                          <td className="px-4 py-2 text-sm">
                            {item.product_name}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.size_eu || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">
                            {new Intl.NumberFormat("vi-VN").format(
                              item.unit_cost
                            )}{" "}
                            đ
                          </td>
                          <td className="px-4 py-2 text-sm font-medium">
                            {new Intl.NumberFormat("vi-VN").format(
                              item.total_cost
                            )}{" "}
                            đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoices;
