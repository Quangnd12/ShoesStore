# Frontend - Quản lý cửa hàng giày dép

Frontend React với Tailwind CSS cho hệ thống quản lý cửa hàng giày dép.

## Cài đặt

```bash
cd frontend
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Cấu trúc

- `src/components/` - Các component dùng chung (Layout, Header, Sidebar)
- `src/pages/` - Các trang chính (Dashboard, Products, Suppliers, Invoices)
- `src/services/` - API service để kết nối với backend

## Tính năng

- Dashboard: Thống kê tổng quan
- Quản lý sản phẩm: CRUD đầy đủ
- Quản lý nhà cung cấp: CRUD đầy đủ
- Hóa đơn nhập: Tạo và xem hóa đơn nhập hàng
- Hóa đơn bán: Tạo và xem hóa đơn bán hàng

## Lưu ý

- Backend cần chạy tại `http://localhost:5000`
- Cần đăng nhập với tài khoản admin để sử dụng các tính năng



