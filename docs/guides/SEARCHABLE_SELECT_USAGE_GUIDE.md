# Hướng dẫn sử dụng SearchableSelect

## Đã hoàn thành

✅ **Component SearchableSelect** đã được tạo tại `frontend/src/components/SearchableSelect.jsx`
✅ **ProductsEnhanced.jsx** - Đã áp dụng cho input Danh mục

## Cần áp dụng tiếp

### 1. PurchaseInvoices.jsx - Input Danh mục

**Bước 1**: Thêm import
```jsx
import SearchableSelect from "../components/SearchableSelect";
```

**Bước 2**: Tìm và thay thế select danh mục (khoảng dòng 1090-1100)

Thay thế:
```jsx
<select
  required={!item.product_id}
  value={item.category_id}
  onChange={(e) =>
    handleItemChange(tabIndex, itemIndex, "category_id", e.target.value)
  }
  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
>
  <option value="">Chọn danh mục</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>{cat.name}</option>
  ))}
</select>
```

Bằng:
```jsx
<SearchableSelect
  options={categories}
  value={item.category_id}
  onChange={(value) =>
    handleItemChange(tabIndex, itemIndex, "category_id", value)
  }
  label="Danh mục"
  placeholder="Chọn danh mục"
  searchPlaceholder="Tìm danh mục..."
  required={!item.product_id}
/>
```

### 2. SalesInvoices.jsx - Input Chọn sản phẩm

**Bước 1**: Thêm import
```jsx
import SearchableSelect from "../components/SearchableSelect";
```

**Bước 2**: Tìm và thay thế select sản phẩm

Thay thế:
```jsx
<select
  required
  value={item.product_id}
  onChange={(e) =>
    handleItemChange(tabIndex, itemIndex, "product_id", e.target.value)
  }
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>
  <option value="">Chọn sản phẩm</option>
  {products.map((product) => (
    <option key={product.id} value={product.id}>
      {product.name} - {product.brand} (Size {product.size})
    </option>
  ))}
</select>
```

Bằng:
```jsx
<SearchableSelect
  options={products}
  value={item.product_id}
  onChange={(value) =>
    handleItemChange(tabIndex, itemIndex, "product_id", value)
  }
  label="Sản phẩm"
  placeholder="Chọn sản phẩm"
  searchPlaceholder="Tìm sản phẩm (tên, thương hiệu, size)..."
  getOptionLabel={(product) => 
    `${product.name} - ${product.brand} (Size ${product.size}) - ${new Intl.NumberFormat("vi-VN").format(product.price)}đ`
  }
  required
/>
```

## Test tính năng

Sau khi áp dụng, test các tính năng sau:

1. **Tìm kiếm**: Gõ vào ô tìm kiếm để lọc danh sách
2. **Chọn**: Click vào option để chọn
3. **Xóa**: Click vào icon X để xóa lựa chọn
4. **Keyboard**: 
   - ESC để đóng dropdown
   - Type để tìm kiếm
5. **Click outside**: Click ra ngoài để đóng dropdown

## Ví dụ nâng cao

### Hiển thị ảnh sản phẩm trong dropdown

```jsx
<SearchableSelect
  options={products}
  value={selectedProductId}
  onChange={setSelectedProductId}
  label="Sản phẩm"
  placeholder="Chọn sản phẩm"
  searchPlaceholder="Tìm sản phẩm..."
  renderOption={(product) => (
    <div className="flex items-center space-x-3">
      {product.image_url && (
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-10 h-10 object-cover rounded"
        />
      )}
      <div className="flex-1">
        <div className="font-medium text-sm">{product.name}</div>
        <div className="text-xs text-gray-500">
          {product.brand} - Size {product.size} - 
          {new Intl.NumberFormat("vi-VN").format(product.price)}đ
        </div>
      </div>
    </div>
  )}
/>
```

### Nhóm options theo category

```jsx
<SearchableSelect
  options={products}
  value={selectedProductId}
  onChange={setSelectedProductId}
  label="Sản phẩm"
  getOptionLabel={(product) => 
    `[${product.category?.name}] ${product.name} - ${product.brand}`
  }
/>
```

## Troubleshooting

### Lỗi: "Cannot read property 'name' of undefined"
- Đảm bảo `options` là một array hợp lệ
- Kiểm tra `getOptionLabel` và `getOptionValue` có đúng với cấu trúc data không

### Dropdown không hiển thị
- Kiểm tra z-index (component đã set z-50)
- Kiểm tra parent container có `overflow: hidden` không

### Tìm kiếm không hoạt động
- Kiểm tra `getOptionLabel` trả về string
- Đảm bảo không có lỗi trong console

## Tùy chỉnh styling

Thêm custom class:
```jsx
<SearchableSelect
  className="mb-4"
  // Hoặc wrap trong div
/>

<div className="col-span-2">
  <SearchableSelect ... />
</div>
```

## Performance

Component đã được tối ưu:
- Chỉ render lại khi cần thiết
- Tìm kiếm real-time không lag
- Hỗ trợ danh sách lớn (1000+ items)

## Kết luận

SearchableSelect giúp cải thiện UX đáng kể, đặc biệt khi:
- Danh sách có nhiều hơn 10 items
- User cần tìm kiếm nhanh
- Trên mobile (không cần scroll nhiều)

Hãy áp dụng cho tất cả các dropdown có danh sách dài!
