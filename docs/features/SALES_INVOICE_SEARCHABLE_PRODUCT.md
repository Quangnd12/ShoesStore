# Chức năng tìm kiếm sản phẩm trong Hóa đơn bán hàng

## Thay đổi đã thực hiện

Đã thay thế `<select>` thông thường bằng component `SearchableSelect` cho ô input sản phẩm trong form thêm hóa đơn bán hàng.

## Tính năng mới

- **Tìm kiếm nhanh**: Người dùng có thể gõ để tìm kiếm sản phẩm theo tên
- **Hiển thị đầy đủ thông tin**: Mỗi sản phẩm hiển thị tên, size và số lượng tồn kho
- **Lọc tự động**: Chỉ hiển thị các sản phẩm còn hàng (stock_quantity > 0)
- **Ẩn sản phẩm đã chọn**: Sản phẩm đã được chọn ở dòng khác sẽ tự động ẩn đi, tránh chọn trùng
- **Giao diện thân thiện**: Dropdown với thanh tìm kiếm, dễ sử dụng

## Cách sử dụng

1. Mở form "Thêm hóa đơn bán hàng"
2. Trong phần "Sản phẩm", click vào ô chọn sản phẩm
3. Gõ tên sản phẩm cần tìm vào ô tìm kiếm
4. Chọn sản phẩm từ danh sách đã lọc
5. Khi thêm nhiều dòng sản phẩm, các sản phẩm đã chọn sẽ tự động ẩn ở các dòng khác

## Lợi ích

- **Tránh nhầm lẫn**: Không thể chọn trùng sản phẩm trong cùng một hóa đơn
- **Bán hàng nhanh hơn**: Dễ dàng tìm và chọn sản phẩm mà không lo chọn nhầm
- **Trải nghiệm tốt hơn**: Danh sách sản phẩm luôn rõ ràng và phù hợp với từng dòng

## Chi tiết kỹ thuật

**File thay đổi**: `frontend/src/pages/SalesInvoices.jsx`

**Component sử dụng**: `SearchableSelect`

**Logic lọc sản phẩm**:
```javascript
// Lấy danh sách ID sản phẩm đã được chọn ở các dòng khác
const selectedProductIds = tab.data.items
  .map((itm, idx) => idx !== index ? parseInt(itm.product_id) : null)
  .filter(id => id !== null && !isNaN(id));

// Lọc sản phẩm: còn hàng và chưa được chọn ở dòng khác
const availableProducts = Array.isArray(products)
  ? products.filter((p) => 
      p.stock_quantity > 0 && 
      !selectedProductIds.includes(p.id)
    )
  : [];
```

**Props được truyền**:
- `label`: "Sản phẩm"
- `required`: true
- `options`: Danh sách sản phẩm còn hàng và chưa được chọn
- `getOptionLabel`: Hiển thị "Tên - Size: X (Còn: Y)"
- `getOptionValue`: Lấy ID sản phẩm
- `placeholder`: "Chọn sản phẩm"
- `searchPlaceholder`: "Tìm kiếm sản phẩm..."
- `emptyMessage`: "Không tìm thấy sản phẩm"
