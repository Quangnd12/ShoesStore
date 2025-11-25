import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Filter,
  X,
} from "lucide-react";
import { productsAPI, categoriesAPI } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import ProductDetailModal from "../components/ProductDetailModal";
import SearchableSelect from "../components/SearchableSelect";

const ProductsEnhanced = () => {
  const { showToast } = useToast();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination (dựa trên backend)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Lazy loading (frontend)
  const [displayedCount, setDisplayedCount] = useState(10);
  const [useLazyLoading, setUseLazyLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    minStock: "",
    maxStock: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    stock_quantity: "",
    image_url: "",
    discount_price: "",
    brand: "",
    size: "",
    color: "",
  });

  const handleImageFileChange = (file) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, image_url: "" }));
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
        let currentQuality = quality;
        while (base64.length > maxSizeKB * 1024 && currentQuality > 0.3) {
          currentQuality -= 0.1;
          base64 = canvas.toDataURL("image/jpeg", currentQuality);
        }

        setFormData((prev) => ({
          ...prev,
          image_url: base64,
        }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const handleProductsUpdate = () => {
      fetchProducts();
    };
    window.addEventListener("products-updated", handleProductsUpdate);
    return () =>
      window.removeEventListener("products-updated", handleProductsUpdate);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (useLazyLoading) {
      setDisplayedCount(10);
    }
  }, [filters, useLazyLoading]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
      });
      const products = response.data?.products || response.data || [];
      const total = response.data?.totalItems ?? products.length;
      setAllProducts(products);
      setTotalItems(total);
      setTotalPages(
        response.data?.totalPages || Math.ceil(total / itemsPerPage) || 1
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Không thể tải danh sách sản phẩm", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Group products theo tên để gom các biến thể
  const groupedProducts = useMemo(() => {
    const grouped = {};

    allProducts.forEach((product) => {
      const stockQuantity = product.stock_quantity || 0;
      const key = product.name;

      if (!grouped[key]) {
        grouped[key] = {
          name: product.name,
          products: [],
          totalStock: 0,
          minPrice: Infinity,
          maxPrice: 0,
          sizes: new Set(),
          colors: new Set(),
          brands: new Set(),
          category: product.category,
          image_url: product.image_url,
        };
      }

      grouped[key].products.push(product);

      if (stockQuantity > 0) {
        grouped[key].totalStock += stockQuantity;

        grouped[key].minPrice = Math.min(
          grouped[key].minPrice,
          product.price || 0
        );
        grouped[key].maxPrice = Math.max(
          grouped[key].maxPrice,
          product.price || 0
        );

        if (product.size) grouped[key].sizes.add(product.size);
      }

      if (product.color) grouped[key].colors.add(product.color);
      if (product.brand) grouped[key].brands.add(product.brand);
    });

    const result = Object.values(grouped).filter(
      (group) => group.totalStock > 0
    );

    return result;
  }, [allProducts]);

  // Lọc theo bộ lọc hiện tại
  const filteredProducts = useMemo(() => {
    let filtered = groupedProducts;
    if (filters.name) {
      filtered = filtered.filter((group) =>
        group.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.category) {
      filtered = filtered.filter(
        (group) =>
          group.category?.id?.toString() === filters.category ||
          group.category?.name === filters.category
      );
    }
    if (filters.brand) {
      filtered = filtered.filter((group) =>
        Array.from(group.brands).some((b) =>
          b.toLowerCase().includes(filters.brand.toLowerCase())
        )
      );
    }
    if (filters.minPrice) {
      filtered = filtered.filter(
        (group) => group.minPrice >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (group) => group.maxPrice <= parseFloat(filters.maxPrice)
      );
    }
    if (filters.minStock) {
      filtered = filtered.filter(
        (group) => group.totalStock >= parseInt(filters.minStock)
      );
    }
    if (filters.maxStock) {
      filtered = filtered.filter(
        (group) => group.totalStock <= parseInt(filters.maxStock)
      );
    }
    return filtered;
  }, [groupedProducts, filters]);

  // Nếu bật lazy loading thì cắt theo frontend, ngược lại dùng dữ liệu backend trả về
  const displayedProducts = useMemo(() => {
    if (useLazyLoading) {
      return filteredProducts.slice(0, displayedCount);
    }
    return filteredProducts;
  }, [filteredProducts, displayedCount, useLazyLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, formData);
        showToast("Cập nhật sản phẩm thành công!", "success");
      } else {
        await productsAPI.create(formData);
        showToast("Thêm sản phẩm thành công!", "success");
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category_id: product.category?.id || product.category_id || "",
      stock_quantity: product.stock_quantity || "",
      image_url: product.image_url || "",
      discount_price: product.discount_price || "",
      brand: product.brand || "",
      size: product.size || "",
      color: product.color || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await productsAPI.delete(id);
      showToast("Xóa sản phẩm thành công!", "success");
      fetchProducts();
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const handleViewDetail = (group) => {
    setSelectedProduct(group.products[0]);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category_id: "",
      stock_quantity: "",
      image_url: "",
      discount_price: "",
      brand: "",
      size: "",
      color: "",
    });
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      minStock: "",
      maxStock: "",
    });
  };

  const loadMore = () => {
    setDisplayedCount((prev) => prev + 10);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
      }
      if (e.key === "Escape" && showDetailModal) {
        setShowDetailModal(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, showDetailModal]);

  if (loading && allProducts.length === 0) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center">
            <Filter size={20} className="mr-2" />
            Bộ lọc
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Xóa bộ lọc
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Tên sản phẩm
            </label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              placeholder="Tìm theo tên..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Danh mục</label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Thương hiệu
            </label>
            <input
              type="text"
              value={filters.brand}
              onChange={(e) =>
                setFilters({ ...filters, brand: e.target.value })
              }
              placeholder="Tìm theo thương hiệu..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Giá từ (đ)
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({ ...filters, minPrice: e.target.value })
              }
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Giá đến (đ)
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: e.target.value })
              }
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Tồn kho từ
            </label>
            <input
              type="number"
              value={filters.minStock}
              onChange={(e) =>
                setFilters({ ...filters, minStock: e.target.value })
              }
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Tồn kho đến
            </label>
            <input
              type="number"
              value={filters.maxStock}
              onChange={(e) =>
                setFilters({ ...filters, maxStock: e.target.value })
              }
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useLazyLoading}
                onChange={(e) => setUseLazyLoading(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Lazy loading</span>
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tên sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tồn kho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sizes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thương hiệu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedProducts.map((group, index) => (
              <tr key={`${group.name}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {group.image_url && (
                      <img
                        src={group.image_url}
                        alt={group.name}
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {group.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Array.from(group.colors).join(", ") || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {group.products.length} biến thể
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {group.minPrice === group.maxPrice
                      ? `${new Intl.NumberFormat("vi-VN").format(
                          group.minPrice
                        )} đ`
                      : `${new Intl.NumberFormat("vi-VN").format(
                          group.minPrice
                        )} - ${new Intl.NumberFormat("vi-VN").format(
                          group.maxPrice
                        )} đ`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      group.totalStock < 10
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {group.totalStock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Array.from(group.sizes)
                    .sort((a, b) => parseFloat(a) - parseFloat(b))
                    .join(", ") || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Array.from(group.brands).join(", ") || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetail(group)}
                      className="text-green-600 hover:text-green-900"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(group.products[0])}
                      className="text-blue-600 hover:text-blue-900"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(group.products[0].id)}
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination hoặc Lazy loading */}
      {useLazyLoading ? (
        <div className="mt-4 text-center">
          {displayedCount < filteredProducts.length && (
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Tải thêm ({filteredProducts.length - displayedCount} sản phẩm còn
              lại)
            </button>
          )}
          <p className="text-sm text-gray-600 mt-2">
            Đang hiển thị {Math.min(displayedCount, filteredProducts.length)} /{" "}
            {filteredProducts.length} sản phẩm
          </p>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị
            {totalItems > 0
              ? ` ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                  currentPage * itemsPerPage,
                  totalItems
                )} / ${totalItems}`
              : " 0 - 0 / 0"}{" "}
            sản phẩm
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronsLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 text-sm">
              Trang {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage >= totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronsRight size={20} />
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-4 border rounded px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Form modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setEditingProduct(null);
              resetForm();
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <SearchableSelect
                  options={categories}
                  value={formData.category_id}
                  onChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                  label="Danh mục"
                  placeholder="Chọn danh mục"
                  searchPlaceholder="Tìm danh mục..."
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tồn kho *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Màu sắc
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá giảm
                  </label>
                  <input
                    type="number"
                    value={formData.discount_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_price: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình ảnh sản phẩm
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageFileChange(e.target.files?.[0] || null)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Ảnh sẽ được lưu dưới dạng dữ liệu base64 trong hệ thống.
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy (ESC)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProduct ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default ProductsEnhanced;
