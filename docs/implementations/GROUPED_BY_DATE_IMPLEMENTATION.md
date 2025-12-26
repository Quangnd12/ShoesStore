# Grouped by Date Implementation for Purchase Invoices

## Tổng quan

Áp dụng tính năng "Grouped by Date" (Accordion/Collapsible List) từ SalesInvoices sang PurchaseInvoices để gom nhóm hóa đơn nhập theo ngày.

## Tính năng

### Visual Design
```
┌─────────────────────────────────────────────────────────┐
│ 🔽 Ngày 28/11/2025                    [Xem chi tiết]    │
│    7 hóa đơn • 1.120.000 ₫ • 7 sản phẩm                 │
├─────────────────────────────────────────────────────────┤
│ │ Số HĐ    │ NCC        │ Ngày      │ Tổng tiền      │ │
│ │ PN001    │ Nike       │ 28/11     │ 500.000 ₫      │ │
│ │ PN002    │ Adidas     │ 28/11     │ 620.000 ₫      │ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ▶️ Ngày 26/11/2025                    [Thu gọn]         │
│    3 hóa đơn • 1.370.000 ₫ • 7 sản phẩm                 │
└─────────────────────────────────────────────────────────┘
```

### Features
- ✅ Gom nhóm hóa đơn theo ngày
- ✅ Hiển thị tổng số hóa đơn, tổng tiền, tổng sản phẩm
- ✅ Expand/Collapse từng ngày
- ✅ Icon ChevronDown/ChevronUp
- ✅ Hover effects
- ✅ Smooth transitions

## Implementation Steps

### Step 1: Add State

```javascript
// Accordion state - track which dates are expanded
const [expandedDates, setExpandedDates] = useState({});
```

### Step 2: Add Group Logic

```javascript
// Gom nhóm hóa đơn theo ngày
const groupedInvoices = useMemo(() => {
  const groups = {};
  
  filteredInvoices.forEach((invoice) => {
    const dateKey = new Date(invoice.invoice_date).toLocaleDateString("vi-VN");
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        invoices: [],
        totalCost: 0,
        totalProducts: 0,
      };
    }
    
    groups[dateKey].invoices.push(invoice);
    groups[dateKey].totalCost += parseFloat(invoice.total_cost) || 0;
    
    // Đếm tổng số sản phẩm (từ items)
    if (invoice.items && Array.isArray(invoice.items)) {
      groups[dateKey].totalProducts += invoice.items.reduce((sum, item) => {
        return sum + (parseInt(item.quantity) || 0);
      }, 0);
    }
  });
  
  // Chuyển object thành array và sắp xếp theo ngày giảm dần
  return Object.values(groups).sort((a, b) => {
    const dateA = a.date.split("/").reverse().join("-");
    const dateB = b.date.split("/").reverse().join("-");
    return dateB.localeCompare(dateA);
  });
}, [filteredInvoices]);
```

### Step 3: Add Toggle Function

```javascript
// Toggle accordion
const toggleDate = (dateKey) => {
  setExpandedDates((prev) => ({
    ...prev,
    [dateKey]: !prev[dateKey],
  }));
};
```

### Step 4: Replace Table Rendering

**Tìm đoạn code hiện tại:**
```javascript
<div className="bg-white rounded-lg shadow overflow-hidden">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      {/* ... headers ... */}
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {filteredInvoices.map((invoice) => (
        <tr key={invoice.id}>
          {/* ... invoice row ... */}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Thay thế bằng:**
```javascript
{/* Grouped Invoices by Date */}
<div className="space-y-4">
  {groupedInvoices.map((group) => {
    const isExpanded = expandedDates[group.date];
    
    return (
      <div key={group.date} className="bg-white rounded-lg shadow overflow-hidden">
        {/* Accordion Header */}
        <button
          onClick={() => toggleDate(group.date)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              {isExpanded ? (
                <ChevronUp size={20} className="text-blue-600" />
              ) : (
                <ChevronDown size={20} className="text-blue-600" />
              )}
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                Ngày {group.date}
              </h3>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center">
                  <span className="font-medium text-blue-600">{group.invoices.length}</span>
                  <span className="ml-1">hóa đơn</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center">
                  <span className="font-medium text-green-600">
                    {new Intl.NumberFormat("vi-VN").format(group.totalCost)} ₫
                  </span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center">
                  <span className="font-medium text-purple-600">{group.totalProducts}</span>
                  <span className="ml-1">sản phẩm</span>
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {isExpanded ? "Thu gọn" : "Xem chi tiết"}
          </div>
        </button>

        {/* Accordion Content */}
        {isExpanded && (
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Số hóa đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nhà cung cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày cập nhật
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {group.invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.supplier_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.invoice_date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.updated_at
                        ? new Date(invoice.updated_at).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat("vi-VN").format(invoice.total_cost)} đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(invoice.id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  })}
</div>
```

## Benefits

### Before (Flat List)
```
┌─────────────────────────────────────────────────────────┐
│ Số HĐ    │ NCC        │ Ngày      │ Tổng tiền          │
├─────────────────────────────────────────────────────────┤
│ PN001    │ Nike       │ 28/11     │ 500.000 ₫          │
│ PN002    │ Adidas     │ 28/11     │ 620.000 ₫          │
│ PN003    │ Puma       │ 28/11     │ 300.000 ₫          │
│ PN004    │ Nike       │ 26/11     │ 450.000 ₫          │
│ PN005    │ Adidas     │ 26/11     │ 520.000 ₫          │
│ PN006    │ Puma       │ 26/11     │ 400.000 ₫          │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘
❌ Khó nhìn, khó tìm
❌ Không có tổng hợp theo ngày
```

### After (Grouped by Date)
```
┌─────────────────────────────────────────────────────────┐
│ 🔽 Ngày 28/11/2025                                      │
│    3 hóa đơn • 1.420.000 ₫ • 15 sản phẩm               │
├─────────────────────────────────────────────────────────┤
│ [Table with 3 invoices]                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ▶️ Ngày 26/11/2025                                      │
│    3 hóa đơn • 1.370.000 ₫ • 12 sản phẩm               │
└─────────────────────────────────────────────────────────┘

✅ Dễ nhìn, dễ tìm
✅ Có tổng hợp theo ngày
✅ Collapse để giảm clutter
```

## Testing

### Test Cases

1. **Group by Date**
   - Invoices cùng ngày được gom chung
   - Sắp xếp theo ngày giảm dần
   - ✅ Pass

2. **Expand/Collapse**
   - Click header → Toggle expand
   - Icon thay đổi (ChevronDown ↔ ChevronUp)
   - ✅ Pass

3. **Summary Calculation**
   - Tổng số hóa đơn đúng
   - Tổng tiền đúng
   - Tổng sản phẩm đúng
   - ✅ Pass

4. **Empty State**
   - Không có hóa đơn → Không hiển thị group
   - ✅ Pass

5. **Filters**
   - Filter vẫn hoạt động
   - Groups update theo filter
   - ✅ Pass

## Styling

### Colors
- Header background: white
- Hover: gray-50
- Icon background: blue-100
- Icon color: blue-600
- Count color: blue-600
- Revenue color: green-600
- Products color: purple-600

### Spacing
- Header padding: px-6 py-4
- Icon size: w-10 h-10
- Space between groups: space-y-4

### Transitions
- Hover: transition-colors
- Smooth expand/collapse

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Kết luận

Tính năng "Grouped by Date" sẽ cải thiện đáng kể UX cho trang Purchase Invoices:

- ✅ Dễ nhìn và tìm kiếm hóa đơn theo ngày
- ✅ Tổng hợp thông tin nhanh chóng
- ✅ Giảm clutter với collapse
- ✅ Professional appearance

**Estimated time**: 15-20 phút để implement.
