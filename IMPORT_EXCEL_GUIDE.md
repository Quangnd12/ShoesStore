# Hướng dẫn sử dụng tính năng Import Excel - Hóa đơn nhập hàng

## Tổng quan
Tính năng Import Excel cho phép bạn nhập nhiều hóa đơn nhập hàng cùng lúc từ file Excel, giúp tiết kiệm thời gian và tăng hiệu quả công việc.

## Cách sử dụng

### 1. Truy cập trang Hóa đơn nhập hàng
- Mở ứng dụng: http://localhost:5173
- Đăng nhập với tài khoản admin
- Vào menu "Hóa đơn nhập"

### 2. Mở modal Import Excel
- Click nút **"Import Excel"** (màu xanh lá) trên trang hóa đơn nhập hàng
- Modal Import Excel sẽ hiển thị

### 3. Tải template Excel
- Click nút **"Tải Template Excel"** để tải file mẫu
- File template sẽ có cấu trúc chuẩn với các cột cần thiết

### 4. Chuẩn bị dữ liệu
- Mở file template đã tải
- Điền thông tin theo đúng định dạng:

#### Các cột bắt buộc:
- **Số hóa đơn**: Mã định danh hóa đơn (VD: PN20241213-001)
- **Ngày hóa đơn**: Định dạng YYYY-MM-DD (VD: 2024-12-13)
- **Tên sản phẩm**: Tên của sản phẩm
- **Số lượng**: Số lượng nhập (số nguyên dương)
- **Giá nhập**: Giá nhập từ nhà cung cấp (số dương)

#### Thông tin nhà cung cấp (chọn 1 trong 2):
- **Mã nhà cung cấp**: ID của nhà cung cấp (ưu tiên)
- **Tên nhà cung cấp**: Tên nhà cung cấp (để tìm kiếm)

#### Thông tin sản phẩm:
- **Mã sản phẩm**: Nếu sản phẩm đã tồn tại
- **Thông tin sản phẩm mới**: Nếu tạo sản phẩm mới cần có:
  - Tên sản phẩm
  - Giá bán
  - Mã danh mục hoặc Tên danh mục

### 5. Upload file Excel
- Click vào vùng upload hoặc kéo thả file Excel
- Hệ thống sẽ tự động xử lý và validate dữ liệu
- Xem preview dữ liệu và kiểm tra lỗi (nếu có)

### 6. Import dữ liệu
- Nếu không có lỗi, click **"Import X hóa đơn"**
- Hệ thống sẽ tạo các hóa đơn và hiển thị kết quả

## Tính năng nổi bật

### ✅ Hỗ trợ nhiều hóa đơn cùng lúc
- Có thể import nhiều hóa đơn trong một file Excel
- Phân biệt hóa đơn bằng cột "Số hóa đơn"

### ✅ Tự động tạo sản phẩm mới
- Nếu không có mã sản phẩm, hệ thống sẽ tạo sản phẩm mới
- Tự động cập nhật tồn kho sau khi nhập

### ✅ Validation thông minh
- Kiểm tra tính hợp lệ của dữ liệu trước khi import
- Hiển thị chi tiết lỗi theo từng dòng
- Chỉ import những dữ liệu hợp lệ

### ✅ Tìm kiếm linh hoạt
- Tìm nhà cung cấp theo mã hoặc tên
- Tìm danh mục theo mã hoặc tên
- Hỗ trợ tìm kiếm không phân biệt hoa thường

### ✅ Báo cáo chi tiết
- Thông báo số lượng hóa đơn thành công/thất bại
- Chi tiết lỗi cho từng hóa đơn bị lỗi
- Tự động refresh danh sách sau khi import

## Ví dụ dữ liệu Excel

```
| Số hóa đơn | Mã NCC | Ngày hóa đơn | Ghi chú | Tên sản phẩm | Mã danh mục | Số lượng | Giá nhập |
|------------|--------|--------------|---------|--------------|-------------|----------|----------|
| PN20241213-001 | 1 | 2024-12-13 | Nhập hàng T12 | Giày Nike Air Max | 1 | 10 | 2000000 |
| PN20241213-001 | 1 | 2024-12-13 | Nhập hàng T12 | Giày Nike Air Force | 1 | 5 | 1800000 |
| PN20241213-002 | 2 | 2024-12-13 | | Giày Adidas Ultraboost | 1 | 8 | 2200000 |
```

## Xử lý lỗi thường gặp

### ❌ "Thiếu thông tin bắt buộc"
- Kiểm tra các cột: Số hóa đơn, Ngày hóa đơn, Tên sản phẩm, Số lượng, Giá nhập
- Đảm bảo không có ô trống

### ❌ "Không tìm thấy nhà cung cấp"
- Kiểm tra mã nhà cung cấp có đúng không
- Hoặc kiểm tra tên nhà cung cấp có chính xác không

### ❌ "Không tìm thấy danh mục"
- Kiểm tra mã danh mục có đúng không
- Hoặc kiểm tra tên danh mục có chính xác không

### ❌ "Số lượng/giá không hợp lệ"
- Đảm bảo số lượng và giá nhập là số dương
- Không được có dấu phẩy trong số

### ❌ "Định dạng ngày không đúng"
- Sử dụng định dạng YYYY-MM-DD (VD: 2024-12-13)

## Lưu ý quan trọng

1. **Backup dữ liệu**: Nên backup database trước khi import số lượng lớn
2. **Kiểm tra trước**: Luôn kiểm tra preview trước khi import
3. **File size**: Khuyến nghị không quá 1000 dòng mỗi lần import
4. **Định dạng**: Chỉ hỗ trợ file .xlsx và .xls
5. **Encoding**: Đảm bảo file Excel có encoding UTF-8 để hiển thị tiếng Việt đúng

## Hỗ trợ

Nếu gặp vấn đề khi sử dụng tính năng Import Excel, vui lòng:
1. Kiểm tra lại định dạng file Excel theo template
2. Xem chi tiết lỗi trong modal Import
3. Liên hệ admin để được hỗ trợ

---

**Phiên bản**: 1.0  
**Cập nhật**: 13/12/2024