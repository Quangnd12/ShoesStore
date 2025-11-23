# Hướng dẫn thêm Multi-Tab cho Sales Invoices

## Thay đổi cần thực hiện

### 1. Import DynamicTabs

```javascript
import DynamicTabs from "../components/DynamicTabs";
```

### 2. Thay đổi state structure

**Từ:**
```javascript
const [formData, setFormData] = useState({
  invoice_number: "",
  invoice_date: new Date().toISOString().split("T")[0],
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  notes: "",
  items: [{ product_id: "", quantity: "", unit_price: "" }],
});
```

**Thành:**
```javascript
const [tabs, setTabs] = useState([
  {
    label: "Hóa đơn 1",
    data: {
      invoice_number: "",
      invoice_date: new Date().toISOString().split("T")[0],
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      notes: "",
      items: [{ product_id: "", quantity: "", unit_price: "" }],
    },
  },
]);
```

### 3. Thêm handlers cho tabs

```javascript
const handleAddTab = async () => {
  const invoiceNumber = await generateInvoiceNumber();
  setTabs([
    ...tabs,
    {
      label: `Hóa đơn ${tabs.length + 1}`,
      data: {
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString().split("T")[0],
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        notes: "",
        items: [{ product_id: "", quantity: "", unit_price: "" }],
      },
    },
  ]);
};

const handleTabClose = (index) => {
  if (tabs.length > 1) {
    setTabs(tabs.filter((_, i) => i !== index));
  }
};

const handleTabChange = (index) => {
  // Optional: Track active tab
};
```

### 4. Cập nhật handlers cho items

**Từ:**
```javascript
const handleAddItem = () => {
  setFormData({
    ...formData,
    items: [...formData.items, { product_id: "", quantity: "", unit_price: "" }],
  });
};
```

**Thành:**
```javascript
const handleAddItem = (tabIndex) => {
  const newTabs = [...tabs];
  newTabs[tabIndex].data.items.push({
    product_id: "",
    quantity: "",
    unit_price: "",
  });
  setTabs(newTabs);
};
```

**Tương tự cho:**
- `handleRemoveItem(tabIndex, itemIndex)`
- `handleItemChange(tabIndex, itemIndex, field, value)`
- `handleTabDataChange(tabIndex, field, value)`

### 5. Cập nhật form submit

**Từ:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const items = formData.items.map(/* ... */);
  await salesInvoicesAPI.create({ ...formData, items });
  // ...
};
```

**Thành:**
```javascript
const handleSubmit = async (e, tabIndex) => {
  e.preventDefault();
  const tabData = tabs[tabIndex].data;
  const items = tabData.items.map(/* ... */);
  await salesInvoicesAPI.create({ ...tabData, items });
  
  // Remove submitted tab
  const newTabs = tabs.filter((_, i) => i !== tabIndex);
  if (newTabs.length === 0) {
    setShowModal(false);
    await resetAllTabs();
  } else {
    setTabs(newTabs);
  }
  // ...
};
```

### 6. Cập nhật JSX modal

**Từ:**
```jsx
{showModal && (
  <div className="fixed inset-0 ...">
    <div className="bg-white ...">
      <h2>Thêm hóa đơn bán hàng</h2>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </div>
  </div>
)}
```

**Thành:**
```jsx
{showModal && (
  <div className="fixed inset-0 ...">
    <div className="bg-white ...">
      <div className="flex justify-between items-center mb-4">
        <h2>Thêm hóa đơn bán hàng</h2>
        <button onClick={() => setShowModal(false)}>
          <X size={24} />
        </button>
      </div>
      
      <DynamicTabs
        tabs={tabs}
        onTabChange={handleTabChange}
        onTabClose={handleTabClose}
        onAddTab={handleAddTab}
        renderTabContent={(tab, tabIndex) => (
          <form onSubmit={(e) => handleSubmit(e, tabIndex)}>
            {/* Form fields - replace formData with tab.data */}
            {/* Replace onChange handlers to use tabIndex */}
          </form>
        )}
      />
    </div>
  </div>
)}
```

### 7. Cập nhật tất cả references

Tìm và thay thế:
- `formData.` → `tab.data.`
- `setFormData` → `handleTabDataChange(tabIndex, ...)`
- `formData.items` → `tab.data.items`
- `handleAddItem()` → `handleAddItem(tabIndex)`
- `handleRemoveItem(index)` → `handleRemoveItem(tabIndex, index)`
- `handleItemChange(index, ...)` → `handleItemChange(tabIndex, index, ...)`

### 8. Cập nhật resetForm

```javascript
const resetAllTabs = async () => {
  const invoiceNumber = await generateInvoiceNumber();
  setTabs([
    {
      label: "Hóa đơn 1",
      data: {
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString().split("T")[0],
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        notes: "",
        items: [{ product_id: "", quantity: "", unit_price: "" }],
      },
    },
  ]);
};
```

## Lợi ích của Multi-Tab

1. **Tạo nhiều hóa đơn cùng lúc**: User có thể chuẩn bị nhiều hóa đơn trước khi submit
2. **Không mất dữ liệu**: Chuyển tab không làm mất dữ liệu đã nhập
3. **Hiệu quả hơn**: Giảm thời gian nhập liệu khi có nhiều hóa đơn
4. **UX tốt hơn**: Giống với Purchase Invoices, tạo consistency

## Testing

1. Tạo 1 hóa đơn → Submit → OK
2. Tạo 3 hóa đơn → Submit từng cái → OK
3. Tạo 2 hóa đơn → Đóng tab 1 → Submit tab 2 → OK
4. Tạo hóa đơn → Click X → Confirm dialog → OK
5. Tạo hóa đơn → ESC → Confirm dialog → OK
