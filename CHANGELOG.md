-# Changelog - Tính năng Quản lý Nhập/Bán hàng với Size EU
+
+## Tổng quan
+
+Hệ thống đã được tinh gọn để tập trung vào ba nghiệp vụ chính:
+
+- Nhập kho theo size EU (mỗi size là một sản phẩm riêng biệt)
+- Ghi nhận hóa đơn nhập – hóa đơn bán (một hóa đơn có thể chứa nhiều sản phẩm)
+- Báo cáo doanh thu/chi phí theo ngày/tuần/tháng/năm/khoảng thời gian
+
+## Các thành phần chính
+
+### Database
+
+- `backend/src/database/schema.sql` – định nghĩa bảng `suppliers`, `purchase_invoices`, `purchase_invoice_items`, `sales_invoices`, `sales_invoice_items`
+- `sales_invoices` nay lưu trực tiếp thông tin khách hàng (`customer_name/phone/email`) và không còn phụ thuộc bảng `orders`
+
+### Models
+
+- `backend/src/models/product.js` – quản lý sản phẩm + nhập batch nhiều size
+- `backend/src/models/supplier.js`
+- `backend/src/models/purchaseInvoice.js`
+- `backend/src/models/salesInvoice.js` – mới gộp order + sales invoice
+- `backend/src/models/report.js`
+
+### Controllers & Routes
+
+- `controllers/*` và `routes/*` tương ứng cho `product`, `supplier`, `purchaseInvoice`, `salesInvoice`, `report`
+- Module `order` đã được loại bỏ khỏi `app.js`
+
+### Tài liệu
+
+- `backend/API_DOCUMENTATION.md` – cập nhật hướng dẫn tạo hóa đơn bán trực tiếp, kèm hướng dẫn migration bỏ `order_id`
+
+## Thay đổi mới nhất
+
+1. **Gộp Order + Sales Invoice**
+   - Xóa các file `models/order.js`, `controllers/orderController.js`, `routes/order.js`
+   - `/api/sales-invoices` giờ chỉ nhận một payload duy nhất chứa danh sách sản phẩm, thông tin khách (tuỳ chọn)
+   - `sales_invoices` table thêm các cột `customer_name/phone/email`, bỏ bắt buộc `order_id`
+
+2. **Product batch nhập kho**
+   - `POST /api/products/batch` cho phép nhập nhiều size trong một lần
+
+3. **Purchase invoice & Sales invoice**
+   - Mọi thao tác (tạo/xóa) đều nằm trong transaction để đảm bảo tồn kho chính xác
+
+4. **Báo cáo**
+   - Không thay đổi API, nhưng số liệu doanh thu giờ lấy trực tiếp từ bảng `sales_invoices` mới
+
+## Database Schema
+
+- **suppliers**
+- **purchase_invoices** / **purchase_invoice_items**
+- **sales_invoices** (mới: không còn `order_id`, thêm thông tin khách hàng)
+- **sales_invoice_items**
+
+> Nếu database cũ vẫn còn cột `order_id`, vui lòng chạy lệnh:
+> ```sql
+> ALTER TABLE sales_invoices
+>   DROP FOREIGN KEY IF EXISTS sales_invoices_ibfk_1,
+>   DROP COLUMN order_id;
+> ```
+
+## Quy trình nghiệp vụ
+
+1. **Nhập hàng**
+   - (Tùy chọn) Tạo supplier
+   - Tạo hóa đơn nhập (`POST /api/purchase-invoices`) → hệ thống tăng tồn kho theo size
+
+2. **Bán hàng**
+   - Kiểm tra tồn kho (`GET /api/products` hoặc `/api/products/name/:name`)
+   - Tạo hóa đơn bán (`POST /api/sales-invoices`) với danh sách sản phẩm, số lượng, giá
+   - Hệ thống trừ tồn kho, ghi nhận doanh thu, lưu thông tin khách
+
+3. **Báo cáo**
+   - Sử dụng các endpoint `/api/reports/*` để xem doanh thu/chi phí theo ngày/tuần/tháng/năm/khoảng thời gian
+
+## API chính
+
- `POST /api/products/batch` – nhập nhiều size cùng lúc
- `POST /api/purchase-invoices` – hóa đơn nhập
- `POST /api/sales-invoices` – hóa đơn bán (gộp nhiều sản phẩm)
- `GET /api/reports/...` – báo cáo doanh thu/chi phí
+
+Chi tiết payload/ví dụ đã được cập nhật trong `backend/API_DOCUMENTATION.md`.

