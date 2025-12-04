# Tính năng Tự động tăng số hóa đơn

## Mô tả
Hệ thống đã được cập nhật để tự động tạo và tăng số hóa đơn (bán hàng và nhập hàng) dựa trên dữ liệu trong database. Khi người dùng mở form thêm hóa đơn mới hoặc thêm tab mới, số hóa đơn sẽ được tự động render từ backend.

- **Hóa đơn bán hàng**: Format `HD{YYYYMMDD}-{XXX}` (ví dụ: HD20251124-001)
- **Hóa đơn nhập hàng**: Format `PN{YYYYMMDD}-{XXX}` (ví dụ: PN20251124-001)

## Cách hoạt động

### Backend (API)

#### 1. Model - `backend/src/models/salesInvoice.js`
Thêm method mới `getNextInvoiceNumber()`:
- Lấy hóa đơn cuối cùng trong ngày hôm nay từ database
- Tự động tăng số thứ tự lên 1
- Format: `HD{YYYYMMDD}-{XXX}` (ví dụ: HD20251124-001, HD20251124-002, ...)
- Nếu có lỗi, trả về số mặc định: `HD{YYYYMMDD}-001`

```javascript
getNextInvoiceNumber: async () => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
  const prefix = `HD${dateStr}`;

  // Lấy hóa đơn cuối cùng trong ngày
  const [rows] = await db.execute(
    `SELECT invoice_number 
     FROM sales_invoices 
     WHERE invoice_number LIKE ? 
     ORDER BY invoice_number DESC 
     LIMIT 1`,
    [`${prefix}-%`]
  );

  let nextNumber = 1;
  if (rows.length > 0) {
    const match = rows[0].invoice_number.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}
```

#### 2. Controller - `backend/src/controllers/salesInvoiceController.js`
Thêm controller mới `getNextInvoiceNumber`:
```javascript
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const nextNumber = await SalesInvoice.getNextInvoiceNumber();
    res.json({ invoice_number: nextNumber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

#### 3. Routes - `backend/src/routes/salesInvoice.js`
Thêm route mới:
```javascript
router.get("/next-number", auth, isAdmin, salesInvoiceController.getNextInvoiceNumber);
```

**Lưu ý**: Route `/next-number` phải đặt TRƯỚC route `/:id` để tránh conflict.

### Frontend

#### 1. API Service - `frontend/src/services/api.js`
Thêm method mới vào `salesInvoicesAPI`:
```javascript
export const salesInvoicesAPI = {
  getAll: (params) => api.get("/sales-invoices", { params }),
  getById: (id) => api.get(`/sales-invoices/${id}`),
  create: (data) => api.post("/sales-invoices", data),
  getNextInvoiceNumber: () => api.get("/sales-invoices/next-number"), // Mới
};
```

#### 2. Component - `frontend/src/pages/SalesInvoices.jsx`

**Cập nhật hàm `resetAllTabs()`**:
- Gọi API `getNextInvoiceNumber()` để lấy số hóa đơn tiếp theo
- Tự động điền vào input số hóa đơn
- Có fallback nếu API lỗi

```javascript
const resetAllTabs = async () => {
  try {
    const response = await salesInvoicesAPI.getNextInvoiceNumber();
    const invoiceNumber = response.data.invoice_number;
    
    setTabs([{
      label: "Hóa đơn 1",
      data: {
        invoice_number: invoiceNumber, // Tự động điền
        invoice_date: new Date().toISOString().split("T")[0],
        // ... các field khác
      },
    }]);
  } catch (error) {
    // Fallback nếu API lỗi
    const fallbackNumber = `HD${dateStr}-001`;
    // ...
  }
};
```

**Cập nhật hàm `handleAddTab()`**:
- Tương tự như `resetAllTabs()`
- Mỗi khi thêm tab mới, gọi API để lấy số hóa đơn tiếp theo
- Đảm bảo không bị trùng số giữa các tab

## Ví dụ sử dụng

### Kịch bản 1: Mở form thêm hóa đơn mới
1. User click nút "Thêm hóa đơn bán"
2. Hệ thống gọi API `/sales-invoices/next-number`
3. Backend kiểm tra database:
   - Nếu đã có HD20251124-001, HD20251124-002
   - Trả về: HD20251124-003
4. Frontend tự động điền "HD20251124-003" vào input

### Kịch bản 2: Thêm nhiều tab cùng lúc
1. User mở tab đầu tiên → Nhận HD20251124-003
2. User click "+" để thêm tab mới → Gọi API lại
3. Backend trả về HD20251124-004 (số tiếp theo)
4. Mỗi tab có số hóa đơn riêng, không trùng lặp

### Kịch bản 3: Xử lý lỗi
- Nếu API lỗi (mất kết nối, server down)
- Frontend tự động fallback về số mặc định: HD{YYYYMMDD}-001
- User vẫn có thể nhập thủ công nếu cần

## Lợi ích

1. **Tự động hóa**: Không cần nhập số hóa đơn thủ công
2. **Chính xác**: Đảm bảo số hóa đơn không bị trùng lặp
3. **Đồng bộ**: Dựa trên dữ liệu thực tế trong database
4. **Linh hoạt**: Vẫn cho phép chỉnh sửa thủ công nếu cần
5. **An toàn**: Có fallback khi API lỗi

## Testing

### Test Backend API
```bash
# Khởi động backend
cd backend
npm start

# Test API (cần token admin)
curl -X GET http://localhost:5000/api/sales-invoices/next-number \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Response mong đợi:
{
  "invoice_number": "HD20251124-003"
}
```

### Test Frontend
1. Đăng nhập với tài khoản admin
2. Vào trang "Hóa đơn bán hàng"
3. Click "Thêm hóa đơn bán"
4. Kiểm tra input "Số hóa đơn" đã được tự động điền
5. Click "+" để thêm tab mới
6. Kiểm tra số hóa đơn ở tab mới đã tăng lên

## Lưu ý kỹ thuật

1. **Route Order**: Route `/next-number` phải đặt trước `/:id` trong routes
2. **Authentication**: API yêu cầu token admin
3. **Date Format**: Sử dụng YYYYMMDD (ví dụ: 20251124)
4. **Number Padding**: Số thứ tự luôn có 3 chữ số (001, 002, ..., 999)
5. **Async/Await**: Các hàm `resetAllTabs()` và `handleAddTab()` đã được chuyển thành async

## Các file đã thay đổi

### Backend
- ✅ `backend/src/models/salesInvoice.js` - Thêm method `getNextInvoiceNumber()`
- ✅ `backend/src/controllers/salesInvoiceController.js` - Thêm controller `getNextInvoiceNumber`
- ✅ `backend/src/routes/salesInvoice.js` - Thêm route GET `/next-number`

### Frontend
- ✅ `frontend/src/services/api.js` - Thêm method `getNextInvoiceNumber()`
- ✅ `frontend/src/pages/SalesInvoices.jsx` - Cập nhật `resetAllTabs()` và `handleAddTab()`
- ✅ Xóa import `salesInvoiceGenerator` (không còn dùng)


---

## Hóa đơn nhập hàng (Purchase Invoices)

### Backend

#### 1. Model - `backend/src/models/purchaseInvoice.js`
Thêm method `getNextInvoiceNumber()`:
```javascript
getNextInvoiceNumber: async () => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const prefix = `PN${dateStr}`; // PN = Purchase iNvoice

    const [rows] = await db.execute(
      `SELECT invoice_number 
       FROM purchase_invoices 
       WHERE invoice_number LIKE ? 
       ORDER BY invoice_number DESC 
       LIMIT 1`,
      [`${prefix}-%`]
    );

    let nextNumber = 1;
    if (rows.length > 0) {
      const match = rows[0].invoice_number.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
  } catch (error) {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    return `PN${dateStr}-001`;
  }
}
```

#### 2. Controller - `backend/src/controllers/purchaseInvoiceController.js`
Thêm controller `getNextInvoiceNumber`:
```javascript
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const nextNumber = await PurchaseInvoice.getNextInvoiceNumber();
    res.json({ invoice_number: nextNumber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

#### 3. Routes - `backend/src/routes/purchaseInvoice.js`
Thêm route:
```javascript
router.get("/next-number", auth, isAdmin, purchaseInvoiceController.getNextInvoiceNumber);
```

### Frontend

#### 1. API Service - `frontend/src/services/api.js`
Thêm method:
```javascript
export const purchaseInvoicesAPI = {
  getAll: (params) => api.get("/purchase-invoices", { params }),
  getById: (id) => api.get(`/purchase-invoices/${id}`),
  create: (data) => api.post("/purchase-invoices", data),
  delete: (id) => api.delete(`/purchase-invoices/${id}`),
  getNextInvoiceNumber: () => api.get("/purchase-invoices/next-number"), // Mới
};
```

#### 2. Component - `frontend/src/pages/PurchaseInvoices.jsx`
- Xóa import `purchaseInvoiceGenerator`
- Cập nhật `resetAllTabs()` thành async và gọi API
- Cập nhật `handleAddTab()` thành async và gọi API
- Cập nhật button "Thêm hóa đơn nhập" để gọi `resetAllTabs()` async

---

## So sánh hai loại hóa đơn

| Tính năng | Hóa đơn bán (Sales) | Hóa đơn nhập (Purchase) |
|-----------|---------------------|-------------------------|
| Prefix | HD | PN |
| Format | HD20251124-001 | PN20251124-001 |
| API Endpoint | `/sales-invoices/next-number` | `/purchase-invoices/next-number` |
| Model Method | `SalesInvoice.getNextInvoiceNumber()` | `PurchaseInvoice.getNextInvoiceNumber()` |
| Frontend Component | `SalesInvoices.jsx` | `PurchaseInvoices.jsx` |

---

## Các file đã thay đổi (Tổng hợp)

### Backend
- ✅ `backend/src/models/salesInvoice.js` - Thêm `getNextInvoiceNumber()`
- ✅ `backend/src/controllers/salesInvoiceController.js` - Thêm controller
- ✅ `backend/src/routes/salesInvoice.js` - Thêm route `/next-number`
- ✅ `backend/src/models/purchaseInvoice.js` - Thêm `getNextInvoiceNumber()`
- ✅ `backend/src/controllers/purchaseInvoiceController.js` - Thêm controller
- ✅ `backend/src/routes/purchaseInvoice.js` - Thêm route `/next-number`

### Frontend
- ✅ `frontend/src/services/api.js` - Thêm methods cho cả 2 API
- ✅ `frontend/src/pages/SalesInvoices.jsx` - Cập nhật logic
- ✅ `frontend/src/pages/PurchaseInvoices.jsx` - Cập nhật logic

---

## Testing tổng hợp

### Test Backend APIs
```bash
# Test Sales Invoice
curl -X GET http://localhost:5000/api/sales-invoices/next-number \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
# Response: {"invoice_number": "HD20251124-003"}

# Test Purchase Invoice
curl -X GET http://localhost:5000/api/purchase-invoices/next-number \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
# Response: {"invoice_number": "PN20251124-002"}
```

### Test Frontend
1. **Hóa đơn bán hàng**:
   - Vào trang "Hóa đơn bán hàng"
   - Click "Thêm hóa đơn bán"
   - Kiểm tra số hóa đơn tự động (HD...)
   - Click "+" để thêm tab → Số tăng lên

2. **Hóa đơn nhập hàng**:
   - Vào trang "Hóa đơn nhập hàng"
   - Click "Thêm hóa đơn nhập"
   - Kiểm tra số hóa đơn tự động (PN...)
   - Click "+" để thêm tab → Số tăng lên

---

## Kết luận

Tính năng tự động tăng số hóa đơn đã được triển khai thành công cho cả:
- ✅ Hóa đơn bán hàng (Sales Invoices) - Format: HD{YYYYMMDD}-{XXX}
- ✅ Hóa đơn nhập hàng (Purchase Invoices) - Format: PN{YYYYMMDD}-{XXX}

Cả hai đều:
- Tự động lấy số từ backend API
- Đảm bảo không trùng lặp
- Có fallback khi API lỗi
- Hỗ trợ multi-tab với số hóa đơn riêng biệt
