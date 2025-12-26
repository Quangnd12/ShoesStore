# Invoice Components Refactoring

## Tổng quan

Dự án này đã được tái cấu trúc để tách các component hóa đơn thành các phần nhỏ hơn, dễ bảo trì và tái sử dụng. Thay vì có 2 file lớn (PurchaseInvoices: 1418 dòng, SalesInvoices: 1699 dòng), chúng ta đã tách thành nhiều component nhỏ với chức năng rõ ràng.

## Cấu trúc thư mục

```
frontend/src/components/invoices/
├── shared/                     # Components dùng chung
│   ├── InvoiceFilters.jsx     # Bộ lọc hóa đơn
│   ├── InvoicePagination.jsx  # Phân trang
│   ├── InvoiceAccordion.jsx   # Hiển thị danh sách theo ngày
│   └── InvoiceDetailModal.jsx # Modal xem chi tiết
├── purchase/                   # Components cho hóa đơn nhập
│   ├── PurchaseInvoiceForm.jsx
│   ├── PurchaseInvoiceItem.jsx
│   └── PurchaseInvoiceVariants.jsx
├── sales/                      # Components cho hóa đơn bán
│   ├── SalesInvoiceForm.jsx
│   ├── SalesInvoiceItem.jsx
│   └── ReturnExchangeModal.jsx
└── README.md
```

## Custom Hooks

```
frontend/src/hooks/
├── useInvoices.js        # Quản lý danh sách hóa đơn, filters, pagination
└── useInvoiceModal.js    # Quản lý modal tạo hóa đơn và tabs
```

## Lợi ích của việc tái cấu trúc

### 1. **Tách biệt trách nhiệm (Separation of Concerns)**
- Mỗi component chỉ đảm nhiệm một chức năng cụ thể
- Logic được tách ra thành custom hooks
- Dễ dàng test từng phần riêng biệt

### 2. **Tái sử dụng code (Code Reusability)**
- Shared components có thể dùng cho cả Purchase và Sales
- Custom hooks có thể tái sử dụng cho các trang khác
- Giảm thiểu code trùng lặp

### 3. **Dễ bảo trì (Maintainability)**
- File nhỏ hơn, dễ đọc và hiểu
- Thay đổi một chức năng không ảnh hưởng đến các phần khác
- Dễ dàng thêm tính năng mới

### 4. **Performance tốt hơn**
- Component nhỏ render nhanh hơn
- Có thể lazy load từng component khi cần
- Tối ưu hóa re-render

## Cách sử dụng

### 1. Import các component cần thiết:

```jsx
import InvoiceFilters from "../components/invoices/shared/InvoiceFilters";
import InvoicePagination from "../components/invoices/shared/InvoicePagination";
import InvoiceAccordion from "../components/invoices/shared/InvoiceAccordion";
import PurchaseInvoiceForm from "../components/invoices/purchase/PurchaseInvoiceForm";
```

### 2. Sử dụng custom hooks:

```jsx
import { useInvoices } from "../hooks/useInvoices";
import { useInvoiceModal } from "../hooks/useInvoiceModal";

const MyComponent = () => {
  const {
    invoices,
    loading,
    filters,
    setFilters,
    groupedInvoices,
    refreshInvoices,
  } = useInvoices(purchaseInvoicesAPI, "purchase");

  const {
    showModal,
    tabs,
    activeTabIndex,
    handleAddTab,
    handleTabClose,
    openModal,
  } = useInvoiceModal(purchaseInvoicesAPI, "purchase");

  // ... rest of component
};
```

## Migration Guide

### Để chuyển từ file cũ sang cấu trúc mới:

1. **Thay thế import trong App.jsx hoặc router:**
```jsx
// Cũ
import PurchaseInvoices from "./pages/PurchaseInvoices";
import SalesInvoices from "./pages/SalesInvoices";

// Mới
import PurchaseInvoices from "./pages/PurchaseInvoicesRefactored";
import SalesInvoices from "./pages/SalesInvoicesRefactored";
```

2. **Kiểm tra và test các chức năng:**
- Tạo hóa đơn mới
- Xem chi tiết hóa đơn
- Lọc và phân trang
- Import/Export Excel
- Hoàn trả/đổi hàng (Sales)

3. **Xóa file cũ sau khi đã test kỹ:**
```bash
rm frontend/src/pages/PurchaseInvoices.jsx
rm frontend/src/pages/SalesInvoices.jsx
```

## Component Props

### InvoiceFilters
```jsx
<InvoiceFilters
  filters={filters}                    // Object: current filter values
  onFiltersChange={setFilters}         // Function: update filters
  onClearFilters={clearFilters}        // Function: clear all filters
  type="purchase"                      // String: "purchase" | "sales"
/>
```

### InvoiceAccordion
```jsx
<InvoiceAccordion
  groupedInvoices={groupedInvoices}    // Array: invoices grouped by date
  expandedDates={expandedDates}        // Object: which dates are expanded
  onToggleDate={toggleDate}            // Function: toggle date expansion
  onViewDetail={handleViewDetail}     // Function: view invoice detail
  onEdit={handleEdit}                  // Function: edit invoice (optional)
  onDelete={handleDelete}              // Function: delete invoice (optional)
  type="purchase"                      // String: "purchase" | "sales"
/>
```

### PurchaseInvoiceForm
```jsx
<PurchaseInvoiceForm
  formData={formData}                  // Object: form data
  suppliers={suppliers}                // Array: supplier options
  products={products}                  // Array: product options
  categories={categories}              // Array: category options
  onFormChange={handleFormChange}      // Function: update form data
  onItemChange={handleItemChange}      // Function: update item data
  onAddItem={handleAddItem}            // Function: add new item
  onRemoveItem={handleRemoveItem}      // Function: remove item
  onSubmit={handleSubmit}              // Function: submit form
  isSubmitting={false}                 // Boolean: submission state
/>
```

## Best Practices

1. **Luôn sử dụng TypeScript** (nếu có thể) để type-safe props
2. **Viết unit tests** cho từng component
3. **Sử dụng React.memo** cho các component không thay đổi thường xuyên
4. **Tách logic phức tạp** ra thành custom hooks
5. **Sử dụng PropTypes** nếu không dùng TypeScript

## Troubleshooting

### Lỗi thường gặp:

1. **Component không render:** Kiểm tra props có được truyền đúng không
2. **Hook lỗi:** Đảm bảo hook được gọi trong functional component
3. **API lỗi:** Kiểm tra API endpoints và data format
4. **State không update:** Kiểm tra dependency array trong useEffect

### Debug tips:

```jsx
// Log props để debug
console.log('Component props:', { filters, invoices, loading });

// Sử dụng React DevTools để inspect component state
// Thêm breakpoint trong browser DevTools
```

## Future Improvements

1. **Thêm TypeScript** cho type safety
2. **Implement React Query** cho data fetching và caching
3. **Thêm unit tests** với Jest và React Testing Library
4. **Optimize performance** với React.memo và useMemo
5. **Thêm error boundaries** để handle errors gracefully
6. **Implement virtualization** cho danh sách lớn