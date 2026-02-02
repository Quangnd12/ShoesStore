# Invoice Components Refactoring

## Vấn đề trước khi refactor:
- File `PurchaseInvoices.jsx` và `SalesInvoices.jsx` quá dài (>1500 dòng mỗi file)
- Quá nhiều state và logic trong một component
- Khó bảo trì và debug
- Code lặp lại giữa hai file
- UI components phức tạp được viết inline

## Cấu trúc mới:

### 1. Shared Components (Dùng chung)
- `InvoiceFilters.jsx` - Bộ lọc hóa đơn
- `InvoiceList.jsx` - Danh sách hóa đơn với accordion
- `InvoiceDetailModal.jsx` - Modal xem chi tiết hóa đơn
- `PaginationControls.jsx` - Điều khiển phân trang

### 2. Purchase Invoice Components
- `purchase/PurchaseInvoiceForm.jsx` - Form tạo hóa đơn nhập

### 3. Sales Invoice Components  
- `sales/SalesInvoiceForm.jsx` - Form tạo hóa đơn bán
- `sales/ReturnExchangeModal.jsx` - Modal hoàn trả/đổi hàng

### 4. Custom Hooks
- `useInvoiceData.js` - Logic chung cho quản lý data hóa đơn
- `usePurchaseInvoice.js` - Logic riêng cho hóa đơn nhập
- `useSalesInvoice.js` - Logic riêng cho hóa đơn bán

### 5. Refactored Pages
- `PurchaseInvoicesRefactored.jsx` - Trang hóa đơn nhập mới
- `SalesInvoicesRefactored.jsx` - Trang hóa đơn bán mới

## Lợi ích:

### 1. Dễ bảo trì
- Mỗi component có trách nhiệm rõ ràng
- Logic được tách riêng vào custom hooks
- Code ngắn gọn, dễ đọc

### 2. Tái sử dụng
- Shared components có thể dùng cho cả hai loại hóa đơn
- Custom hooks có thể mở rộng cho các tính năng khác

### 3. Dễ test
- Mỗi component nhỏ dễ viết unit test
- Logic tách riêng dễ test riêng biệt

### 4. Performance
- Chỉ re-render component cần thiết
- Lazy loading có thể áp dụng dễ dàng

## Cách sử dụng:

### Thay thế file cũ:
```bash
# Backup file cũ
mv frontend/src/pages/PurchaseInvoices.jsx frontend/src/pages/PurchaseInvoices.jsx.backup
mv frontend/src/pages/SalesInvoices.jsx frontend/src/pages/SalesInvoices.jsx.backup

# Sử dụng file mới
mv frontend/src/pages/PurchaseInvoicesRefactored.jsx frontend/src/pages/PurchaseInvoices.jsx
mv frontend/src/pages/SalesInvoicesRefactored.jsx frontend/src/pages/SalesInvoices.jsx
```

### Import components:
```javascript
import { 
  InvoiceFilters, 
  InvoiceList, 
  PaginationControls 
} from '../components/invoices';
```

## Mở rộng trong tương lai:

1. **Thêm loại hóa đơn mới**: Chỉ cần tạo hook và form component riêng
2. **Thêm tính năng**: Dễ dàng thêm vào hook tương ứng
3. **Thay đổi UI**: Chỉ cần sửa component cụ thể
4. **Optimization**: Có thể áp dụng React.memo, useMemo dễ dàng

## Testing Strategy:

1. **Unit Tests**: Test từng component riêng biệt
2. **Hook Tests**: Test logic trong custom hooks
3. **Integration Tests**: Test tương tác giữa components
4. **E2E Tests**: Test flow hoàn chỉnh

## Migration Guide:

1. Import các component mới
2. Thay thế logic cũ bằng custom hooks
3. Test kỹ các tính năng
4. Deploy từng phần để đảm bảo stability