# Hướng dẫn triển khai các tính năng mới

## 1. Sửa lỗi "Data too long for column 'image_url'"

### Bước 1: Chạy migration SQL

Mở MySQL và chạy file migration:

```bash
mysql -u root -p shoesstore < backend/src/database/migrations/001_increase_image_url_size.sql
```

Hoặc chạy trực tiếp trong MySQL:

```sql
USE shoesstore;
ALTER TABLE products MODIFY COLUMN image_url MEDIUMTEXT COMMENT 'URL hoặc base64 của ảnh sản phẩm';
```

### Giải thích:
- Thay đổi kiểu dữ liệu từ `VARCHAR(255)` sang `MEDIUMTEXT`
- `MEDIUMTEXT` có thể chứa tới 16MB dữ liệu
- Đủ để lưu ảnh base64 đã được compress (~200KB)

---

## 2. Tính năng cảnh báo khi thoát form có dữ liệu

### Đã triển khai cho:
- ✅ Suppliers (Nhà cung cấp)

### Cần triển khai thêm cho:
- Products
- Purchase Invoices  
- Sales Invoices

### Cách hoạt động:

1. **Hook `useFormDirty`**: Theo dõi form có thay đổi hay không
2. **Component `ConfirmDialog`**: Hiển thị dialog xác nhận
3. **Logic xử lý**:
   - Khi user click nút X, click ra ngoài modal, hoặc nhấn ESC
   - Nếu form có thay đổi → hiển thị dialog xác nhận
   - Nếu form chưa thay đổi → đóng modal trực tiếp

### Ví dụ code (đã áp dụng cho Suppliers):

```javascript
import { useFormDirty } from "../hooks/useFormDirty";
import ConfirmDialog from "../components/ConfirmDialog";

// Trong component:
const isDirty = useFormDirty(formData, editingSupplier || initialFormData);
const [showConfirmDialog, setShowConfirmDialog] = useState(false);

const handleCloseModal = () => {
  if (isDirty) {
    setShowConfirmDialog(true);
  } else {
    setShowModal(false);
    resetForm();
  }
};
```

---

## 3. Tính năng tự động tạo sizes cho Purchase Invoices

### Component: `SizeGenerator`

Đã tạo component `frontend/src/components/SizeGenerator.jsx`

### Tính năng:
- Nhập size bắt đầu (VD: 36)
- Nhập số lượng size cần tạo (VD: 5)
- Chọn bước nhảy (0.5 hoặc 1.0)
- Tự động tạo: 36 → 36.5 → 37 → 37.5 → 38

### Cách tích hợp vào PurchaseInvoices:

```javascript
import SizeGenerator from "../components/SizeGenerator";

// Trong form, thêm component:
<SizeGenerator
  onGenerate={(sizes) => {
    // sizes = ["36.0", "36.5", "37.0", "37.5", "38.0"]
    const newVariants = sizes.map(size => ({
      size: size,
      quantity: "",
      unit_cost: item.variants[0]?.unit_cost || ""
    }));
    
    // Cập nhật variants
    const newTabs = [...tabs];
    newTabs[tabIndex].data.items[itemIndex].variants = newVariants;
    setTabs(newTabs);
  }}
/>
```

---

## 4. Multi-Invoice Tab Management cho Sales Invoices

### Hiện trạng:
- Purchase Invoices đã có DynamicTabs
- Sales Invoices chưa có

### Cần làm:

1. **Import DynamicTabs**:
```javascript
import DynamicTabs from "../components/DynamicTabs";
```

2. **Chuyển formData thành tabs structure**:
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

3. **Thêm handlers**:
```javascript
const handleAddTab = () => {
  setTabs([...tabs, {
    label: `Hóa đơn ${tabs.length + 1}`,
    data: { /* initial data */ }
  }]);
};

const handleTabClose = (index) => {
  if (tabs.length > 1) {
    setTabs(tabs.filter((_, i) => i !== index));
  }
};
```

4. **Cập nhật form submit**:
```javascript
const handleSubmit = async (e, tabIndex) => {
  e.preventDefault();
  const tabData = tabs[tabIndex].data;
  // Submit logic...
};
```

---

## 5. Tối ưu giao diện

### Đã thực hiện:

1. **ConfirmDialog**: Dialog xác nhận đẹp hơn với animation
2. **SizeGenerator**: UI trực quan với màu sắc phân biệt
3. **Keyboard shortcuts**: ESC để đóng modal

### Cần cải thiện thêm:

1. **Loading states**: Thêm spinner khi submit form
2. **Toast notifications**: Thông báo thành công/lỗi rõ ràng hơn
3. **Form validation**: Highlight field lỗi
4. **Responsive**: Tối ưu cho mobile

---

## Checklist triển khai

### Bước 1: Database Migration
- [ ] Chạy migration SQL để tăng kích thước image_url
- [ ] Kiểm tra: `DESCRIBE products;` trong MySQL

### Bước 2: Cảnh báo thoát form
- [x] Suppliers - Đã hoàn thành
- [ ] Products - Cần triển khai
- [ ] Purchase Invoices - Cần triển khai  
- [ ] Sales Invoices - Cần triển khai

### Bước 3: Size Generator
- [x] Component đã tạo
- [ ] Tích hợp vào Purchase Invoices
- [ ] Test với nhiều trường hợp

### Bước 4: Multi-Tab Sales Invoices
- [ ] Chuyển đổi structure sang tabs
- [ ] Implement handlers
- [ ] Test tạo nhiều hóa đơn cùng lúc

### Bước 5: Testing
- [ ] Test upload ảnh lớn
- [ ] Test cảnh báo thoát form
- [ ] Test tạo sizes tự động
- [ ] Test multi-tab invoices

---

## Lưu ý quan trọng

1. **Backup database** trước khi chạy migration
2. **Test kỹ** trên môi trường dev trước khi deploy
3. **Image compression**: Frontend đã có logic compress, nhưng nên kiểm tra lại
4. **Performance**: Với MEDIUMTEXT, cần index tốt cho query nhanh

---

## Các file đã tạo/sửa

### Đã tạo:
1. `backend/src/database/migrations/001_increase_image_url_size.sql`
2. `frontend/src/hooks/useFormDirty.js`
3. `frontend/src/components/ConfirmDialog.jsx`
4. `frontend/src/components/SizeGenerator.jsx`

### Đã sửa:
1. `frontend/src/pages/Suppliers.jsx` - Thêm cảnh báo thoát form

### Cần sửa tiếp:
1. `frontend/src/pages/ProductsEnhanced.jsx`
2. `frontend/src/pages/PurchaseInvoices.jsx`
3. `frontend/src/pages/SalesInvoices.jsx`
