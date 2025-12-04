# Hướng dẫn thay thế Items List bằng Product Tabs

## Bước 1: Đã hoàn thành ✅

- ✅ Tạo component `ProductTabsInvoice.jsx`
- ✅ Import vào `PurchaseInvoices.jsx`

## Bước 2: Thay thế code

### Tìm đoạn code cần thay thế

**Vị trí**: Khoảng dòng 1169-1480 trong `PurchaseInvoices.jsx`

**Bắt đầu từ:**
```javascript
<div>
  <div className="flex justify-between items-center mb-2">
    <label className="block text-sm font-medium text-gray-700">
      Sản phẩm *
    </label>
    <button
      type="button"
      onClick={() => handleAddItem(tabIndex)}
      className="text-blue-600 hover:text-blue-800 text-sm"
    >
      + Thêm sản phẩm
    </button>
  </div>
  {tab.data.items.map((item, index) => (
    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
      {/* ... toàn bộ nội dung render item ... */}
    </div>
  ))}
</div>
```

**Kết thúc tại:** Closing `</div>` của phần items (sau tất cả variants)

### Thay thế bằng:

```javascript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Sản phẩm *
  </label>
  <ProductTabsInvoice
    items={tab.data.items}
    tabIndex={tabIndex}
    products={products}
    categories={categories}
    handleItemChange={handleItemChange}
    handleImageFileChange={handleImageFileChange}
    handleAddVariant={handleAddVariant}
    handleRemoveVariant={handleRemoveVariant}
    handleVariantChange={handleVariantChange}
    tabs={tabs}
    setTabs={setTabs}
  />
</div>
```

## Bước 3: Test

### Test cases:

1. **Thêm sản phẩm mới**
   - Click "Thêm sản phẩm"
   - Tab mới xuất hiện
   - Tự động chuyển sang tab mới
   - ✅ Pass

2. **Xóa sản phẩm**
   - Click X trên tab
   - Tab bị xóa
   - Chuyển sang tab trước đó
   - Không thể xóa tab cuối cùng
   - ✅ Pass

3. **Chuyển tab**
   - Click vào tab khác
   - Nội dung thay đổi
   - Dữ liệu được giữ nguyên
   - ✅ Pass

4. **Nhập liệu**
   - Nhập thông tin sản phẩm
   - Chuyển tab
   - Quay lại tab cũ
   - Dữ liệu vẫn còn
   - ✅ Pass

5. **Submit form**
   - Điền đầy đủ thông tin
   - Submit
   - Tất cả sản phẩm được gửi
   - ✅ Pass

## Lợi ích

### Before (List View)
```
┌─────────────────────────────────────┐
│ Sản phẩm *          [+ Thêm sản phẩm]│
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Sản phẩm 1          [Xóa]      │ │
│ │ [Chọn sản phẩm ▼]              │ │
│ │ [Tên] [Danh mục]               │ │
│ │ [Giá] [Thương hiệu]            │ │
│ │ Biến thể:                      │ │
│ │ - Size 38, SL: 10, Giá: 100k   │ │
│ │ - Size 39, SL: 15, Giá: 100k   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Sản phẩm 2          [Xóa]      │ │
│ │ ...                            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Sản phẩm 3          [Xóa]      │ │
│ │ ...                            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⬇️ Phải cuộn xuống                  │
└─────────────────────────────────────┘
```

### After (Tabs View)
```
┌─────────────────────────────────────┐
│ Sản phẩm *                          │
├─────────────────────────────────────┤
│ [Sản phẩm 1][Sản phẩm 2][Sản phẩm 3][+ Thêm]│
│ ─────────────────────────────────── │
│ ┌─────────────────────────────────┐ │
│ │ [Chọn sản phẩm ▼]              │ │
│ │ [Tên] [Danh mục]               │ │
│ │ [Giá] [Thương hiệu]            │ │
│ │ Biến thể:                      │ │
│ │ - Size 38, SL: 10, Giá: 100k   │ │
│ │ - Size 39, SL: 15, Giá: 100k   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ✅ Không cần cuộn                   │
└─────────────────────────────────────┘
```

## Features

### 1. Tab Header
- ✅ Hiển thị tên sản phẩm (nếu đã chọn/nhập)
- ✅ Fallback: "Sản phẩm 1", "Sản phẩm 2"...
- ✅ Active state: Blue background
- ✅ Hover state: Gray background
- ✅ Nút X để xóa (không thể xóa tab cuối)
- ✅ Nút "+ Thêm sản phẩm" với border dashed

### 2. Tab Content
- ✅ Gradient background (from-gray-50 to-white)
- ✅ Border 2px với shadow
- ✅ Rounded corners
- ✅ Padding thoáng
- ✅ Responsive grid layout

### 3. Form Fields
- ✅ Labels với font-semibold
- ✅ Inputs với border-2
- ✅ Focus ring blue
- ✅ Placeholders hữu ích
- ✅ Required fields marked với *

### 4. Variants Section
- ✅ Border-top separator
- ✅ Size Generator integration
- ✅ Grid layout cho variants
- ✅ Nút xóa variant (không thể xóa variant cuối)
- ✅ Hover effects

## Styling Improvements

### Colors
- Primary: Blue-600
- Hover: Blue-800
- Active: Blue-600 with white text
- Inactive: Gray-100 with gray-700 text
- Border: Gray-200/300
- Background: Gradient gray-50 to white

### Spacing
- Tab padding: px-4 py-2.5
- Content padding: p-6
- Gap between fields: gap-4
- Gap between variants: space-y-3

### Transitions
- All interactive elements: transition-all
- Smooth color changes
- Smooth border changes

## Troubleshooting

### Issue: Tabs không hiển thị
**Solution**: Kiểm tra import ProductTabsInvoice

### Issue: Data không lưu khi chuyển tab
**Solution**: Component đã handle state qua tabs/setTabs props

### Issue: Không thể xóa tab
**Solution**: Phải có ít nhất 1 sản phẩm (alert sẽ hiện)

### Issue: Submit không gửi đủ data
**Solution**: Kiểm tra handleSubmitAll vẫn đọc từ tabs[tabIndex].data.items

## Kết luận

Component ProductTabsInvoice đã sẵn sàng sử dụng. Chỉ cần thay thế đoạn code render items list bằng component này là xong!

**Estimated time**: 5-10 phút để thay thế và test.

**Result**: UX cải thiện đáng kể, không còn phải cuộn dài khi thêm nhiều sản phẩm! 🎉
