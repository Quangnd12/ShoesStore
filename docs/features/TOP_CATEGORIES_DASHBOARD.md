# Tính năng Danh mục Bán chạy - Dashboard

## Tổng quan
Tính năng "Danh mục bán chạy" hiển thị thống kê doanh thu và số lượng bán theo từng danh mục sản phẩm, giúp quản lý hiểu rõ xu hướng mua sắm của khách hàng.

## Vị trí hiển thị
- **Dashboard > Tab Analytics > Danh mục bán chạy**
- **Dashboard > Tab Analytics > Thống kê danh mục**

## Tính năng chính

### 1. Biểu đồ tròn (Pie Chart) - TopCategories
**File**: `frontend/src/components/dashboard/TopCategories.jsx`

#### Hiển thị:
- Biểu đồ tròn phân bố doanh thu theo danh mục
- Danh sách chi tiết với tỷ lệ phần trăm
- Tổng doanh thu của tất cả danh mục

#### Dữ liệu hiển thị:
- **Tên danh mục**: Từ bảng `categories`
- **Doanh thu**: Tính từ `quantity * unit_price` của items
- **Số lượng sản phẩm**: Tổng quantity đã bán
- **Số loại sản phẩm**: Số lượng sản phẩm khác nhau trong danh mục
- **Tỷ lệ phần trăm**: So với tổng doanh thu

#### Tương tác:
- Hover vào biểu đồ để xem tooltip chi tiết
- Click nút refresh để làm mới dữ liệu
- Responsive design cho mobile

### 2. Biểu đồ cột (Bar Chart) - CategoryStats
**File**: `frontend/src/components/dashboard/CategoryStats.jsx`

#### Hiển thị:
- Biểu đồ cột top 10 danh mục theo doanh thu
- Thống kê tổng quan ở footer
- Hiển thị tổng số danh mục có trong hệ thống

#### Dữ liệu hiển thị:
- **Doanh thu**: Trục Y chính
- **Số lượng sản phẩm**: Trong tooltip
- **Số đơn hàng**: Số lần xuất hiện trong hóa đơn
- **Tổng thống kê**: Doanh thu, sản phẩm, đơn hàng

## Cấu trúc dữ liệu

### Backend API
```javascript
// Model: salesInvoice.js
getItems: async (invoiceId) => {
  // JOIN với categories để lấy category_name
  const [rows] = await db.execute(`
    SELECT sii.*, 
           p.name as product_name, 
           p.brand, 
           p.image_url,
           c.name as category_name
    FROM sales_invoice_items sii 
    LEFT JOIN products p ON sii.product_id = p.id 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE sii.sales_invoice_id = ? AND sii.quantity > 0
  `, [invoiceId]);
}
```

### Frontend Data Flow
```javascript
// 1. Lấy danh sách hóa đơn
const invoices = await salesInvoicesAPI.getAll({ limit: 1000 });

// 2. Lấy chi tiết từng hóa đơn để có items với category_name
for (const invoice of invoices) {
  const detailResponse = await salesInvoicesAPI.getById(invoice.id);
  const items = detailResponse.data?.items || [];
  
  // 3. Tính toán doanh thu theo category
  items.forEach(item => {
    const categoryName = item.category_name || 'Chưa phân loại';
    const revenue = (item.quantity || 0) * (item.unit_price || 0);
    // Aggregate data...
  });
}
```

## Dữ liệu mẫu

### Script tạo dữ liệu
**File**: `backend/scripts/seed-categories-and-sales.js`

#### Tạo:
- 8 categories mẫu (Giày thể thao, Giày sneaker, v.v.)
- Sản phẩm cho mỗi category
- 20 hóa đơn bán trong 30 ngày qua
- Items ngẫu nhiên cho mỗi hóa đơn

#### Chạy script:
```bash
cd backend
node scripts/seed-categories-and-sales.js
```

## Xử lý lỗi và Fallback

### 1. Không có dữ liệu
- Hiển thị empty state với hướng dẫn
- Nút "Làm mới dữ liệu" để retry
- Thông báo rõ ràng về cách tạo dữ liệu

### 2. Lỗi API
- Fallback sang dữ liệu mẫu (TopCategories)
- Console.log lỗi để debug
- Không crash component

### 3. Dữ liệu thiếu category_name
- Gán vào nhóm "Chưa phân loại"
- Vẫn tính toán và hiển thị bình thường

## Tối ưu hóa

### Performance
- Limit 1000 hóa đơn để tránh quá tải
- Slice top 8-10 danh mục để UI gọn gàng
- Sử dụng Map() cho tính toán nhanh

### UX/UI
- Loading spinner khi fetch dữ liệu
- Tooltip chi tiết khi hover
- Responsive design
- Color palette nhất quán

### Caching (có thể thêm)
- Cache kết quả tính toán 5-10 phút
- Invalidate cache khi có hóa đơn mới
- Local storage cho dữ liệu không thay đổi thường xuyên

## Troubleshooting

### Không hiển thị dữ liệu
1. Kiểm tra có hóa đơn bán nào không
2. Kiểm tra products có category_id không
3. Kiểm tra categories table có dữ liệu không
4. Chạy script seed để tạo dữ liệu mẫu

### Dữ liệu không chính xác
1. Kiểm tra JOIN query trong getItems()
2. Kiểm tra logic tính toán revenue
3. Kiểm tra mapping category_name

### Performance chậm
1. Giảm limit số hóa đơn
2. Thêm index cho category_id
3. Optimize query với EXPLAIN

## Files liên quan

### Backend
- `backend/src/models/salesInvoice.js` - Model chính
- `backend/src/controllers/salesInvoiceController.js` - Controller
- `backend/scripts/seed-categories-and-sales.js` - Script tạo dữ liệu

### Frontend
- `frontend/src/components/dashboard/TopCategories.jsx` - Pie chart
- `frontend/src/components/dashboard/CategoryStats.jsx` - Bar chart
- `frontend/src/pages/Dashboard.jsx` - Trang chính

### API Endpoints
- `GET /api/sales-invoices` - Lấy danh sách hóa đơn
- `GET /api/sales-invoices/:id` - Chi tiết hóa đơn với items
- `GET /api/categories` - Danh sách categories

## Kế hoạch mở rộng

### Tính năng có thể thêm
1. **Filter theo thời gian**: Tuần, tháng, quý
2. **Export báo cáo**: Excel, PDF
3. **So sánh periods**: Tháng này vs tháng trước
4. **Drill-down**: Click vào category để xem chi tiết sản phẩm
5. **Real-time updates**: WebSocket hoặc polling
6. **Advanced analytics**: Trend analysis, forecasting

### Cải tiến UI/UX
1. **Animation**: Smooth transitions cho charts
2. **Interactive legends**: Click để hide/show categories
3. **Zoom và pan**: Cho biểu đồ lớn
4. **Mobile optimization**: Swipe gestures
5. **Dark mode**: Theme switching
6. **Accessibility**: Screen reader support