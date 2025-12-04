# Tóm tắt các sửa đổi

## 1. Sửa lỗi PayloadTooLargeError khi upload ảnh

**File:** `backend/src/app.js`

**Vấn đề:** Khi upload ảnh dạng base64 ở trang Products và Purchase Invoices, backend trả về lỗi `PayloadTooLargeError: request entity too large`.

**Giải pháp:** Tăng giới hạn body size trong Express từ mặc định (100kb) lên 10MB:

```javascript
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
```

**Lưu ý:** Frontend đã có logic resize và compress ảnh xuống ~200KB, nhưng để an toàn và linh hoạt, backend được cấu hình với giới hạn 10MB.

---

## 2. Thêm phím tắt ESC để đóng modal

### 2.1. Suppliers Page

**File:** `frontend/src/pages/Suppliers.jsx`

**Vấn đề:** Không có phím tắt để đóng modal thêm/sửa nhà cung cấp.

**Giải pháp:** Thêm event listener cho phím ESC:

```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && showModal) {
      setShowModal(false);
      setEditingSupplier(null);
      resetForm();
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [showModal]);
```

### 2.2. Sales Invoices Page

**File:** `frontend/src/pages/SalesInvoices.jsx`

**Vấn đề:** Không có phím tắt để đóng các modal (thêm hóa đơn, xem chi tiết, hoàn trả/đổi hàng).

**Giải pháp:** Thêm event listener cho phím ESC cho tất cả các modal:

```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && showModal) {
      setShowModal(false);
      resetForm();
    }
    if (e.key === "Escape" && showDetailModal) {
      setShowDetailModal(false);
      setSelectedInvoice(null);
    }
    if (e.key === "Escape" && showReturnModal) {
      setShowReturnModal(false);
      setSelectedInvoiceForReturn(null);
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [showModal, showDetailModal, showReturnModal]);
```

**Lưu ý:** 
- ProductsEnhanced và PurchaseInvoices đã có phím tắt ESC từ trước.
- Bây giờ tất cả các trang đều hỗ trợ phím ESC để đóng modal.

---

## 3. Sửa biểu đồ Dashboard không render

**File:** `backend/src/models/report.js`

**Vấn đề:** Dashboard không hiển thị biểu đồ vì API reports trả về dữ liệu không đúng format mà frontend mong đợi.

**Giải pháp:** Cập nhật các phương thức trong Report model để trả về đúng format:

### 3.1. getDailyReport
Trả về:
```javascript
{
  date,
  total_revenue,      // Thay vì revenue.total_revenue
  total_invoices,     // Thay vì revenue.invoice_count
  total_cost,
  profit
}
```

### 3.2. getWeeklyReport
Trả về:
```javascript
{
  year,
  week,
  total_revenue,
  total_invoices,
  total_cost,
  profit,
  daily_data: [       // Dữ liệu từng ngày trong tuần
    { date, total_revenue, total_invoices }
  ]
}
```

### 3.3. getMonthlyReport
Trả về:
```javascript
{
  year,
  month,
  total_revenue,
  total_invoices,
  total_cost,
  profit,
  daily_data: [       // Dữ liệu từng ngày trong tháng
    { date, total_revenue, total_invoices }
  ]
}
```

### 3.4. getYearlyReport
Trả về:
```javascript
{
  year,
  total_revenue,
  total_invoices,
  total_cost,
  profit,
  monthly_data: [     // Dữ liệu từng tháng trong năm
    { month, total_revenue, total_invoices }
  ]
}
```

**Kết quả:** Dashboard giờ đây có thể render biểu đồ đúng với dữ liệu từ API reports.

---

## Cách kiểm tra

### 1. Kiểm tra upload ảnh:
1. Khởi động lại backend: `cd backend && npm start`
2. Vào trang Products hoặc Purchase Invoices
3. Thử upload ảnh có kích thước lớn (vài MB)
4. Ảnh sẽ được resize/compress và upload thành công

### 2. Kiểm tra phím tắt ESC:
1. Vào trang Suppliers hoặc Sales Invoices
2. Mở modal thêm/sửa
3. Nhấn phím ESC
4. Modal sẽ đóng lại

### 3. Kiểm tra biểu đồ Dashboard:
1. Đảm bảo có dữ liệu hóa đơn bán trong database
2. Vào trang Dashboard
3. Chuyển đổi giữa các tab: Ngày, Tuần, Tháng, Năm
4. Biểu đồ sẽ hiển thị dữ liệu tương ứng

---

## Các file đã thay đổi

1. `backend/src/app.js` - Tăng giới hạn body size
2. `backend/src/models/report.js` - Cập nhật format dữ liệu trả về
3. `frontend/src/pages/Suppliers.jsx` - Thêm phím tắt ESC
4. `frontend/src/pages/SalesInvoices.jsx` - Thêm phím tắt ESC cho tất cả modal
