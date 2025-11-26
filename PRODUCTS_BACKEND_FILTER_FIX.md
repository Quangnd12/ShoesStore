# Khắc phục Bộ lọc và Phân trang - Backend API

## Vấn đề

Khi tìm kiếm sản phẩm trong bộ lọc, sản phẩm không hiển thị ngay mà phải chuyển sang trang khác mới thấy. Nguyên nhân:

1. **Backend không hỗ trợ search/filter**: API `GET /api/products` chỉ có pagination, không có tham số tìm kiếm
2. **Frontend filter lại**: Sau khi nhận dữ liệu từ backend, frontend lọc thêm một lần nữa
3. **Không đồng bộ**: Backend trả về trang 1 (10 sản phẩm đầu), frontend lọc → Có thể không có kết quả

### Ví dụ vấn đề:
- Backend có 65 sản phẩm, trang 1 trả về 10 sản phẩm đầu
- Tìm kiếm "Tố ong nữ" (sản phẩm thứ 11)
- Frontend lọc 10 sản phẩm trang 1 → Không tìm thấy
- Phải chuyển sang trang 2 → Backend trả về sản phẩm 11-20 → Frontend lọc → Tìm thấy

## Giải pháp

### Chuyển logic filter từ Frontend sang Backend

Backend xử lý tất cả filter và pagination, frontend chỉ hiển thị kết quả.

## Thay đổi Backend

### 1. Model: `backend/src/models/product.js`

#### Cập nhật hàm `getAll()` - Thêm filters

```javascript
getAll: async (limit, offset, filters = {}) => {
  let query = `SELECT p.*, c.name as category_name, c.id as category_id
               FROM products p 
               LEFT JOIN categories c ON p.category_id = c.id`;
  
  const conditions = [];
  const params = [];

  // Tìm kiếm theo tên
  if (filters.name) {
    conditions.push('p.name LIKE ?');
    params.push(`%${filters.name}%`);
  }

  // Lọc theo danh mục
  if (filters.category_id) {
    conditions.push('p.category_id = ?');
    params.push(filters.category_id);
  }

  // Lọc theo thương hiệu
  if (filters.brand) {
    conditions.push('p.brand LIKE ?');
    params.push(`%${filters.brand}%`);
  }

  // Lọc theo giá
  if (filters.minPrice) {
    conditions.push('p.price >= ?');
    params.push(parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    conditions.push('p.price <= ?');
    params.push(parseFloat(filters.maxPrice));
  }

  // Lọc theo tồn kho
  if (filters.minStock) {
    conditions.push('p.stock_quantity >= ?');
    params.push(parseInt(filters.minStock));
  }
  if (filters.maxStock) {
    conditions.push('p.stock_quantity <= ?');
    params.push(parseInt(filters.maxStock));
  }

  // Thêm WHERE clause nếu có điều kiện
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Thêm ORDER BY, LIMIT, OFFSET
  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [rows] = await db.execute(query, params);
  return rows;
},
```

#### Cập nhật hàm `getTotal()` - Thêm filters

```javascript
getTotal: async (filters = {}) => {
  let query = 'SELECT COUNT(*) as total FROM products p';
  
  const conditions = [];
  const params = [];

  // Áp dụng cùng filters như getAll
  if (filters.name) {
    conditions.push('p.name LIKE ?');
    params.push(`%${filters.name}%`);
  }
  // ... các filters khác tương tự

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const [rows] = await db.execute(query, params);
  return rows[0].total;
},
```

### 2. Controller: `backend/src/controllers/productController.js`

```javascript
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Lấy filters từ query params
    const filters = {
      name: req.query.name || null,
      category_id: req.query.category_id || null,
      brand: req.query.brand || null,
      minPrice: req.query.minPrice || null,
      maxPrice: req.query.maxPrice || null,
      minStock: req.query.minStock || null,
      maxStock: req.query.maxStock || null,
    };

    const products = await Product.getAll(limit, offset, filters);
    const total = await Product.getTotal(filters);

    // ... format và return
  }
};
```

## Thay đổi Frontend

### 1. Gửi filters lên backend

```javascript
const fetchProducts = async () => {
  try {
    setLoading(true);
    
    // Chuẩn bị params với filters
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Thêm filters vào params nếu có giá trị
    if (filters.name) params.name = filters.name;
    if (filters.category) params.category_id = filters.category;
    if (filters.brand) params.brand = filters.brand;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.minStock) params.minStock = filters.minStock;
    if (filters.maxStock) params.maxStock = filters.maxStock;

    const response = await productsAPI.getAll(params);
    // ...
  }
};
```

### 2. Gọi lại API khi filters thay đổi

```javascript
useEffect(() => {
  fetchProducts();
  fetchCategories();
}, [currentPage, itemsPerPage, filters]); // Thêm filters vào dependencies
```

### 3. Loại bỏ filter ở client-side

```javascript
// TRƯỚC: Filter lại ở client
const filteredProducts = useMemo(() => {
  let filtered = groupedProducts;
  if (filters.name) {
    filtered = filtered.filter(group => 
      group.name.toLowerCase().includes(filters.name.toLowerCase())
    );
  }
  // ... nhiều filters khác
  return filtered;
}, [groupedProducts, filters]);

// SAU: Backend đã filter, không cần filter lại
const filteredProducts = groupedProducts;
```

### 4. Sử dụng pagination từ backend

```javascript
// Sử dụng thông tin pagination từ backend
const paginationInfo = useMemo(() => {
  const start = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  
  return {
    totalItems: totalItems,      // Từ backend
    totalPages: totalPages,      // Từ backend
    start: start,
    end: end,
  };
}, [totalItems, totalPages, currentPage, itemsPerPage]);
```

## API Endpoints mới

### GET /api/products

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số items/trang (default: 10)
- `name`: Tìm kiếm theo tên (LIKE %name%)
- `category_id`: Lọc theo danh mục
- `brand`: Tìm kiếm theo thương hiệu (LIKE %brand%)
- `minPrice`: Giá tối thiểu
- `maxPrice`: Giá tối đa
- `minStock`: Tồn kho tối thiểu
- `maxStock`: Tồn kho tối đa

**Ví dụ:**
```
GET /api/products?page=1&limit=10&name=Tố ong nữ
GET /api/products?page=1&limit=10&category_id=2&minPrice=50000
GET /api/products?page=1&limit=10&brand=Nike&minStock=10
```

**Response:**
```json
{
  "products": [...],
  "currentPage": 1,
  "totalPages": 2,
  "totalItems": 15
}
```

## Luồng hoạt động mới

### Khi tìm kiếm "Tố ong nữ":

1. **Frontend**: Gửi request `GET /api/products?page=1&limit=10&name=Tố ong nữ`
2. **Backend**: 
   - Query: `SELECT ... WHERE p.name LIKE '%Tố ong nữ%' LIMIT 10 OFFSET 0`
   - Tìm thấy 1 sản phẩm
   - Return: `{products: [Tố ong nữ], totalItems: 1, totalPages: 1}`
3. **Frontend**: Hiển thị ngay kết quả, không cần chuyển trang

### Khi lọc theo danh mục:

1. **Frontend**: Gửi `GET /api/products?page=1&limit=10&category_id=2`
2. **Backend**: Query với `WHERE p.category_id = 2`
3. **Frontend**: Hiển thị kết quả đã lọc

## Lợi ích

1. **Tìm kiếm chính xác**: Luôn tìm thấy sản phẩm ngay trang 1
2. **Hiệu suất tốt**: Backend query trực tiếp database, nhanh hơn filter ở client
3. **Scalable**: Xử lý được hàng nghìn sản phẩm
4. **Đồng bộ**: Pagination và filter hoạt động hoàn hảo cùng nhau
5. **Giảm tải client**: Không cần xử lý logic phức tạp ở frontend

## Testing

### Test cases:
1. ✅ Tìm kiếm "Tố ong nữ" → Hiển thị ngay trang 1
2. ✅ Lọc theo danh mục → Đúng sản phẩm
3. ✅ Lọc theo giá → Đúng khoảng giá
4. ✅ Kết hợp nhiều filter → Hoạt động chính xác
5. ✅ Pagination với filter → Số trang đúng
6. ✅ Xóa filter → Quay về danh sách đầy đủ

## File thay đổi

- `backend/src/models/product.js`
- `backend/src/controllers/productController.js`
- `frontend/src/pages/ProductsEnhanced.jsx`
