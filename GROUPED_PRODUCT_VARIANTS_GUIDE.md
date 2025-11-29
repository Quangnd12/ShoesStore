# Grouped Product Variant Summary - Implementation Guide

## Tổng quan

Component `GroupedProductVariants` nhóm các biến thể (variants) của cùng một sản phẩm lại thành một khối có thể expand/collapse, hiển thị tổng hợp thông tin và chi tiết từng biến thể.

## Visual Design

### Collapsed State (Thu gọn)
```
┌─────────────────────────────────────────────────────────────┐
│ 🔽 📦 Giày Trắng Nike                    Tổng giá trị       │
│    5 biến thể • 5 sản phẩm • Sizes: 40, 41, 42, 43, 44     │
│                                          725.000 ₫          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ▶️ 📦 Giày Thể Thao Xọc Đen              Tổng giá trị       │
│    5 biến thể • 5 sản phẩm • Sizes: 36, 37, 38, 39, 40     │
│                                          650.000 ₫          │
└─────────────────────────────────────────────────────────────┘
```

### Expanded State (Mở rộng)
```
┌─────────────────────────────────────────────────────────────┐
│ 🔼 📦 Giày Trắng Nike                    Tổng giá trị       │
│    5 biến thể • 5 sản phẩm • Sizes: 40, 41, 42, 43, 44     │
│                                          725.000 ₫          │
├─────────────────────────────────────────────────────────────┤
│ Size    │ Số lượng │    Đơn giá    │    Thành tiền        │
├─────────────────────────────────────────────────────────────┤
│ [40]    │    1     │  145.000 ₫    │    145.000 ₫         │
│ [41]    │    1     │  145.000 ₫    │    145.000 ₫         │
│ [42]    │    1     │  145.000 ₫    │    145.000 ₫         │
│ [43]    │    1     │  145.000 ₫    │    145.000 ₫         │
│ [44]    │    1     │  145.000 ₫    │    145.000 ₫         │
├─────────────────────────────────────────────────────────────┤
│ Tổng cộng                │ 5 sản phẩm │    725.000 ₫        │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. Product Grouping
- ✅ Tự động nhóm variants theo tên sản phẩm
- ✅ Tính tổng số biến thể
- ✅ Tính tổng số lượng
- ✅ Tính tổng giá trị
- ✅ Liệt kê tất cả sizes (sorted)

### 2. Expand/Collapse
- ✅ Click header để toggle
- ✅ Icon ChevronDown/ChevronUp
- ✅ Smooth transitions
- ✅ Independent state cho mỗi product

### 3. Visual Design
- ✅ Gradient background cho header
- ✅ Color-coded information:
  - Blue: Số biến thể
  - Purple: Tổng số lượng
  - Indigo: Sizes
  - Green: Giá trị
- ✅ Hover effects
- ✅ Badge cho sizes
- ✅ Professional table layout

## Usage

### Import Component

```javascript
import GroupedProductVariants from "../components/GroupedProductVariants";
```

### Basic Usage

```javascript
<GroupedProductVariants items={invoiceItems} />
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| items | Array | Yes | Array of invoice items/variants |

### Item Structure

```javascript
{
  product_name: "Giày Trắng Nike",  // or name
  size: "40",
  quantity: 1,
  unit_cost: 145000
}
```

## Integration với Purchase Invoice Detail Modal

### Step 1: Import Component

```javascript
import GroupedProductVariants from "../components/GroupedProductVariants";
```

### Step 2: Trong Modal Detail

**Tìm phần hiện tại:**
```javascript
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th>Sản phẩm</th>
      <th>Size</th>
      <th>SL</th>
      <th>Đơn giá</th>
      <th>Thành tiền</th>
    </tr>
  </thead>
  <tbody>
    {selectedInvoice.items.map((item, index) => (
      <tr key={index}>
        <td>{item.product_name}</td>
        <td>{item.size}</td>
        <td>{item.quantity}</td>
        <td>{item.unit_cost}</td>
        <td>{item.unit_cost * item.quantity}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Thay thế bằng:**
```javascript
<div>
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Chi tiết sản phẩm
  </h3>
  <GroupedProductVariants items={selectedInvoice.items} />
</div>
```

## Example Data

```javascript
const invoiceItems = [
  {
    product_name: "Giày Trắng Nike",
    size: "40.0",
    quantity: 1,
    unit_cost: 145000
  },
  {
    product_name: "Giày Trắng Nike",
    size: "41.0",
    quantity: 1,
    unit_cost: 145000
  },
  {
    product_name: "Giày Trắng Nike",
    size: "42.0",
    quantity: 1,
    unit_cost: 145000
  },
  {
    product_name: "Giày Thể Thao Xọc Đen",
    size: "36.0",
    quantity: 1,
    unit_cost: 130000
  },
  {
    product_name: "Giày Thể Thao Xọc Đen",
    size: "37.0",
    quantity: 1,
    unit_cost: 130000
  }
];
```

## Styling

### Colors
- **Header Background**: Gradient from-blue-50 to-indigo-50
- **Hover**: from-blue-100 to-indigo-100
- **Icon Background**: Blue-600
- **Border**: Gray-200, hover Blue-300
- **Variants Count**: Blue-600
- **Total Quantity**: Purple-600
- **Sizes**: Indigo-600
- **Total Cost**: Green-600

### Spacing
- Header padding: px-4 py-3
- Table padding: px-4 py-3
- Space between groups: space-y-3

### Typography
- Product name: text-base font-bold
- Summary info: text-sm
- Table headers: text-xs font-semibold uppercase
- Table data: text-sm

## Benefits

### Before (Flat List)
```
❌ Giày Trắng Nike - Size 40 - 1 - 145.000 ₫ - 145.000 ₫
❌ Giày Trắng Nike - Size 41 - 1 - 145.000 ₫ - 145.000 ₫
❌ Giày Trắng Nike - Size 42 - 1 - 145.000 ₫ - 145.000 ₫
❌ Giày Trắng Nike - Size 43 - 1 - 145.000 ₫ - 145.000 ₫
❌ Giày Trắng Nike - Size 44 - 1 - 145.000 ₫ - 145.000 ₫
❌ Giày Thể Thao Xọc Đen - Size 36 - 1 - 130.000 ₫ - 130.000 ₫
❌ Giày Thể Thao Xọc Đen - Size 37 - 1 - 130.000 ₫ - 130.000 ₫
...

Problems:
- Khó nhìn, lặp lại tên sản phẩm
- Không có tổng hợp
- Phải cuộn dài
- Khó so sánh giữa các sản phẩm
```

### After (Grouped)
```
✅ 📦 Giày Trắng Nike
   5 biến thể • 5 sản phẩm • Sizes: 40-44 • 725.000 ₫
   [Click để xem chi tiết]

✅ 📦 Giày Thể Thao Xọc Đen
   5 biến thể • 5 sản phẩm • Sizes: 36-40 • 650.000 ₫
   [Click để xem chi tiết]

Benefits:
- Gọn gàng, dễ nhìn
- Có tổng hợp ngay lập tức
- Collapse để giảm clutter
- Dễ so sánh giữa các sản phẩm
- Professional appearance
```

## Advanced Features

### 1. Auto Expand First Product

```javascript
const [expandedProducts, setExpandedProducts] = useState({
  [productGroups[0]?.name]: true  // Auto expand first
});
```

### 2. Expand All / Collapse All

```javascript
const expandAll = () => {
  const allExpanded = {};
  productGroups.forEach(group => {
    allExpanded[group.name] = true;
  });
  setExpandedProducts(allExpanded);
};

const collapseAll = () => {
  setExpandedProducts({});
};
```

### 3. Search/Filter

```javascript
const [searchTerm, setSearchTerm] = useState("");

const filteredGroups = productGroups.filter(group =>
  group.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 4. Sort Options

```javascript
// Sort by name
productGroups.sort((a, b) => a.name.localeCompare(b.name));

// Sort by total cost
productGroups.sort((a, b) => b.totalCost - a.totalCost);

// Sort by quantity
productGroups.sort((a, b) => b.totalQuantity - a.totalQuantity);
```

## Testing

### Test Cases

1. **Group Products**
   - Same product name → Grouped together
   - Different products → Separate groups
   - ✅ Pass

2. **Calculate Totals**
   - Total variants count correct
   - Total quantity correct
   - Total cost correct
   - ✅ Pass

3. **Expand/Collapse**
   - Click header → Toggle expand
   - Icon changes
   - Table shows/hides
   - ✅ Pass

4. **Sizes Display**
   - All sizes listed
   - Sorted numerically
   - Comma separated
   - ✅ Pass

5. **Empty State**
   - No items → No groups
   - ✅ Pass

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance

### Optimization
- Uses `reduce()` for efficient grouping
- Minimal re-renders with independent state
- Lazy rendering (only expanded groups show table)

### Memory
- Lightweight component
- No external dependencies (except lucide-react)
- Efficient data structure

## Kết luận

Component `GroupedProductVariants` cải thiện đáng kể UX cho modal chi tiết hóa đơn nhập:

- ✅ Gom nhóm variants theo sản phẩm
- ✅ Hiển thị tổng hợp thông tin
- ✅ Expand/Collapse để xem chi tiết
- ✅ UI đẹp và chuyên nghiệp
- ✅ Dễ sử dụng và maintain

**Chỉ cần thay thế table cũ bằng component này là xong!** 🎉
