# Hướng dẫn sử dụng tính năng Nhận dạng màu sắc từ hình ảnh

## Tổng quan
Tính năng nhận dạng màu sắc tự động từ hình ảnh sản phẩm giúp bạn nhanh chóng xác định và chọn màu sắc chính xác cho sản phẩm khi tạo hóa đơn nhập hàng.

## Tính năng chính

### 🎨 Nhận dạng màu tự động
- **Phân tích hình ảnh**: Tự động phân tích màu sắc từ hình ảnh sản phẩm
- **Trích xuất màu chính**: Hiển thị 6 màu sắc chủ đạo nhất
- **Tỷ lệ phần trăm**: Cho biết tỷ lệ của từng màu trong hình ảnh
- **Tự động chọn**: Tự động chọn màu chủ đạo nhất làm màu sản phẩm

### 🎯 Color Picker thông minh
- **Bảng màu có sẵn**: 20+ màu sắc phổ biến với tên tiếng Việt
- **Màu từ hình ảnh**: Hiển thị màu được trích xuất từ ảnh đã upload
- **Màu tùy chỉnh**: Cho phép chọn màu bất kỳ bằng color picker
- **Tìm kiếm thông minh**: Tự động tìm tên màu gần nhất

## Cách sử dụng

### 1. Truy cập form thêm hóa đơn nhập hàng
- Vào trang "Hóa đơn nhập" tại http://localhost:5173
- Click "Thêm hóa đơn nhập"
- Chọn tab sản phẩm và chọn "Tạo sản phẩm mới"

### 2. Upload hình ảnh sản phẩm
- Trong phần "Hình ảnh sản phẩm", click vào ô upload
- Chọn hình ảnh sản phẩm từ máy tính
- Hệ thống sẽ tự động phân tích và hiển thị màu sắc

### 3. Chọn màu sắc
#### Từ màu được phát hiện:
- Xem danh sách màu được phân tích từ hình ảnh
- Click vào màu muốn chọn
- Màu sẽ tự động điền vào ô "Màu sắc"

#### Từ bảng màu có sẵn:
- Click vào ô "Màu sắc"
- Chọn từ bảng màu có sẵn
- Hoặc sử dụng color picker tùy chỉnh

### 4. Chỉnh sửa màu sắc
- Có thể nhập trực tiếp tên màu vào ô "Màu sắc"
- Hoặc click để mở color picker và chỉnh sửa
- Hỗ trợ cả mã hex (#FF0000) và tên màu (Đỏ)

## Các màu sắc được hỗ trợ

### Màu cơ bản:
- **Đen** (#000000)
- **Trắng** (#FFFFFF)
- **Xám** (#808080)
- **Đỏ** (#FF0000)
- **Xanh dương** (#0000FF)
- **Xanh lá** (#008000)
- **Vàng** (#FFFF00)
- **Cam** (#FFA500)
- **Tím** (#800080)
- **Hồng** (#FFC0CB)

### Màu nâng cao:
- **Nâu** (#A52A2A)
- **Xanh navy** (#000080)
- **Xanh lam** (#00FFFF)
- **Lime** (#00FF00)
- **Magenta** (#FF00FF)
- **Bạc** (#C0C0C0)
- **Vàng gold** (#FFD700)
- **Đỏ đậm** (#8B0000)
- **Xanh teal** (#008080)
- **Olive** (#808000)

## Thuật toán nhận dạng màu

### 1. Tiền xử lý hình ảnh
- Resize ảnh xuống 200px để tăng tốc độ xử lý
- Loại bỏ pixel trong suốt và pixel quá sáng (trắng)
- Lấy mẫu mỗi 4 pixel để tối ưu hiệu suất

### 2. Phân tích màu sắc
- Nhóm các màu tương tự lại (làm tròn theo bước 20)
- Đếm tần suất xuất hiện của từng màu
- Sắp xếp theo độ phổ biến

### 3. Tìm tên màu
- So sánh với bảng màu có sẵn
- Tính khoảng cách RGB để tìm màu gần nhất
- Trả về tên tiếng Việt nếu khoảng cách < 50

## Lưu ý khi sử dụng

### ✅ Để có kết quả tốt nhất:
- **Chất lượng ảnh**: Sử dụng ảnh có độ phân giải tốt, rõ nét
- **Ánh sáng**: Ảnh chụp trong điều kiện ánh sáng tự nhiên
- **Góc chụp**: Chụp thẳng, tránh bóng đổ che khuất
- **Nền**: Nền đơn giản, tương phản với sản phẩm

### ⚠️ Hạn chế:
- **Màu phức tạp**: Sản phẩm nhiều màu có thể không chính xác 100%
- **Ánh sáng ảnh hưởng**: Màu có thể khác biệt tùy điều kiện chụp
- **Màu metallic**: Màu kim loại, ánh kim khó nhận dạng chính xác

### 🔧 Xử lý sự cố:
- **Không nhận dạng được màu**: Thử upload ảnh khác hoặc chọn màu thủ công
- **Màu không chính xác**: Sử dụng color picker để chỉnh sửa
- **Ảnh không hiển thị**: Kiểm tra định dạng file (JPG, PNG, WebP)

## Định dạng file hỗ trợ
- **JPG/JPEG**: Định dạng phổ biến nhất
- **PNG**: Hỗ trợ trong suốt
- **WebP**: Định dạng hiện đại, dung lượng nhỏ
- **GIF**: Hỗ trợ nhưng chỉ lấy frame đầu tiên

## Kích thước file khuyến nghị
- **Tối đa**: 5MB
- **Khuyến nghị**: 500KB - 2MB
- **Độ phân giải**: 800x600 đến 1920x1080

## Ví dụ sử dụng

### Trường hợp 1: Giày thể thao đen
1. Upload ảnh giày thể thao màu đen
2. Hệ thống phát hiện: Đen (45%), Trắng (25%), Xám (15%)
3. Click chọn "Đen" từ danh sách màu được phát hiện
4. Ô màu sắc tự động điền "Đen"

### Trường hợp 2: Áo sơ mi xanh dương
1. Upload ảnh áo sơ mi xanh dương nhạt
2. Hệ thống phát hiện: Xanh da trời (60%), Trắng (30%)
3. Nếu không hài lòng, click vào ô màu sắc
4. Chọn "Xanh dương" từ bảng màu có sẵn

### Trường hợp 3: Sản phẩm màu đặc biệt
1. Upload ảnh sản phẩm màu đồng
2. Hệ thống có thể không nhận dạng chính xác
3. Sử dụng color picker tùy chỉnh
4. Chọn màu gần nhất hoặc nhập "Đồng" thủ công

---

**Phiên bản**: 1.0  
**Cập nhật**: 13/12/2024  
**Hỗ trợ**: Liên hệ admin nếu gặp vấn đề