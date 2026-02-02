# Tính năng Zoom Hình ảnh

## Tổng quan
Tính năng zoom hình ảnh cho phép người dùng phóng to và xem chi tiết hình ảnh sản phẩm trong các modal chi tiết hóa đơn và sản phẩm.

## Các vị trí áp dụng

### 1. Modal Chi tiết Hóa đơn Nhập
- **Vị trí**: Hình ảnh sản phẩm trong component `GroupedProductVariants`
- **Cách sử dụng**: Click vào hình ảnh sản phẩm để mở modal zoom
- **File liên quan**: `frontend/src/components/GroupedProductVariants.jsx`

### 2. Modal Chi tiết Hóa đơn Bán
- **Vị trí**: Cột "Hình ảnh" trong bảng sản phẩm
- **Cách sử dụng**: Click vào hình ảnh sản phẩm để mở modal zoom
- **File liên quan**: `frontend/src/components/invoices/InvoiceDetailModal.jsx`

### 3. Modal Chi tiết Sản phẩm
- **Vị trí**: Hình ảnh chính của sản phẩm
- **Cách sử dụng**: Click vào hình ảnh sản phẩm để mở modal zoom
- **File liên quan**: `frontend/src/components/ProductDetailModal.jsx`

## Tính năng của Modal Zoom

### Điều khiển chuột
- **Click và kéo**: Di chuyển hình ảnh
- **Cuộn chuột**: Zoom in/out
- **Click vào nền đen**: Đóng modal

### Phím tắt
- **+** hoặc **=**: Zoom in
- **-**: Zoom out
- **R**: Xoay hình ảnh 90 độ
- **0**: Reset về trạng thái ban đầu
- **Esc**: Đóng modal

### Thanh công cụ
- **Zoom In/Out**: Nút phóng to/thu nhỏ với hiển thị tỷ lệ phần trăm
- **Rotate**: Xoay hình ảnh 90 độ
- **Download**: Tải xuống hình ảnh
- **Reset**: Đặt lại về trạng thái ban đầu

### Giao diện
- **Nền tối**: Nền đen mờ để tập trung vào hình ảnh
- **Thanh công cụ**: Hiển thị ở trên cùng với các nút điều khiển
- **Hướng dẫn**: Hiển thị ở dưới cùng với các phím tắt

## Cài đặt và Cấu hình

### Component chính
```jsx
import ImageZoomModal from '../components/ImageZoomModal';

// Sử dụng trong component
<ImageZoomModal
  isOpen={showImageZoom}
  onClose={() => setShowImageZoom(false)}
  imageUrl={selectedImage.url}
  altText={selectedImage.alt}
/>
```

### State cần thiết
```jsx
const [showImageZoom, setShowImageZoom] = useState(false);
const [selectedImage, setSelectedImage] = useState({ url: "", alt: "" });
```

### Handler function
```jsx
const handleImageClick = (imageUrl, productName) => {
  setSelectedImage({ url: imageUrl, alt: productName });
  setShowImageZoom(true);
};
```

## Tối ưu hóa

### Performance
- Modal chỉ render khi `isOpen = true`
- Sử dụng `transform` CSS cho animation mượt mà
- Lazy loading cho hình ảnh lớn

### UX/UI
- Cursor thay đổi khi hover vào hình ảnh có thể zoom
- Tooltip hiển thị "Click để phóng to hình ảnh"
- Transition mượt mà khi zoom và di chuyển
- Responsive design cho mobile

### Accessibility
- Hỗ trợ phím tắt đầy đủ
- Alt text cho screen reader
- Focus management khi mở/đóng modal

## Troubleshooting

### Hình ảnh không hiển thị
- Kiểm tra URL hình ảnh có hợp lệ không
- Kiểm tra CORS policy nếu hình ảnh từ domain khác
- Xử lý lỗi với `onError` handler

### Performance chậm
- Tối ưu kích thước hình ảnh trước khi upload
- Sử dụng format WebP nếu có thể
- Implement lazy loading cho danh sách hình ảnh

### Mobile experience
- Test trên các thiết bị mobile khác nhau
- Đảm bảo touch gestures hoạt động tốt
- Kiểm tra viewport scaling

## Files liên quan

### Core component
- `frontend/src/components/ImageZoomModal.jsx` - Component chính

### Updated components
- `frontend/src/components/GroupedProductVariants.jsx` - Hóa đơn nhập
- `frontend/src/components/invoices/InvoiceDetailModal.jsx` - Modal chi tiết hóa đơn
- `frontend/src/components/ProductDetailModal.jsx` - Modal chi tiết sản phẩm
- `frontend/src/pages/SalesInvoices.jsx` - Trang hóa đơn bán

### Refactored components (tự động áp dụng)
- `frontend/src/pages/PurchaseInvoicesRefactored.jsx`
- `frontend/src/pages/SalesInvoicesRefactored.jsx`