# Hướng dẫn áp dụng SearchableSelect

## ✅ Đã hoàn thành
- Component SearchableSelect đã được tạo
- Import đã được thêm vào ProductsEnhanced, PurchaseInvoices, SalesInvoices
- ProductsEnhanced đã áp dụng SearchableSelect cho danh mục

## 📝 Cần thay thế thủ công

### 1. PurchaseInvoices.jsx - Input chọn sản phẩm

**Vị trí**: Khoảng dòng 1030-1055

**TÌM đoạn code này:**
```jsx
<div>
  <label className="block text-xs text-gray-600 mb-1">
    Chọn sản phẩm có sẵn (hoặc để trống để tạo mới)
  </label>
  <select
    value={item.product_id}
    onChange={(e) =>
      handleItemChange(
        tabIndex,
        index,
        "product_id",
        e.target.value
      )
    }
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
  >
    <option value="">-- Tạo sản phẩm mới --</option>
    {Array.isArray(products) &&
      products.map((product) => (
        <option key={product.id} value={product.id}>
          {product.name} - Size: {product.size || "N/A"}
        </option>
      ))}
  </select>
</div>
```

**THAY BẰNG:**
```jsx
<div>
  <SearchableSelect
    options={products}
    value={item.product_id}
    onChange={(value) =>
      handleItemChange(
        tabIndex,
        index,
        "product_id",
        value
      )
    }
    label="Chọn sản phẩm có sẵn (hoặc để trống để tạo mới)"
    placeholder="-- Tạo sản phẩm mới --"
    searchPlaceholder="Tìm sản phẩm (tên, size, thương hiệu)..."
    getOptionLabel={(product) =>
      `${product.name} - ${product.brand || "N/A"} - Size: ${product.size || "N/A"}`
    }
    className="text-sm"
  />
</div>
```

---

### 2. PurchaseInvoices.jsx - Input danh mục

**Vị trí**: Khoảng dòng 1078-1102

**TÌM đoạn code này:**
```jsx
<div>
  <label className="block text-xs text-gray-600 mb-1">
    Danh mục *
  </label>
  <select
    required={!item.product_id}
    value={item.category_id}
    onChange={(e) =>
      handleItemChange(
        tabIndex,
        index,
        "category_id",
        e.target.value
      )
    }
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
  >
    <option value="">Chọn danh mục</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>
```

**THAY BẰNG:**
```jsx
<div>
  <SearchableSelect
    options={categories}
    value={item.category_id}
    onChange={(value) =>
      handleItemChange(
        tabIndex,
        index,
        "category_id",
        value
      )
    }
    label="Danh mục"
    placeholder="Chọn danh mục"
    searchPlaceholder="Tìm danh mục..."
    required={!item.product_id}
    className="text-sm"
  />
</div>
```

---

### 3. SalesInvoices.jsx - Input chọn sản phẩm

**Vị trí**: Tìm trong form thêm hóa đơn bán

**TÌM đoạn code này:**
```jsx
<select
  required
  value={item.product_id}
  onChange={(e) =>
    handleItemChange(tabIndex, itemIndex, "product_id", e.target.value)
  }
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
>
  <option value="">Chọn sản phẩm</option>
  {products.map((product) => (
    <option key={product.id} value={product.id}>
      {product.name} - {product.brand} (Size {product.size})
    </option>
  ))}
</select>
```

**THAY BẰNG:**
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

---

## 🔍 Cách tìm nhanh

### Sử dụng Find (Ctrl+F):

1. **PurchaseInvoices.jsx**:
   - Tìm: `Chọn sản phẩm có sẵn`
   - Tìm: `Danh mục *` (trong phần tạo sản phẩm mới)

2. **SalesInvoices.jsx**:
   - Tìm: `Chọn sản phẩm`
   - Hoặc tìm: `{products.map((product)`

---

## ✨ Lợi ích sau khi áp dụng

### PurchaseInvoices (Hóa đơn nhập):
- ✅ Tìm kiếm sản phẩm có sẵn nhanh chóng
- ✅ Tìm kiếm danh mục khi tạo sản phẩm mới
- ✅ Hiển thị thông tin đầy đủ: tên, thương hiệu, size

### SalesInvoices (Hóa đơn bán):
- ✅ Tìm kiếm sản phẩm để bán
- ✅ Hiển thị giá bán ngay trong dropdown
- ✅ Dễ dàng chọn sản phẩm trong danh sách dài

---

## 🎨 Tùy chỉnh nâng cao (Tùy chọn)

### Hiển thị ảnh sản phẩm trong dropdown

Thay `getOptionLabel` bằng `renderOption`:

```jsx
<SearchableSelect
  options={products}
  value={item.product_id}
  onChange={(value) => handleItemChange(tabIndex, itemIndex, "product_id", value)}
  label="Sản phẩm"
  placeholder="Chọn sản phẩm"
  searchPlaceholder="Tìm sản phẩm..."
  renderOption={(product) => (
    <div className="flex items-center space-x-3 py-1">
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
  required
/>
```

---

## 🧪 Test sau khi áp dụng

1. **Mở form thêm hóa đơn nhập**:
   - Click vào dropdown sản phẩm
   - Gõ tên sản phẩm để tìm kiếm
   - Kiểm tra kết quả lọc đúng

2. **Tạo sản phẩm mới trong hóa đơn nhập**:
   - Để trống sản phẩm
   - Click vào dropdown danh mục
   - Tìm kiếm danh mục

3. **Mở form thêm hóa đơn bán**:
   - Click vào dropdown sản phẩm
   - Tìm kiếm sản phẩm
   - Kiểm tra giá hiển thị đúng

---

## ❓ Troubleshooting

### Lỗi: "products is not defined"
- Đảm bảo `products` đã được fetch và là array
- Kiểm tra: `Array.isArray(products)`

### Dropdown không hiển thị
- Kiểm tra console có lỗi không
- Đảm bảo import SearchableSelect đúng

### Tìm kiếm không hoạt động
- Kiểm tra `getOptionLabel` trả về string
- Đảm bảo không có lỗi trong console

---

## 📚 Tài liệu tham khảo

- `SEARCHABLE_SELECT_IMPLEMENTATION.md` - Chi tiết component
- `SEARCHABLE_SELECT_USAGE_GUIDE.md` - Hướng dẫn sử dụng
- `SEARCHABLE_SELECT_SUMMARY.md` - Tóm tắt

---

## ✅ Checklist

- [ ] PurchaseInvoices - Input chọn sản phẩm
- [ ] PurchaseInvoices - Input danh mục
- [ ] SalesInvoices - Input chọn sản phẩm
- [ ] Test tìm kiếm hoạt động
- [ ] Test chọn sản phẩm
- [ ] Test xóa lựa chọn (clear button)
- [ ] Test keyboard (ESC, typing)
- [ ] Test trên mobile

---

Sau khi thay thế xong, hãy test kỹ để đảm bảo mọi thứ hoạt động tốt! 🚀
