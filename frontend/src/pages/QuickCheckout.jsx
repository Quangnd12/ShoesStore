import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  Printer,
  X,
  Filter,
  Package,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { productsAPI, salesInvoicesAPI } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import CartItem from "../components/CartItem";

const QuickCheckout = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [draggedProduct, setDraggedProduct] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Categories collapse
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchNextInvoiceNumber();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ limit: 1000 });
      const productsData = response.data?.products || response.data || [];

      // Normalize products: flatten category object
      const normalizedProducts = (
        Array.isArray(productsData) ? productsData : []
      ).map((product) => ({
        ...product,
        category_name: product.category?.name || product.category_name || null,
        category_id: product.category?.id || product.category_id || null,
      }));

      setProducts(normalizedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Không thể tải danh sách sản phẩm", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await salesInvoicesAPI.getNextInvoiceNumber();
      setNextInvoiceNumber(response.data.invoice_number);
    } catch (error) {
      console.error("Error fetching invoice number:", error);
      // Fallback: generate local invoice number
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      setNextInvoiceNumber(`HD${dateStr}-001`);
    }
  };

  // Get categories with product count
  const categoriesWithCount = useMemo(() => {
    const counts = {};
    products.forEach((product) => {
      if (product.stock_quantity > 0) {
        const cat = product.category_name || "Chưa phân loại";
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    const allCount = Object.values(counts).reduce(
      (sum, count) => sum + count,
      0
    );

    // Sort categories by count (descending)
    const sortedCategories = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({
        name,
        label: name,
        count,
      }));

    return [
      { name: "all", label: "Tất cả", count: allCount },
      ...sortedCategories,
    ];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        product.category_name === selectedCategory;
      const hasStock = product.stock_quantity > 0;
      return matchesSearch && matchesCategory && hasStock;
    });
  }, [products, searchTerm, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Drag handlers
  const handleDragStart = (e, product) => {
    setDraggedProduct(product);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedProduct) {
      addToCart(draggedProduct);
      setDraggedProduct(null);
    }
  };

  // Cart operations
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        setCart(
          cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
        showToast("Đã tăng số lượng sản phẩm", "success");
      } else {
        showToast("Không đủ hàng trong kho", "error");
      }
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          unit_price: product.price,
        },
      ]);
      showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = products.find((p) => p.id === productId);
    if (newQuantity > product.stock_quantity) {
      showToast("Không đủ hàng trong kho", "error");
      return;
    }
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const updatePrice = (productId, newPrice) => {
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, unit_price: newPrice } : item
      )
    );
    showToast("Đã cập nhật giá sản phẩm", "success");
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
    showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
  };

  const clearCart = () => {
    setCart([]);
    setCustomerInfo({ name: "", phone: "", email: "" });
    fetchNextInvoiceNumber(); // Refresh invoice number for next order
  };

  // Calculate totals
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast("Giỏ hàng trống", "error");
      return;
    }

    try {
      // Bước 1: Lấy số hóa đơn tự động từ backend
      const invoiceNumberResponse =
        await salesInvoicesAPI.getNextInvoiceNumber();
      const invoiceNumber = invoiceNumberResponse.data.invoice_number;

      // Bước 2: Tạo hóa đơn với số hóa đơn đã lấy
      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const response = await salesInvoicesAPI.create({
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString().split("T")[0],
        customer_name: customerInfo.name || null,
        customer_phone: customerInfo.phone || null,
        customer_email: customerInfo.email || null,
        items,
      });

      showToast("Tạo hóa đơn thành công!", "success");

      // Prepare invoice data for printing
      setInvoiceData({
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString().split("T")[0],
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email,
        items: cart,
        total_revenue: response.data.total_revenue,
      });

      setShowPrintModal(true);
      clearCart();
      await fetchProducts(); // Refresh stock
    } catch (error) {
      showToast(
        error.response?.data?.message || "Không thể tạo hóa đơn",
        "error"
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Left: Product List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Thanh toán nhanh
              </h1>
            </div>
          </div>
          {/* Search and Filter */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {categoriesWithCount.length > 1 && (
              <div className="flex items-start gap-2">
                <Filter
                  size={16}
                  className="text-gray-500 flex-shrink-0 mt-1.5"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {(showAllCategories 
                      ? categoriesWithCount 
                      : categoriesWithCount.slice(0, 6)
                    ).map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                          selectedCategory === cat.name
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span
                          className={`text-xs ${
                            selectedCategory === cat.name
                              ? "text-blue-200"
                              : "text-gray-500"
                          }`}
                        >
                          ({cat.count})
                        </span>
                      </button>
                    ))}
                    
                    {categoriesWithCount.length > 6 && (
                      <button
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition flex items-center gap-1"
                      >
                        {showAllCategories ? (
                          <>
                            <span>Thu gọn</span>
                            <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            <span>Xem thêm ({categoriesWithCount.length - 6})</span>
                            <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDragStart={handleDragStart}
                  onAddToCart={addToCart}
                  isInCart={cart.some((item) => item.id === product.id)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Không tìm thấy sản phẩm nào</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>
                  Hiển thị{" "}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredProducts.length
                  )}{" "}
                  -{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredProducts.length
                  )}{" "}
                  / {filteredProducts.length}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={8}>8 / trang</option>
                  <option value={12}>12 / trang</option>
                  <option value={24}>24 / trang</option>
                  <option value={48}>48 / trang</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  ««
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  «
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  »
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Cart/Invoice Area */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-5 flex flex-col border border-gray-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={20} />
              Giỏ hàng ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Invoice Number */}
          <div className="mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">Số hóa đơn:</span>
              <span className="text-sm font-bold text-blue-600">{nextInvoiceNumber || "Đang tải..."}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-3 space-y-2">
            <input
              type="text"
              placeholder="Tên khách hàng"
              value={customerInfo.name}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, name: e.target.value })
              }
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={customerInfo.phone}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, phone: e.target.value })
              }
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-3 mb-3 transition-all ${
              draggedProduct
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="text-center">
              <Package
                size={24}
                className={`mx-auto mb-1 ${
                  draggedProduct ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <p className="text-xs text-gray-600">
                {draggedProduct ? "Thả vào đây" : "Kéo thả sản phẩm"}
              </p>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto mb-3 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart
                  size={32}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p className="text-sm">Chưa có sản phẩm</p>
              </div>
            ) : (
              cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onUpdatePrice={updatePrice}
                  onRemove={removeFromCart}
                />
              ))
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Số lượng:</span>
              <span className="font-semibold text-gray-900">{totalItems}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Tổng tiền:</span>
              <span className="text-xl font-bold text-blue-600">
                {new Intl.NumberFormat("vi-VN").format(totalAmount)}₫
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            <span>Thanh toán</span>
          </button>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && invoiceData && (
        <PrintInvoiceModal
          invoice={invoiceData}
          onClose={() => {
            setShowPrintModal(false);
            setInvoiceData(null);
          }}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
};

// Print Invoice Modal Component
const PrintInvoiceModal = ({ invoice, onClose, onPrint }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold text-gray-800">Hóa đơn bán hàng</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrint}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Printer size={18} />
              <span>In hóa đơn</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8" id="invoice-print">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              SHOP TRANG GIÀY DÉP
            </h1>
            <p className="text-gray-600">Địa chỉ: Ấp 1, Xã.Phú lộc, H.Thạnh trị, P.Sóc Trăng, TP.Cần thơ</p>
            <p className="text-gray-600">Điện thoại: 0788821666</p>
          </div>

          <div className="border-t-2 border-b-2 border-gray-300 py-4 mb-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              HÓA ĐƠN BÁN HÀNG
            </h2>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Số hóa đơn:</p>
              <p className="font-semibold">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày mua:</p>
              <p className="font-semibold">
                {new Date(invoice.invoice_date).toLocaleDateString("vi-VN")}
              </p>
            </div>
            {invoice.customer_name && (
              <div>
                <p className="text-sm text-gray-600">Khách hàng:</p>
                <p className="font-semibold">{invoice.customer_name}</p>
              </div>
            )}
            {invoice.customer_phone && (
              <div>
                <p className="text-sm text-gray-600">Số điện thoại:</p>
                <p className="font-semibold">{invoice.customer_phone}</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 text-sm font-semibold">STT</th>
                <th className="text-left py-2 text-sm font-semibold">
                  Sản phẩm
                </th>
                <th className="text-center py-2 text-sm font-semibold">SL</th>
                <th className="text-right py-2 text-sm font-semibold">
                  Đơn giá
                </th>
                <th className="text-right py-2 text-sm font-semibold">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 text-sm">{index + 1}</td>
                  <td className="py-3 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.size && (
                        <p className="text-xs text-gray-500">
                          Size: {item.size}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-sm text-center">{item.quantity}</td>
                  <td className="py-3 text-sm text-right">
                    {new Intl.NumberFormat("vi-VN").format(item.unit_price)} ₫
                  </td>
                  <td className="py-3 text-sm text-right font-semibold">
                    {new Intl.NumberFormat("vi-VN").format(
                      item.quantity * item.unit_price
                    )}{" "}
                    ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-t-2 border-gray-300">
                <span className="font-bold text-lg">TỔNG CỘNG:</span>
                <span className="font-bold text-lg text-blue-600">
                  {new Intl.NumberFormat("vi-VN").format(
                    invoice.items.reduce(
                      (sum, item) => sum + item.quantity * item.unit_price,
                      0
                    )
                  )}{" "}
                  ₫
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 mt-8 pt-8 border-t border-gray-300">
            <p className="mb-2">Cảm ơn quý khách đã mua hàng!</p>
            <p>Hẹn gặp lại quý khách</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickCheckout;
