# Hướng dẫn sử dụng tính năng Hiển thị màu sắc trực quan

## Tổng quan
Tính năng hiển thị màu sắc trực quan giúp người dùng dễ dàng nhận biết màu sắc sản phẩm thông qua các biểu tượng màu thay vì chỉ đọc text. Tính năng này được tích hợp vào tất cả các trang quản lý sản phẩm và thanh toán.

## Các component màu sắc

### 🎨 ColorDisplay - Hiển thị màu đơn
Component chính để hiển thị một màu sắc duy nhất.

**Tính năng:**
- Hỗ trợ 40+ màu sắc phổ biến với tên tiếng Việt
- Tự động chuyển đổi từ tên màu sang mã hex
- 5 kích thước: xs, sm, md, lg, xl
- 3 kiểu hiển thị: circle, square, inline
- Tự động thêm viền cho màu trắng

**Sử dụng:**
```jsx
<ColorDisplay 
  color="đen" 
  size="md" 
  showLabel={true}
  style="circle"
/>
```

### 🌈 MultiColorDisplay - Hiển thị nhiều màu
Component để hiển thị danh sách màu sắc với giới hạn số lượng.

**Tính năng:**
- Hiển thị tối đa N màu (có thể cấu hình)
- Hiển thị số lượng màu còn lại (+X)
- Xử lý trường hợp không có màu

**Sử dụng:**
```jsx
<MultiColorDisplay 
  colors={["đen", "trắng", "xanh dương"]} 
  size="sm" 
  maxDisplay={3}
/>
```

### 📊 ColorWithQuantity - Màu với số lượng
Component hiển thị màu sắc kèm thông tin số lượng tồn kho.

**Sử dụng:**
```jsx
<ColorWithQuantity 
  color="đen" 
  quantity={25}
  size="md"
/>
```

## Màu sắc được hỗ trợ

### Màu cơ bản (16 màu)
| Tên tiếng Việt | Mã Hex | Hiển thị |
|----------------|--------|----------|
| Đen | #000000 | ⚫ |
| Trắng | #FFFFFF | ⚪ |
| Xám | #808080 | 🔘 |
| Đỏ | #FF0000 | 🔴 |
| Xanh dương | #0000FF | 🔵 |
| Xanh lá | #008000 | 🟢 |
| Vàng | #FFFF00 | 🟡 |
| Cam | #FFA500 | 🟠 |
| Tím | #800080 | 🟣 |
| Hồng | #FFC0CB | 🩷 |
| Nâu | #A52A2A | 🟤 |
| Xanh navy | #000080 | 🔷 |
| Xanh lam | #00FFFF | 🔷 |
| Lime | #00FF00 | 🟢 |
| Magenta | #FF00FF | 🟣 |
| Bạc | #C0C0C0 | ⚪ |

### Màu nâng cao (24+ màu)
- Vàng gold (#FFD700)
- Đỏ đậm (#8B0000)
- Xanh teal (#008080)
- Olive (#808000)
- Xanh da trời (#87CEEB)
- Tím nhạt (#DDA0DD)
- Xanh lá nhạt (#90EE90)
- Khaki (#F0E68C)
- Đỏ cà chua (#FF6347)
- Turquoise (#40E0D0)
- Coral (#FF7F50)
- Salmon (#FA8072)

## Tích hợp trong các trang

### 🛒 Trang thanh toán nhanh (QuickCheckout)

**ProductCard:**
- Hiển thị màu sắc bên cạnh size
- Tên màu hiển thị dưới giá
- Thương hiệu hiển thị góc phải

**CartItem:**
- Màu sắc hiển thị bên cạnh size trong giỏ hàng
- Kích thước nhỏ (xs) để tiết kiệm không gian

**Hóa đơn in:**
- Hiển thị tên màu trong thông tin sản phẩm
- Format: "Màu: Đen, Size: 42"

### 📦 Trang quản lý sản phẩm (ProductsEnhanced)

**Bảng sản phẩm:**
- Cột "Màu sắc" mới với MultiColorDisplay
- Hiển thị tối đa 4 màu, còn lại hiển thị "+X"
- Kích thước nhỏ (sm) phù hợp với bảng

**Modal chi tiết sản phẩm:**
- Hiển thị màu sắc dạng inline với label
- Kích thước trung bình (md) dễ nhìn

### 📋 Trang hóa đơn nhập hàng (PurchaseInvoices)

**Form thêm sản phẩm:**
- ColorPicker tích hợp nhận dạng màu từ ảnh
- Hiển thị màu được chọn trực quan
- Hỗ trợ cả chế độ một màu và nhiều màu

## Thuật toán nhận dạng màu

### 1. Chuyển đổi tên màu → Hex
```javascript
const colorMap = {
  "đen": "#000000",
  "trắng": "#FFFFFF",
  "đỏ": "#FF0000",
  // ... 40+ màu khác
};
```

### 2. Xử lý màu hex
- Tự động nhận dạng mã hex (#RRGGBB)
- Chuyển đổi về uppercase chuẩn
- Fallback về màu xám (#CCCCCC) nếu không nhận dạng được

### 3. Tìm tên màu từ hex
- So sánh với bảng màu có sẵn
- Trả về tên tiếng Việt nếu tìm thấy
- Giữ nguyên mã hex nếu không tìm thấy

### 4. Xử lý đặc biệt
- **Màu trắng**: Tự động thêm viền xám để dễ nhìn
- **Màu không xác định**: Hiển thị màu xám mặc định
- **Case-insensitive**: Không phân biệt hoa thường

## Responsive Design

### Kích thước theo thiết bị
- **Mobile**: Ưu tiên size xs, sm
- **Tablet**: Size sm, md
- **Desktop**: Size md, lg, xl

### Hiển thị trong bảng
- **Cột hẹp**: MultiColorDisplay với maxDisplay=2
- **Cột rộng**: MultiColorDisplay với maxDisplay=4
- **Mobile**: Chỉ hiển thị 1-2 màu chính

## Best Practices

### 🎯 Khi nào dùng component nào?

**ColorDisplay:**
- Hiển thị 1 màu duy nhất
- Cần hiển thị tên màu
- Trong form, modal chi tiết

**MultiColorDisplay:**
- Sản phẩm có nhiều màu
- Trong bảng, danh sách
- Cần tiết kiệm không gian

**ColorWithQuantity:**
- Quản lý tồn kho
- Báo cáo theo màu
- Dashboard thống kê

### 📱 Responsive Guidelines

**Mobile (< 768px):**
```jsx
<ColorDisplay size="xs" showLabel={false} />
<MultiColorDisplay maxDisplay={2} size="xs" />
```

**Tablet (768px - 1024px):**
```jsx
<ColorDisplay size="sm" showLabel={true} />
<MultiColorDisplay maxDisplay={3} size="sm" />
```

**Desktop (> 1024px):**
```jsx
<ColorDisplay size="md" showLabel={true} />
<MultiColorDisplay maxDisplay={4} size="sm" />
```

### 🎨 Color Naming Convention

**Nên:**
- Sử dụng tên màu chuẩn: "Đen", "Trắng", "Đỏ"
- Viết hoa chữ cái đầu
- Sử dụng tiếng Việt

**Không nên:**
- Tên màu mơ hồ: "Màu đẹp", "Màu hot"
- Tên màu phức tạp: "Đỏ cherry ngọt ngào"
- Tiếng Anh: "Black", "White", "Red"

## Performance Optimization

### 1. Lazy Loading
- Component chỉ render khi cần thiết
- Không load ảnh màu không cần thiết

### 2. Memoization
- Cache kết quả chuyển đổi màu
- Tránh tính toán lại không cần thiết

### 3. Bundle Size
- Chỉ import component cần dùng
- Tree shaking tự động loại bỏ code không dùng

## Accessibility (A11Y)

### 1. Color Contrast
- Đảm bảo độ tương phản đủ với nền
- Thêm viền cho màu sáng

### 2. Screen Reader
- Thêm `title` attribute với thông tin màu
- `alt` text mô tả màu sắc

### 3. Keyboard Navigation
- Hỗ trợ tab navigation
- Focus indicator rõ ràng

## Troubleshooting

### ❌ Lỗi thường gặp

**"Màu không hiển thị đúng"**
- Kiểm tra tên màu có trong colorMap
- Thử sử dụng mã hex trực tiếp
- Kiểm tra case sensitivity

**"Màu trắng không thấy"**
- Component tự động thêm viền cho màu trắng
- Kiểm tra background container

**"Quá nhiều màu trong MultiColorDisplay"**
- Điều chỉnh `maxDisplay` prop
- Sử dụng size nhỏ hơn

**"Performance chậm với nhiều màu"**
- Sử dụng React.memo cho component
- Giảm số lượng màu hiển thị

### 🔧 Debug Tips

1. **Kiểm tra props:**
```jsx
console.log('Color:', color, 'Hex:', getHexColor(color));
```

2. **Test với màu cơ bản:**
```jsx
<ColorDisplay color="đỏ" size="md" showLabel={true} />
```

3. **Kiểm tra CSS:**
- Đảm bảo Tailwind CSS được load
- Kiểm tra z-index conflicts

---

**Phiên bản**: 1.0  
**Cập nhật**: 13/12/2024  
**Hỗ trợ**: Liên hệ admin nếu gặp vấn đề