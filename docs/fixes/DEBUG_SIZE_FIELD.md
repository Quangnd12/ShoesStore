# Debug Guide - Size Field Not Showing

## Vấn đề

Sizes hiển thị "N/A" thay vì giá trị thực tế (40, 41, 42, 43, 44).

## Nguyên nhân có thể

1. **Field name khác**: API trả về field có tên khác với `size`
2. **Nested object**: Size nằm trong object con
3. **Data type**: Size là number nhưng code expect string
4. **Null/undefined**: Size có giá trị null hoặc undefined

## Cách Debug

### Bước 1: Mở Browser Console

1. Mở modal "Chi tiết hóa đơn nhập"
2. Mở Developer Tools (F12)
3. Chuyển sang tab Console
4. Tìm log: `=== GroupedProductVariants Debug ===`

### Bước 2: Xem Structure

Trong console, bạn sẽ thấy:

```javascript
=== GroupedProductVariants Debug ===
First item: {
  id: 123,
  product_name: "Giày Trắng Nike",
  quantity: 1,
  unit_cost: 145000,
  size: "40.0",  // <-- TÌM FIELD NÀY!
  // hoặc
  Size: "40.0",
  // hoặc
  product_size: "40.0",
  // hoặc có thể nằm trong object con
  product: {
    size: "40.0"
  }
}
All keys: ["id", "product_name", "quantity", "unit_cost", "size", ...]
```

### Bước 3: Tìm Field Name

Xem trong `All keys` array, tìm field nào liên quan đến size:
- `size`
- `Size`
- `product_size`
- `variant_size`
- `SIZE`
- `productSize`
- Hoặc tên khác?

### Bước 4: Cập nhật Code

Nếu field name khác, cập nhật trong `GroupedProductVariants.jsx`:

**Tìm dòng:**
```javascript
const size = item.size || item.Size || item.product_size || item.variant_size || item.SIZE;
```

**Thêm field name mới:**
```javascript
const size = item.size || item.Size || item.YOUR_FIELD_NAME || item.product_size;
```

## Các Trường Hợp Đặc Biệt

### Case 1: Size là Number

Nếu size là number (40 thay vì "40"):

```javascript
const size = String(item.size || item.Size || "");
```

### Case 2: Size trong Nested Object

Nếu size nằm trong object con:

```javascript
const size = item.size || item.product?.size || item.variant?.size;
```

### Case 3: Size là Array

Nếu size là array:

```javascript
const size = Array.isArray(item.size) ? item.size[0] : item.size;
```

### Case 4: Size với Format Khác

Nếu size có format khác (ví dụ: "Size 40"):

```javascript
const size = (item.size || "").replace("Size ", "");
```

## Quick Fix

Nếu không tìm ra field name, thử cách này:

```javascript
// Trong GroupedProductVariants.jsx
const size = Object.entries(item).find(([key, value]) => 
  key.toLowerCase().includes('size') && value
)?.[1];
```

Cách này sẽ tìm bất kỳ field nào có chứa "size" trong tên.

## Test Cases

### Test 1: Check Console Logs

```
✅ Console shows: First item: {...}
✅ Console shows: All keys: [...]
✅ Can see size field in the object
```

### Test 2: Check Field Value

```javascript
// In console, type:
items[0].size
// Should return: "40.0" or 40 or something

// Try other variations:
items[0].Size
items[0].product_size
items[0].variant_size
```

### Test 3: Check Data Type

```javascript
// In console:
typeof items[0].size
// Should return: "string" or "number"
```

## Common Solutions

### Solution 1: Field Name is Different

```javascript
// If field is "product_size"
const size = item.product_size;
```

### Solution 2: Need to Convert Type

```javascript
// If size is number
const size = String(item.size);
```

### Solution 3: Nested Object

```javascript
// If size is in product object
const size = item.product?.size;
```

### Solution 4: Multiple Sources

```javascript
// Try all possible sources
const size = item.size || 
              item.Size || 
              item.product_size || 
              item.variant_size || 
              item.product?.size ||
              item.variant?.size;
```

## After Finding the Field

1. Update `GroupedProductVariants.jsx`
2. Remove console.log statements
3. Test again
4. Verify sizes show correctly

## Contact Info

Nếu vẫn không fix được, gửi cho tôi:
1. Screenshot của console log
2. Copy/paste object structure từ console
3. Tôi sẽ giúp fix chính xác

## Expected Result

After fix:
```
✅ Sizes: 40, 41, 42, 43, 44 (instead of empty)
✅ Table shows: [40] [41] [42] [43] [44] (instead of N/A)
```
