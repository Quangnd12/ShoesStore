# Hướng dẫn sử dụng Thanh toán nhanh (Quick Checkout)

## Tổng quan

Tính năng **Thanh toán nhanh** là một giao diện hiện đại cho phép nhân viên bán hàng tạo hóa đơn nhanh chóng với trải nghiệm kéo-thả (drag-and-drop) trực quan.

## Tính năng chính

### 1. Giao diện 2 vùng

#### Vùng bên trái - Danh sách sản phẩm
- **Hiển thị dạng thẻ (card)** với:
  - Hình ảnh sản phẩm
  - Tên sản phẩm
  - SKU (mã sản phẩm)
  - Size giày
  - Số lượng tồn kho
  - Giá bán
- **Tìm kiếm nhanh**: Tìm theo tên hoặc SKU
- **Lọc theo danh mục**: Chọn danh mục để lọc sản phẩm
- **Chỉ hiển thị sản phẩm còn hàng**: Tự động ẩn sản phẩm hết hàng

#### Vùng bên phải - Giỏ hàng & Thanh toán
- **Thông tin khách hàng**: Nhập tên, số điện thoại (tùy chọn)
- **Danh sách sản phẩm đã chọn**: Hiển thị chi tiết từng sản phẩm
- **Điều chỉnh số lượng**: Tăng/giảm số lượng trực tiếp
- **Tổng kết**: Tổng số lượng và tổng tiền
- **Nút thanh toán**: Tạo hóa đơn và in

### 2. Thao tác Drag-and-Drop

#### Cách 1: Kéo thả sản phẩm
1. Nhấn giữ chuột vào thẻ sản phẩm bên trái
2. Kéo sang vùng "Drop Zone" bên phải
3. Thả chuột để thêm sản phẩm vào giỏ hàng

#### Cách 2: Nhấn nút "Thêm"
- Click vào nút "Thêm" trên mỗi thẻ sản phẩm

### 3. Quản lý giỏ hàng

- **Thêm sản phẩm**: Kéo thả hoặc click nút "Thêm"
- **Tăng số lượng**: Click nút "+" hoặc thêm lại sản phẩm đã có
- **Giảm số lượng**: Click nút "-"
- **Xóa sản phẩm**: Click icon thùng rác
- **Xóa tất cả**: Click "Xóa tất cả" ở góc trên giỏ hàng

### 4. Thanh toán

1. Thêm sản phẩm vào giỏ hàng
2. (Tùy chọn) Nhập thông tin khách hàng
3. Kiểm tra lại đơn hàng
4. Click nút "Thanh toán"
5. Hệ thống tạo hóa đơn và hiển thị modal in

### 5. In hóa đơn

Sau khi thanh toán thành công:
- Modal hiển thị hóa đơn chi tiết
- Click nút "In hóa đơn" để in
- Hóa đơn bao gồm:
  - Thông tin cửa hàng
  - Số hóa đơn tự động
  - Ngày tạo
  - Thông tin khách hàng (nếu có)
  - Bảng chi tiết sản phẩm
  - Tổng tiền

## Ưu điểm

### 1. Tốc độ
- Giao diện tối ưu cho bán hàng nhanh
- Không cần chuyển trang
- Drag-and-drop trực quan

### 2. Trải nghiệm người dùng
- Giao diện đẹp, hiện đại
- Responsive trên mọi thiết bị
- Hiệu ứng hover và animation mượt mà

### 3. Kiểm soát tồn kho
- Tự động kiểm tra số lượng tồn kho
- Cảnh báo khi không đủ hàng
- Cập nhật tồn kho sau khi thanh toán

### 4. In hóa đơn chuyên nghiệp
- Template hóa đơn đẹp mắt
- Tối ưu cho in ấn
- Đầy đủ thông tin cần thiết

## Lưu ý kỹ thuật

### Kiểm tra tồn kho
- Hệ thống tự động kiểm tra số lượng tồn kho khi thêm sản phẩm
- Không cho phép thêm quá số lượng có sẵn
- Hiển thị thông báo lỗi rõ ràng

### Tự động làm mới
- Sau khi thanh toán, danh sách sản phẩm tự động cập nhật
- Giỏ hàng được xóa sạch
- Sẵn sàng cho đơn hàng tiếp theo

### Responsive Design
- Hoạt động tốt trên desktop, tablet, mobile
- Layout tự động điều chỉnh theo kích thước màn hình
- Touch-friendly cho thiết bị cảm ứng

## Phím tắt

- **ESC**: Đóng modal in hóa đơn
- **Ctrl/Cmd + P**: In hóa đơn (khi modal mở)

## Tích hợp với hệ thống

Tính năng này tích hợp hoàn toàn với:
- **API Backend**: Sử dụng endpoint `/api/sales-invoices`
- **Quản lý sản phẩm**: Đồng bộ với module Products
- **Hóa đơn bán hàng**: Hóa đơn được lưu vào hệ thống
- **Báo cáo**: Dữ liệu được tính vào báo cáo doanh thu

## Cải tiến trong tương lai

- [ ] Hỗ trợ mã giảm giá/khuyến mãi
- [ ] Tích hợp thanh toán điện tử
- [ ] Lưu đơn hàng nháp
- [ ] Quét mã vạch sản phẩm
- [ ] In tem nhãn sản phẩm
- [ ] Lịch sử đơn hàng nhanh
- [ ] Khách hàng thân thiết

## Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Kết nối API backend
2. Dữ liệu sản phẩm có đầy đủ (hình ảnh, giá, tồn kho)
3. Trình duyệt hỗ trợ drag-and-drop (Chrome, Firefox, Edge, Safari)
4. Console log để xem lỗi chi tiết
