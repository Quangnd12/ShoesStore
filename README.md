# 👟 ShoesStore - Hệ Thống Quản Lý Cửa Hàng Giày Dép

Hệ thống quản lý cửa hàng giày dép với đầy đủ tính năng nhập kho, bán hàng, báo cáo và dashboard.

## 🚀 Công Nghệ

### Backend
- **Node.js** + **Express.js** - REST API
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** + **Vite** - UI Framework
- **React Router** - Routing
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

### DevOps
- **Docker** + **Docker Compose** - Containerization
- **phpMyAdmin** - Database management

## 📦 Cài Đặt

### Yêu Cầu
- Docker Desktop
- Node.js 18+ (nếu chạy local)
- MySQL 8.0+ (nếu chạy local)

### Chạy với Docker (Khuyến nghị)

```bash
# Clone repository
git clone <repository-url>
cd ShoesStore

# Khởi động containers
docker-compose up -d --build

# Truy cập ứng dụng
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# phpMyAdmin: http://localhost:8080
```

**Thông tin đăng nhập:**
- Email: `admin@example.com`
- Password: `admin123`

📖 Xem chi tiết: [docs/deployment/DOCKER_GUIDE.md](./docs/deployment/DOCKER_GUIDE.md)

### Chạy Local (Không dùng Docker)

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Cấu hình database
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 📚 Tài Liệu

Toàn bộ tài liệu được tổ chức trong thư mục [docs/](./docs/):

- **[Deployment](./docs/deployment/)** - Hướng dẫn triển khai
- **[Guides](./docs/guides/)** - Hướng dẫn sử dụng
- **[Implementations](./docs/implementations/)** - Chi tiết triển khai
- **[Features](./docs/features/)** - Danh sách tính năng
- **[Fixes](./docs/fixes/)** - Lịch sử sửa lỗi

## ✨ Tính Năng Chính

### 🏪 Quản Lý Sản Phẩm
- Thêm/sửa/xóa sản phẩm với nhiều size
- Upload ảnh sản phẩm (base64)
- Quản lý tồn kho theo size
- Tìm kiếm và lọc sản phẩm

### 📦 Nhập Hàng
- Tạo hóa đơn nhập từ nhà cung cấp
- Nhập nhiều sản phẩm/size trong một hóa đơn
- Tự động cập nhật tồn kho
- Tự động tăng số hóa đơn

### 💰 Bán Hàng
- Tạo hóa đơn bán nhanh
- Tìm kiếm sản phẩm real-time
- Tính toán tự động tổng tiền
- Lưu thông tin khách hàng

### 📊 Báo Cáo & Dashboard
- Dashboard với widgets tùy chỉnh
- Báo cáo doanh thu theo ngày/tuần/tháng/năm
- Top sản phẩm bán chạy
- Cảnh báo tồn kho thấp
- Biểu đồ tăng trưởng doanh thu

### 🔄 Trả Hàng & Đổi Hàng
- Xử lý trả hàng
- Đổi size/sản phẩm
- Hoàn tiền tự động

## 🗂️ Cấu Trúc Dự Án

```
ShoesStore/
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth, validation
│   │   └── app.js          # Entry point
│   ├── database/           # SQL schemas
│   └── Dockerfile
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx
│   ├── Dockerfile
│   └── nginx.conf
├── docs/                   # Documentation
├── docker-compose.yml      # Dev environment
├── docker-compose.prod.yml # Production environment
└── README.md
```

## 🔐 Bảo Mật

- JWT authentication
- Password hashing với bcrypt
- CORS configuration
- Input validation
- SQL injection prevention

## 🛠️ Development

### Hot Reload
Khi chạy với Docker development mode, code changes tự động reload:
- Backend: Nodemon auto-restart
- Frontend: Vite HMR

### Thêm Dependencies
```bash
# Sau khi npm install
docker-compose up -d --build backend
# hoặc
docker-compose up -d --build frontend
```

### Database Migration
```bash
# Import SQL vào MySQL container
docker exec -i shoe_store_mysql_dev mysql -uroot -pmysql shoe_store < backup.sql
```

## 📝 Changelog

Xem [CHANGELOG.md](./CHANGELOG.md) để biết lịch sử thay đổi.

## 👥 Đóng Góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📄 License

MIT License

---

**Phát triển bởi**: Quang Nguyen
**Cập nhật**: December 2025
