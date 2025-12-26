# Template Excel cho Import Hóa đơn nhập hàng

## Cấu trúc file Excel

File Excel cần có các cột sau (theo đúng thứ tự):

| Cột | Tên cột | Bắt buộc | Mô tả | Ví dụ |
|-----|---------|----------|-------|-------|
| A | Số hóa đơn | ✓ | Số hóa đơn nhập hàng | PN20241213-001 |
| B | Mã nhà cung cấp |  | ID của nhà cung cấp (ưu tiên) | 1 |
| C | Tên nhà cung cấp |  | Tên nhà cung cấp (nếu không có mã) | Công ty ABC |
| D | Ngày hóa đơn | ✓ | Ngày tạo hóa đơn (YYYY-MM-DD) | 2024-12-13 |
| E | Ghi chú |  | Ghi chú cho hóa đơn | Nhập hàng tháng 12 |
| F | Mã sản phẩm (nếu có) |  | ID sản phẩm đã tồn tại | 123 |
| G | Tên sản phẩm | ✓ | Tên sản phẩm | Giày thể thao Nike Air Max |
| H | Mô tả |  | Mô tả sản phẩm | Giày thể thao cao cấp |
| I | Giá bán |  | Giá bán lẻ | 2500000 |
| J | Mã danh mục |  | ID danh mục (ưu tiên) | 1 |
| K | Tên danh mục |  | Tên danh mục (nếu không có mã) | Giày thể thao |
| L | Thương hiệu |  | Thương hiệu sản phẩm | Nike |
| M | Màu sắc |  | Màu sắc sản phẩm | Đen |
| N | Kích cỡ |  | Kích cỡ sản phẩm | 42 |
| O | Số lượng | ✓ | Số lượng nhập | 10 |
| P | Giá nhập | ✓ | Giá nhập từ nhà cung cấp | 2000000 |
| Q | URL hình ảnh |  | Link hình ảnh sản phẩm | https://example.com/image.jpg |

## Quy tắc import

### 1. Nhà cung cấp
- Ưu tiên sử dụng **Mã nhà cung cấp** nếu có
- Nếu không có mã, sử dụng **Tên nhà cung cấp** để tìm kiếm
- Phải có ít nhất một trong hai thông tin này

### 2. Sản phẩm
- **Sản phẩm đã tồn tại**: Chỉ cần **Mã sản phẩm**, **Số lượng**, **Giá nhập**
- **Sản phẩm mới**: Cần **Tên sản phẩm**, **Giá bán** (hoặc dùng giá nhập), **Danh mục**, **Số lượng**, **Giá nhập**

### 3. Danh mục (cho sản phẩm mới)
- Ưu tiên sử dụng **Mã danh mục** nếu có
- Nếu không có mã, sử dụng **Tên danh mục** để tìm kiếm
- Bắt buộc khi tạo sản phẩm mới

### 4. Hóa đơn
- Có thể import nhiều hóa đơn trong một file
- Các dòng có cùng **Số hóa đơn** sẽ được gom thành một hóa đơn
- Mỗi dòng là một sản phẩm trong hóa đơn

## Ví dụ dữ liệu

```
Số hóa đơn | Mã NCC | Tên NCC | Ngày HĐ | Ghi chú | Mã SP | Tên SP | Mô tả | Giá bán | Mã DM | Tên DM | Thương hiệu | Màu | Size | SL | Giá nhập | URL ảnh
PN20241213-001 | 1 | | 2024-12-13 | Nhập hàng T12 | | Giày Nike Air Max | Giày thể thao | 2500000 | 1 | | Nike | Đen | 42 | 10 | 2000000 |
PN20241213-001 | 1 | | 2024-12-13 | Nhập hàng T12 | | Giày Nike Air Max | Giày thể thao | 2500000 | 1 | | Nike | Trắng | 43 | 5 | 2000000 |
PN20241213-002 | 2 | | 2024-12-13 | | 123 | | | | | | | | | 20 | 1500000 |
```

## Lưu ý quan trọng

1. **Định dạng file**: Chỉ hỗ trợ .xlsx và .xls
2. **Dòng đầu tiên**: Phải là header (tên cột)
3. **Dữ liệu số**: Không được có dấu phẩy, chỉ số nguyên
4. **Ngày tháng**: Định dạng YYYY-MM-DD (VD: 2024-12-13)
5. **Validation**: Hệ thống sẽ kiểm tra tính hợp lệ trước khi import
6. **Rollback**: Nếu một hóa đơn lỗi, chỉ hóa đơn đó bị bỏ qua, các hóa đơn khác vẫn được tạo

## Xử lý lỗi

Các lỗi thường gặp:
- **Thiếu thông tin bắt buộc**: Số hóa đơn, nhà cung cấp, tên sản phẩm, số lượng, giá nhập
- **Không tìm thấy nhà cung cấp**: Kiểm tra mã hoặc tên nhà cung cấp
- **Không tìm thấy danh mục**: Kiểm tra mã hoặc tên danh mục (cho sản phẩm mới)
- **Số lượng/giá không hợp lệ**: Phải là số dương
- **Sản phẩm không tồn tại**: Kiểm tra mã sản phẩm hoặc cung cấp thông tin sản phẩm mới