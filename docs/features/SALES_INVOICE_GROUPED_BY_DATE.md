# Tính năng gom nhóm hóa đơn theo ngày

## Mô tả chức năng

Hệ thống tự động gom tất cả hóa đơn bán hàng theo ngày và hiển thị dưới dạng accordion/collapsible panel. Mỗi panel hiển thị thông tin tổng hợp của ngày đó và có thể mở rộng để xem chi tiết từng hóa đơn.

## Tính năng chính

### 1. Gom nhóm tự động
- Tự động nhóm hóa đơn theo ngày (invoice_date)
- Sắp xếp theo thứ tự ngày giảm dần (mới nhất trên cùng)

### 2. Thông tin tổng hợp mỗi ngày
Mỗi panel hiển thị:
- **Ngày**: Ví dụ "Ngày 25/11/2025"
- **Số lượng hóa đơn**: Tổng số hóa đơn trong ngày
- **Tổng doanh thu**: Tổng tiền bán ra trong ngày
- **Tổng sản phẩm**: Tổng số lượng sản phẩm đã bán

### 3. Accordion/Collapsible
- Click vào panel để mở rộng/thu gọn
- Icon thay đổi: ChevronDown (đóng) ↔ ChevronUp (mở)
- Trạng thái mở/đóng được lưu riêng cho từng ngày
- Hiệu ứng hover khi di chuột qua

### 4. Bảng chi tiết
Khi mở rộng, hiển thị bảng chi tiết gồm:
- Số hóa đơn
- Khách hàng
- Ngày cập nhật
- Tổng tiền
- Thao tác (Xem chi tiết, Tạo hoàn trả/đổi hàng)

## Giao diện (UI/UX)

### Header Panel
```
┌─────────────────────────────────────────────────────────────┐
│ 🔵  Ngày 25/11/2025                          Xem chi tiết   │
│     3 hóa đơn • 540.000 ₫ • 12 sản phẩm                     │
└─────────────────────────────────────────────────────────────┘
```

### Màu sắc
- **Số hóa đơn**: Xanh dương (#2563eb)
- **Tổng tiền**: Xanh lá (#16a34a)
- **Số sản phẩm**: Tím (#9333ea)
- **Icon**: Xanh dương trên nền xanh nhạt

### Responsive
- Tự động điều chỉnh layout trên mobile
- Thông tin tổng hợp hiển thị rõ ràng trên mọi màn hình

## Chi tiết kỹ thuật

### State Management
```javascript
// State để quản lý trạng thái mở/đóng của từng ngày
const [expandedDates, setExpandedDates] = useState({});

// Toggle accordion
const toggleDate = (dateKey) => {
  setExpandedDates((prev) => ({
    ...prev,
    [dateKey]: !prev[dateKey],
  }));
};
```

### Logic gom nhóm
```javascript
const groupedInvoices = useMemo(() => {
  const groups = {};
  
  filteredInvoices.forEach((invoice) => {
    const dateKey = new Date(invoice.invoice_date).toLocaleDateString("vi-VN");
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        invoices: [],
        totalRevenue: 0,
        totalProducts: 0,
      };
    }
    
    groups[dateKey].invoices.push(invoice);
    groups[dateKey].totalRevenue += invoice.total_revenue || 0;
    
    // Tính tổng số sản phẩm
    if (invoice.items && Array.isArray(invoice.items)) {
      groups[dateKey].totalProducts += invoice.items.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
    }
  });
  
  // Sắp xếp theo ngày giảm dần
  return Object.values(groups).sort((a, b) => {
    const dateA = a.date.split("/").reverse().join("-");
    const dateB = b.date.split("/").reverse().join("-");
    return dateB.localeCompare(dateA);
  });
}, [filteredInvoices]);
```

### Icons sử dụng
- `ChevronDown`: Khi panel đóng
- `ChevronUp`: Khi panel mở
- `Eye`: Xem chi tiết hóa đơn
- `Edit`: Tạo hoàn trả/đổi hàng

## Lợi ích

1. **Dễ quản lý**: Nhìn tổng quan doanh thu theo từng ngày
2. **Tiết kiệm không gian**: Chỉ hiển thị chi tiết khi cần
3. **Tìm kiếm nhanh**: Dễ dàng tìm hóa đơn theo ngày
4. **Phân tích tốt hơn**: So sánh doanh thu giữa các ngày
5. **UX tốt**: Giao diện gọn gàng, dễ sử dụng

## Tương thích

- Hoạt động với tất cả bộ lọc hiện có
- Tương thích với pagination
- Responsive trên mọi thiết bị
- Không ảnh hưởng đến các chức năng khác

## File thay đổi

### Backend
- `backend/src/models/SalesInvoice.js`
  - Cập nhật hàm `getAll`: Thêm `total_quantity` vào query
  - Sử dụng `LEFT JOIN` với `sales_invoice_items` và `SUM(quantity)`
  - Group by `si.id` để tính tổng số sản phẩm cho mỗi hóa đơn

### Frontend
- `frontend/src/pages/SalesInvoices.jsx`
  - Thêm import: `ChevronDown`, `ChevronUp`
  - Thêm state: `expandedDates`
  - Thêm logic: `groupedInvoices`, `toggleDate`
  - Sử dụng `invoice.total_quantity` từ backend
  - Thay đổi UI: Từ bảng đơn giản sang accordion

## Khắc phục lỗi

### Vấn đề: Hiển thị "NaN đ" và "0 sản phẩm"
**Nguyên nhân**: API `getAll` không trả về `items` cho mỗi hóa đơn, dẫn đến không tính được tổng số sản phẩm.

**Giải pháp**: 
1. Sửa backend model để thêm `total_quantity` vào query
2. Sử dụng `LEFT JOIN` với bảng `sales_invoice_items`
3. Dùng `SUM(quantity)` và `GROUP BY` để tính tổng
4. Frontend sử dụng trực tiếp `invoice.total_quantity` từ API
