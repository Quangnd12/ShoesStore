import { useState, useEffect } from "react";
import { Plus, Eye, Edit } from "lucide-react";
import {
  salesInvoicesAPI,
  productsAPI,
  returnExchangesAPI,
} from "../services/api";
import { useToast } from "../contexts/ToastContext";

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
  const [formData, setFormData] = useState({
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    notes: "",
    items: [{ product_id: "", quantity: "", unit_price: "" }],
  });

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

  useEffect(() => {
    fetchInvoices();
    fetchProducts();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await salesInvoicesAPI.getAll({ limit: 100 });
      // API trả về { invoices: [...], ... } trong response.data
      setInvoices(response.data?.invoices || []);
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

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { product_id: "", quantity: "", unit_price: "" },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Auto-fill unit_price from product if not set
    if (field === "product_id" && value) {
      const product = products.find((p) => p.id === parseInt(value));
      if (product && !newItems[index].unit_price) {
        newItems[index].unit_price = product.price;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const items = formData.items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        unit_price: item.unit_price ? parseFloat(item.unit_price) : undefined,
      }));

      await salesInvoicesAPI.create({
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        customer_name: formData.customer_name || null,
        customer_phone: formData.customer_phone || null,
        customer_email: formData.customer_email || null,
        notes: formData.notes || null,
        items,
      });

      setShowModal(false);
      await resetForm();
      await fetchInvoices();
      await fetchProducts();
      showToast("Tạo hóa đơn bán hàng thành công!", "success");
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

  const resetForm = async () => {
    const invoiceNumber = await generateInvoiceNumber();
    setFormData({
      invoice_number: invoiceNumber,
      invoice_date: new Date().toISOString().split("T")[0],
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      notes: "",
      items: [{ product_id: "", quantity: "", unit_price: "" }],
    });
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

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hóa đơn bán hàng</h1>
        <button
          onClick={async () => {
            await resetForm();
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
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
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.invoice_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.customer_name || invoice.account_username || "-"}
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
                  {new Intl.NumberFormat("vi-VN").format(invoice.total_revenue)}{" "}
                  đ
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Thêm hóa đơn bán hàng</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số hóa đơn *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoice_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoice_number: e.target.value,
                      })
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
                    value={formData.invoice_date}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_date: e.target.value })
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
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_name: e.target.value,
                      })
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
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_phone: e.target.value,
                      })
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
                    value={formData.customer_email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_email: e.target.value,
                      })
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
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
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
                    onClick={handleAddItem}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Thêm sản phẩm
                  </button>
                </div>
                {formData.items.map((item, index) => {
                  const selectedProduct = Array.isArray(products)
                    ? products.find((p) => p.id === parseInt(item.product_id))
                    : null;
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 mb-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Sản phẩm {index + 1}
                        </span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Sản phẩm *
                          </label>
                          <select
                            required
                            value={item.product_id}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "product_id",
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
                                    {product.name} - Size:{" "}
                                    {product.size || "N/A"} (Còn:{" "}
                                    {product.stock_quantity})
                                  </option>
                                ))}
                          </select>
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
                  onClick={async () => {
                    setShowModal(false);
                    await resetForm();
                  }}
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
          </div>
        </div>
      )}

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
                    {selectedInvoiceForReturn.items?.map((item) => (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoices;
