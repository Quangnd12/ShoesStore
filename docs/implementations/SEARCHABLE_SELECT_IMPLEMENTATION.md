# Tính năng Searchable Select (Tìm kiếm trong dropdown)

## Mô tả
Đã tạo component `SearchableSelect` - một dropdown có tính năng tìm kiếm, giúp người dùng dễ dàng tìm và chọn option khi danh sách dài.

## Component: SearchableSelect

### Vị trí
`frontend/src/components/SearchableSelect.jsx`

### Tính năng
- ✅ Tìm kiếm real-time trong dropdown
- ✅ Hiển thị icon tìm kiếm
- ✅ Xóa lựa chọn (clear button)
- ✅ Keyboard support (ESC để đóng)
- ✅ Click outside để đóng
- ✅ Auto-focus vào search input khi mở
- ✅ Highlight option đã chọn
- ✅ Custom render option
- ✅ Responsive và accessible

### Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `options` | Array | `[]` | Danh sách options |
| `value` | String/Number | - | Giá trị được chọn |
| `onChange` | Function | - | Callback khi chọn option |
| `placeholder` | String | `"Chọn..."` | Placeholder khi chưa chọn |
| `searchPlaceholder` | String | `"Tìm kiếm..."` | Placeholder trong search input |
| `label` | String | - | Label của select |
| `required` | Boolean | `false` | Hiển thị dấu * bắt buộc |
| `disabled` | Boolean | `false` | Disable select |
| `className` | String | `""` | Custom CSS class |
| `getOptionLabel` | Function | `(opt) => opt.name` | Lấy label từ option |
| `getOptionValue` | Function | `(opt) => opt.id` | Lấy value từ option |
| `renderOption` | Function | - | Custom render option |
| `emptyMessage` | String | `"Không tìm thấy kết quả"` | Message khi không có kết quả |

### Ví dụ sử dụng

#### 1. Sử dụng cơ bản
```jsx
import SearchableSelect from "../components/SearchableSelect";

<SearchableSelect
  options={categories}
  value={formData.category_id}
  onChange={(value) => setFormData({ ...formData, category_id: value })}
  label="Danh mục"
  placeholder="Chọn danh mục"
  required
/>
```

#### 2. Custom getOptionLabel và getOptionValue
```jsx
<SearchableSelect
  options={products}
  value={selectedProductId}
  onChange={setSelectedProductId}
  label="Sản phẩm"
  getOptionLabel={(product) => `${product.name} - ${product.brand}`}
  getOptionValue={(product) => product.id}
/>
```

#### 3. Custom render option (hiển thị phức tạp)
```jsx
<SearchableSelect
  options={products}
  value={selectedProductId}
  onChange={setSelectedProductId}
  label="Sản phẩm"
  renderOption={(product) => (
    <div className="flex items-center space-x-2">
      {product.image_url && (
        <img src={product.image_url} alt="" className="w-8 h-8 object-cover rounded" />
      )}
      <div>
        <div className="font-medium">{product.name}</div>
        <div className="text-xs text-gray-500">{product.brand} - Size {product.size}</div>
      </div>
    </div>
  )}
/>
```

## Áp dụng vào các trang

### 1. ProductsEnhanced.jsx - Input Danh mục

**Trước:**
```jsx
<select
  required
  value={formData.category_id}
  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>
  <option value="">Chọn danh mục</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>{cat.name}</option>
  ))}
</select>
```

**Sau:**
```jsx
import SearchableSelect from "../components/SearchableSelect";

<SearchableSelect
  options={categories}
  value={formData.category_id}
  onChange={(value) => setFormData({ ...formData, category_id: value })}
  label="Danh mục"
  placeholder="Chọn danh mục"
  searchPlaceholder="Tìm danh mục..."
  required
/>
```

### 2. PurchaseInvoices.jsx - Input Danh mục (khi tạo sản phẩm mới)

**Trước:**
```jsx
<select
  required={!item.product_id}
  value={item.category_id}
  onChange={(e) => handleItemChange(tabIndex, itemIndex, "category_id", e.target.value)}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>
  <option value="">Chọn danh mục</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>{cat.name}</option>
  ))}
</select>
```

**Sau:**
```jsx
<SearchableSelect
  options={categories}
  value={item.category_id}
  onChange={(value) => handleItemChange(tabIndex, itemIndex, "category_id", value)}
  label="Danh mục"
  placeholder="Chọn danh mục"
  searchPlaceholder="Tìm danh mục..."
  required={!item.product_id}
/>
```

### 3. SalesInvoices.jsx - Input Chọn sản phẩm

**Trước:**
```jsx
<select
  required
  value={item.product_id}
  onChange={(e) => handleItemChange(tabIndex, itemIndex, "product_id", e.target.value)}
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

**Sau:**
```jsx
<SearchableSelect
  options={products}
  value={item.product_id}
  onChange={(value) => handleItemChange(tabIndex, itemIndex, "product_id", value)}
  label="Sản phẩm"
  placeholder="Chọn sản phẩm"
  searchPlaceholder="Tìm sản phẩm..."
  getOptionLabel={(product) => `${product.name} - ${product.brand} (Size ${product.size})`}
  required
/>
```

## Lợi ích

1. **UX tốt hơn**: Dễ dàng tìm kiếm trong danh sách dài
2. **Tiết kiệm thời gian**: Không cần scroll qua hàng trăm options
3. **Responsive**: Hoạt động tốt trên mobile
4. **Accessible**: Hỗ trợ keyboard navigation
5. **Reusable**: Một component cho tất cả các dropdown
6. **Customizable**: Dễ dàng tùy chỉnh hiển thị

## Keyboard Shortcuts

- **ESC**: Đóng dropdown
- **Click outside**: Đóng dropdown
- **Type**: Tìm kiếm real-time

## Styling

Component sử dụng Tailwind CSS và có thể custom thêm qua prop `className`:

```jsx
<SearchableSelect
  className="mb-4"
  // ... other props
/>
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Next Steps

Để áp dụng vào project:

1. ✅ Component đã được tạo tại `frontend/src/components/SearchableSelect.jsx`
2. ⏳ Import và thay thế các `<select>` cũ trong:
   - `ProductsEnhanced.jsx` - Input danh mục
   - `PurchaseInvoices.jsx` - Input danh mục
   - `SalesInvoices.jsx` - Input chọn sản phẩm
3. ⏳ Test tính năng tìm kiếm
4. ⏳ Tùy chỉnh thêm nếu cần (ví dụ: hiển thị ảnh sản phẩm)
