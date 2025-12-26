# Debug Sales Invoices - Lỗi trang trắng khi thêm tab

## Các thay đổi đã thực hiện:

### 1. Thêm useMemo để tránh re-render vô hạn
```javascript
const initialTabData = useMemo(() => ({...}), []);
const currentTabData = useMemo(() => {
  return tabs[activeTabIndex]?.data || initialTabData;
}, [tabs, activeTabIndex, initialTabData]);
```

### 2. Đơn giản hóa handleAddTab (không async)
```javascript
const handleAddTab = () => {
  setTabs([...tabs, { /* new tab */ }]);
  // Không cần setActiveTabIndex vì DynamicTabs tự động chuyển
};
```

### 3. Cập nhật handleTabChange
```javascript
const handleTabChange = (index) => {
  setActiveTabIndex(index);
};
```

### 4. Cải thiện handleTabClose
```javascript
const handleTabClose = (index) => {
  if (tabs.length > 1) {
    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);
    // Adjust activeTabIndex
    if (activeTabIndex >= newTabs.length) {
      setActiveTabIndex(Math.max(0, newTabs.length - 1));
    } else if (activeTabIndex > index) {
      setActiveTabIndex(activeTabIndex - 1);
    }
  }
};
```

### 5. Cải thiện handleSubmit
```javascript
// Adjust activeTabIndex after removing submitted tab
if (activeTabIndex === tabIndex) {
  setActiveTabIndex(Math.max(0, tabIndex - 1));
} else if (activeTabIndex > tabIndex) {
  setActiveTabIndex(activeTabIndex - 1);
}
```

## Cách test:

1. **Mở console browser (F12)**
2. **Vào Sales Invoices → Click "Thêm hóa đơn bán"**
3. **Click nút "+" để thêm tab mới**
4. **Kiểm tra console có lỗi gì không**

## Các lỗi có thể gặp:

### Lỗi 1: "Cannot read property 'data' of undefined"
- **Nguyên nhân:** `tabs[activeTabIndex]` là undefined
- **Giải pháp:** Đã thêm `?.data || initialTabData`

### Lỗi 2: "Maximum update depth exceeded"
- **Nguyên nhân:** Re-render vô hạn do object reference thay đổi
- **Giải pháp:** Đã dùng useMemo

### Lỗi 3: "generateInvoiceNumber is not a function"
- **Nguyên nhân:** Function chưa được định nghĩa
- **Giải pháp:** Đã bỏ generateInvoiceNumber trong handleAddTab

## Nếu vẫn lỗi:

### Bước 1: Kiểm tra DynamicTabs component
```bash
# Xem file này có lỗi không
frontend/src/components/DynamicTabs.jsx
```

### Bước 2: Tạm thời disable isDirty
```javascript
// Comment out dòng này
// const isDirty = useFormDirty(currentTabData, initialTabData);

// Thay bằng
const isDirty = false;
```

### Bước 3: Tạm thời disable confirm dialog
```javascript
const handleCloseModal = () => {
  // Tạm thời bỏ qua isDirty check
  setShowModal(false);
  resetAllTabs();
};
```

## Checklist debug:

- [ ] Console có lỗi gì không?
- [ ] Network tab có request nào fail không?
- [ ] React DevTools: tabs state có đúng không?
- [ ] React DevTools: activeTabIndex có đúng không?
- [ ] DynamicTabs component render đúng không?

## Nếu cần rollback:

Có thể tạm thời dùng cách đơn giản nhất (không có multi-tab):
```javascript
// Chỉ dùng 1 tab, không cho thêm/xóa
const [formData, setFormData] = useState({...});
// Không dùng tabs array
```
