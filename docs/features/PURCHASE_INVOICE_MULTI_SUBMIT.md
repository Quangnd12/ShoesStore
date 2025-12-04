# Cải tiến Hóa đơn nhập hàng - Multi-submit & Nhập giá nhanh

## Vấn đề đã khắc phục

### 1. Không thể tạo nhiều hóa đơn cùng lúc
**Vấn đề**: Dù có nhiều tab hóa đơn, hệ thống chỉ tạo được 1 hóa đơn tại một thời điểm.

**Giải pháp**: 
- Thêm nút "Tạo tất cả X hóa đơn" để submit tất cả tabs cùng lúc
- Cập nhật logic để xóa từng tab sau khi submit thành công
- Hiển thị kết quả chi tiết (thành công/thất bại)

### 2. Phải nhập giá từng biến thể size
**Vấn đề**: Khi tạo nhiều biến thể size, phải nhập "Giá nhập đơn vị" cho từng size một, rất mất thời gian.

**Giải pháp**:
- Thêm 2 trường mới trong SizeGenerator:
  - "SL mỗi size": Số lượng mặc định cho tất cả size
  - "Giá nhập/đơn vị": Giá nhập mặc định cho tất cả size
- Tự động điền giá trị cho tất cả biến thể khi generate

## Thay đổi chi tiết

### 1. Component: `SizeGenerator.jsx`

#### Thêm 2 trường input mới
```javascript
const [defaultQuantity, setDefaultQuantity] = useState("");
const [defaultUnitCost, setDefaultUnitCost] = useState("");
```

#### Cập nhật hàm generate
```javascript
const handleGenerate = () => {
  // ... validation ...
  
  const sizes = [];
  for (let i = 0; i < num; i++) {
    sizes.push({
      size: (start + i * inc).toFixed(1),
      quantity: defaultQuantity || "",
      unit_cost: defaultUnitCost || "",
    });
  }
  
  onGenerate(sizes);
};
```

#### Giao diện mới
- Grid 6 cột thay vì 4 cột
- Thêm 2 input: "SL mỗi size" và "Giá nhập/đơn vị"
- Hint text: "💡 Nhập SL và Giá để tự động điền cho tất cả biến thể"

### 2. Page: `PurchaseInvoices.jsx`

#### Hàm `handleSubmit` - Submit 1 hóa đơn
**Thay đổi**:
- Xóa tab đã submit thành công
- Nếu còn tabs khác, giữ modal mở
- Nếu hết tabs, đóng modal và reset
- Điều chỉnh `activeTabIndex` sau khi xóa tab

#### Hàm `handleSubmitAll` - Submit tất cả hóa đơn
**Logic**:
```javascript
const handleSubmitAll = async () => {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Loop qua tất cả tabs
  for (let i = 0; i < tabs.length; i++) {
    try {
      // Tạo hóa đơn
      await purchaseInvoicesAPI.create({...});
      successCount++;
    } catch (error) {
      errorCount++;
      errors.push(`${tabs[i].label}: ${error.message}`);
    }
  }

  // Đóng modal và reset
  // Hiển thị kết quả
  if (errorCount === 0) {
    showToast(`Tạo thành công ${successCount} hóa đơn!`, "success");
  } else if (successCount === 0) {
    showToast(`Tất cả ${errorCount} hóa đơn đều thất bại!`, "error");
  } else {
    showToast(
      `Thành công ${successCount}, thất bại ${errorCount}. ${errors.join("; ")}`,
      "warning"
    );
  }
};
```

#### UI mới
```javascript
<div className="flex justify-between items-center pt-4">
  <div>
    {tabs.length > 1 && (
      <button onClick={handleSubmitAll} className="bg-green-600">
        <Plus /> Tạo tất cả {tabs.length} hóa đơn
      </button>
    )}
  </div>
  <div className="flex space-x-3">
    <button>Hủy (ESC)</button>
    <button type="submit">Tạo hóa đơn này</button>
  </div>
</div>
```

## Giao diện mới

### SizeGenerator
```
┌─────────────────────────────────────────────────────────────────┐
│ 🚀 Tạo nhanh nhiều size                                         │
├─────────────────────────────────────────────────────────────────┤
│ Size bắt đầu │ Số lượng size │ Bước nhảy │ SL mỗi size │ Giá nhập │ │
│     36       │      5        │    0.5    │     10      │  50000   │ Tạo │
├─────────────────────────────────────────────────────────────────┤
│ 💡 Nhập "SL mỗi size" và "Giá nhập/đơn vị" để tự động điền     │
└─────────────────────────────────────────────────────────────────┘
```

### Nút submit
```
┌─────────────────────────────────────────────────────────────────┐
│ [+ Tạo tất cả 3 hóa đơn]              [Hủy] [Tạo hóa đơn này]  │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow mới

### Tạo nhiều hóa đơn
1. Click "Thêm hóa đơn nhập"
2. Điền thông tin hóa đơn 1
3. Click "+" để thêm tab mới (Sản phẩm 2, 3, ...)
4. Điền thông tin cho các hóa đơn khác
5. Click "Tạo tất cả X hóa đơn" → Tất cả được tạo cùng lúc
6. Xem kết quả: "Tạo thành công 3 hóa đơn!"

### Nhập giá nhanh cho biến thể
1. Trong form sản phẩm, mở "🚀 Tạo nhanh nhiều size"
2. Nhập:
   - Size bắt đầu: 36
   - Số lượng size: 5
   - Bước nhảy: 0.5
   - **SL mỗi size: 10** ← Mới
   - **Giá nhập/đơn vị: 50000** ← Mới
3. Click "Tạo"
4. Hệ thống tạo 5 biến thể:
   - Size 36.0, SL: 10, Giá: 50000
   - Size 36.5, SL: 10, Giá: 50000
   - Size 37.0, SL: 10, Giá: 50000
   - Size 37.5, SL: 10, Giá: 50000
   - Size 38.0, SL: 10, Giá: 50000

## Lợi ích

1. **Tiết kiệm thời gian**: Tạo nhiều hóa đơn cùng lúc thay vì từng cái một
2. **Giảm lỗi**: Không cần nhập giá từng size, giảm sai sót
3. **Hiệu quả cao**: Nhập hàng nhanh hơn 3-5 lần
4. **Trải nghiệm tốt**: UI rõ ràng, dễ sử dụng
5. **Báo cáo chi tiết**: Biết chính xác hóa đơn nào thành công/thất bại

## File thay đổi

- `frontend/src/components/SizeGenerator.jsx`
  - Thêm 2 state: `defaultQuantity`, `defaultUnitCost`
  - Cập nhật UI: Grid 6 cột
  - Cập nhật logic: Generate với quantity và unit_cost

- `frontend/src/pages/PurchaseInvoices.jsx`
  - Cập nhật `handleSubmit`: Xóa tab sau khi submit
  - Thêm `handleSubmitAll`: Submit tất cả tabs
  - Cập nhật UI: Thêm nút "Tạo tất cả X hóa đơn"
  - Cập nhật callback SizeGenerator: Nhận variants thay vì sizes
