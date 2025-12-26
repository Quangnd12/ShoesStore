# Hướng dẫn sử dụng tính năng Xuất Excel - Hóa đơn bán hàng

## Tổng quan
Tính năng xuất Excel cho phép bạn xuất dữ liệu hóa đơn bán hàng ra file Excel với nhiều tùy chọn linh hoạt về thời gian, nội dung và định dạng.

## Cách sử dụng

### 1. Truy cập tính năng
- Vào trang "Hóa đơn bán hàng" tại http://localhost:5173/sales-invoices
- Click button **"Xuất Excel"** (màu xanh lá) ở góc phải trên
- Modal "Xuất Excel - Hóa đơn bán hàng" sẽ hiển thị

### 2. Chọn khoảng thời gian

#### Tùy chọn có sẵn:
- **Tất cả**: Xuất toàn bộ hóa đơn trong hệ thống
- **Hôm nay**: Chỉ hóa đơn được tạo trong ngày
- **Tuần này**: Hóa đơn từ đầu tuần đến cuối tuần
- **Tháng này**: Hóa đơn trong tháng hiện tại
- **Tùy chọn**: Chọn khoảng thời gian cụ thể

#### Khoảng thời gian tùy chọn:
1. Chọn radio button "Tùy chọn"
2. Chọn "Từ ngày" và "Đến ngày"
3. Hệ thống sẽ lọc hóa đơn trong khoảng thời gian này

### 3. Chọn nội dung xuất

#### ✅ Thông tin khách hàng:
- Tên khách hàng
- Số điện thoại
- Email

#### ✅ Chi tiết sản phẩm:
- Màu sắc sản phẩm
- Kích cỡ sản phẩm

#### ✅ Thông tin thanh toán:
- Tổng tiền hóa đơn
- Số tiền giảm giá
- Phương thức thanh toán

### 4. Chọn định dạng xuất

#### 📊 Chi tiết (Detailed):
- **Mỗi dòng = 1 sản phẩm** trong hóa đơn
- Phù hợp để phân tích chi tiết từng sản phẩm
- File có nhiều dòng hơn nhưng thông tin đầy đủ

**Ví dụ:**
```
STT | Số HĐ | Ngày | Khách hàng | Sản phẩm | Màu | Size | SL | Giá
1   | HD001 | 13/12| Nguyễn A   | Nike Air | Đen | 42   | 1  | 2M
2   | HD001 | 13/12| Nguyễn A   | Adidas   | Trắng| 43   | 2  | 1.5M
3   | HD002 | 13/12| Trần B     | Converse | Đỏ   | 40   | 1  | 1M
```

#### 📋 Tổng hợp (Summary):
- **Mỗi dòng = 1 hóa đơn**
- Phù hợp để xem tổng quan doanh thu
- File gọn nhẹ, dễ đọc

**Ví dụ:**
```
STT | Số HĐ | Ngày | Khách hàng | Số SP | Tổng SL | Tổng tiền
1   | HD001 | 13/12| Nguyễn A   | 2     | 3       | 3.5M
2   | HD002 | 13/12| Trần B     | 1     | 1       | 1M
```

### 5. Xem trước và xuất file
- Phần "Xem trước cấu trúc file" hiển thị các cột sẽ có trong Excel
- Click **"Xuất Excel"** để tạo file
- File sẽ được tải về với tên: `hoa_don_ban_hang_[định_dạng]_[ngày].xlsx`

## Cấu trúc file Excel

### Định dạng chi tiết (Detailed)
| Cột | Tên cột | Mô tả | Ví dụ |
|-----|---------|-------|-------|
| A | STT | Số thứ tự | 1, 2, 3... |
| B | Số hóa đơn | Mã hóa đơn | HD20241213-001 |
| C | Ngày bán | Ngày tạo hóa đơn | 13/12/2024 |
| D | Khách hàng | Tên khách hàng | Nguyễn Văn A |
| E | Số điện thoại | SĐT khách hàng | 0901234567 |
| F | Email | Email khách hàng | customer@email.com |
| G | Tên sản phẩm | Tên sản phẩm | Nike Air Max 270 |
| H | Màu sắc | Màu sản phẩm | Đen |
| I | Kích cỡ | Size sản phẩm | 42 |
| J | Số lượng | Số lượng bán | 1 |
| K | Đơn giá | Giá bán 1 sản phẩm | 2500000 |
| L | Thành tiền | Tổng tiền sản phẩm | 2500000 |
| M | Tổng hóa đơn | Tổng tiền hóa đơn | 2500000 |
| N | Giảm giá | Số tiền giảm giá | 0 |
| O | Phương thức TT | Cách thanh toán | Tiền mặt |
| P | Ghi chú | Ghi chú hóa đơn | Khách VIP |
| Q | Người tạo | Nhân viên tạo | admin |
| R | Ngày tạo | Thời gian tạo | 13/12/2024 |

### Định dạng tổng hợp (Summary)
| Cột | Tên cột | Mô tả | Ví dụ |
|-----|---------|-------|-------|
| A | STT | Số thứ tự | 1, 2, 3... |
| B | Số hóa đơn | Mã hóa đơn | HD20241213-001 |
| C | Ngày bán | Ngày tạo hóa đơn | 13/12/2024 |
| D | Khách hàng | Tên khách hàng | Nguyễn Văn A |
| E | Số điện thoại | SĐT khách hàng | 0901234567 |
| F | Email | Email khách hàng | customer@email.com |
| G | Số sản phẩm | Tổng số loại SP | 3 |
| H | Tổng số lượng | Tổng SL tất cả SP | 5 |
| I | Tổng tiền | Tổng tiền hóa đơn | 5000000 |
| J | Giảm giá | Số tiền giảm giá | 100000 |
| K | Phương thức TT | Cách thanh toán | Tiền mặt |
| L | Ghi chú | Ghi chú hóa đơn | Khách VIP |
| M | Người tạo | Nhân viên tạo | admin |
| N | Ngày tạo | Thời gian tạo | 13/12/2024 |

## Tính năng nổi bật

### 🎯 Lọc thời gian thông minh
- **Preset nhanh**: Hôm nay, tuần này, tháng này
- **Tùy chọn linh hoạt**: Chọn khoảng thời gian bất kỳ
- **Tự động tính toán**: Hệ thống tự động tính từ ngày - đến ngày

### 📊 Tùy chọn nội dung
- **Modular**: Chọn từng phần thông tin cần xuất
- **Tiết kiệm**: Bỏ qua thông tin không cần thiết
- **Linh hoạt**: Phù hợp với nhiều mục đích sử dụng

### 📋 Hai định dạng xuất
- **Chi tiết**: Phân tích sâu từng sản phẩm
- **Tổng hợp**: Báo cáo tổng quan doanh thu

### 🚀 Hiệu suất cao
- **Xử lý hàng loạt**: Xuất hàng nghìn hóa đơn cùng lúc
- **Tối ưu bộ nhớ**: Xử lý từng hóa đơn một
- **Báo tiến độ**: Thông báo trạng thái xuất file

## Các trường hợp sử dụng

### 📈 Báo cáo doanh thu
**Mục đích**: Xem tổng quan doanh thu theo thời gian
**Cài đặt khuyến nghị**:
- Khoảng thời gian: Tháng này
- Nội dung: Bỏ chi tiết sản phẩm
- Định dạng: Tổng hợp

### 🔍 Phân tích sản phẩm
**Mục đích**: Xem sản phẩm nào bán chạy nhất
**Cài đặt khuyến nghị**:
- Khoảng thời gian: Tùy chọn (3 tháng gần nhất)
- Nội dung: Bao gồm chi tiết sản phẩm
- Định dạng: Chi tiết

### 👥 Quản lý khách hàng
**Mục đích**: Xuất danh sách khách hàng đã mua
**Cài đặt khuyến nghị**:
- Khoảng thời gian: Tất cả
- Nội dung: Bao gồm thông tin khách hàng
- Định dạng: Tổng hợp

### 💰 Báo cáo tài chính
**Mục đích**: Tính toán doanh thu, thuế
**Cài đặt khuyến nghị**:
- Khoảng thời gian: Tháng/Quý cụ thể
- Nội dung: Bao gồm thông tin thanh toán
- Định dạng: Tổng hợp

### 📦 Quản lý kho
**Mục đích**: Xem sản phẩm đã bán theo màu, size
**Cài đặt khuyến nghị**:
- Khoảng thời gian: Tuần này
- Nội dung: Bao gồm chi tiết sản phẩm
- Định dạng: Chi tiết

## Xử lý dữ liệu trong Excel

### Sắp xếp dữ liệu
1. **Theo ngày**: Cột "Ngày bán" → Data → Sort
2. **Theo khách hàng**: Cột "Khách hàng" → Sort A to Z
3. **Theo doanh thu**: Cột "Tổng tiền" → Sort Largest to Smallest

### Lọc dữ liệu
1. **Chọn toàn bộ dữ liệu** (Ctrl+A)
2. **Data → Filter** để bật bộ lọc
3. **Click mũi tên** ở header để lọc theo điều kiện

### Tạo Pivot Table
1. **Chọn dữ liệu** → Insert → PivotTable
2. **Kéo thả các trường**:
   - Rows: Tên sản phẩm, Màu sắc
   - Values: Sum of Số lượng, Sum of Thành tiền
   - Filters: Ngày bán, Khách hàng

### Tạo biểu đồ
1. **Chọn dữ liệu cần vẽ biểu đồ**
2. **Insert → Charts** → Chọn loại biểu đồ
3. **Tùy chỉnh** title, labels, colors

## Lưu ý quan trọng

### ⚠️ Hiệu suất
- **File lớn**: Với >1000 hóa đơn, quá trình xuất có thể mất 1-2 phút
- **Bộ nhớ**: Đảm bảo máy tính có đủ RAM khi xuất file lớn
- **Mạng**: Cần kết nối internet ổn định

### 🔒 Bảo mật
- **Dữ liệu nhạy cảm**: File Excel chứa thông tin khách hàng
- **Lưu trữ an toàn**: Không chia sẻ file cho người không có quyền
- **Xóa file**: Xóa file sau khi sử dụng xong

### 📱 Tương thích
- **Excel 2016+**: Hỗ trợ đầy đủ tính năng
- **Google Sheets**: Có thể mở nhưng một số format bị mất
- **LibreOffice Calc**: Tương thích tốt

### 💾 Dung lượng file
- **Định dạng chi tiết**: ~100KB/1000 dòng
- **Định dạng tổng hợp**: ~50KB/1000 dòng
- **Với hình ảnh**: Không bao gồm hình ảnh sản phẩm

## Troubleshooting

### ❌ Lỗi thường gặp

**"Không có dữ liệu để xuất"**
- Kiểm tra khoảng thời gian đã chọn
- Đảm bảo có hóa đơn trong khoảng thời gian đó

**"Có lỗi xảy ra khi xuất file Excel"**
- Thử lại với khoảng thời gian nhỏ hơn
- Kiểm tra kết nối internet
- Refresh trang và thử lại

**"File không tải về"**
- Kiểm tra trình duyệt có chặn popup không
- Thử với trình duyệt khác
- Kiểm tra thư mục Downloads

**"File Excel bị lỗi khi mở"**
- Đảm bảo có Excel 2016+ hoặc tương đương
- Thử mở bằng Google Sheets
- Tải lại file từ hệ thống

### 🔧 Tối ưu hóa

**Xuất file lớn:**
1. Chia nhỏ khoảng thời gian
2. Chọn định dạng "Tổng hợp"
3. Bỏ bớt thông tin không cần thiết

**Tăng tốc độ:**
1. Đóng các tab browser khác
2. Tạm dừng các ứng dụng khác
3. Sử dụng mạng có băng thông cao

---

**Phiên bản**: 1.0  
**Cập nhật**: 13/12/2024  
**Hỗ trợ**: Liên hệ admin nếu gặp vấn đề