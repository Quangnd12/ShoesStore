# 🐳 Hướng Dẫn Docker Deployment

## 📋 Tổng Quan

Dự án này hỗ trợ Docker với 2 môi trường:
- **Development**: Hot reload, volume mounting, debug mode
- **Production**: Optimized builds, nginx, security hardening

## 🚀 Môi Trường Development

### Khởi động dự án (lần đầu)
```bash
docker-compose up -d --build
```

### Khởi động dự án (lần sau)
```bash
docker-compose up -d
```

### Dừng dự án
```bash
docker-compose down
```

### Xem logs
```bash
# Tất cả services
docker-compose logs -f

# Chỉ backend
docker-compose logs -f backend

# Chỉ frontend
docker-compose logs -f frontend
```

### Truy cập ứng dụng
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **phpMyAdmin**: http://localhost:8080
- **MySQL**: localhost:3307 (từ host machine)

### Thông tin đăng nhập mặc định
- **Email**: admin@example.com
- **Password**: admin123

### Hot Reload trong Dev
Khi bạn chỉnh sửa code:
- **Backend**: Nodemon tự động restart
- **Frontend**: Vite HMR tự động reload
- **Không cần rebuild** container!

### Rebuild khi thay đổi dependencies
```bash
# Rebuild tất cả
docker-compose up -d --build

# Rebuild chỉ backend
docker-compose up -d --build backend

# Rebuild chỉ frontend
docker-compose up -d --build frontend
```

## 🏭 Môi Trường Production

### Chuẩn bị
1. Cập nhật file `.env.production` với thông tin bảo mật
2. Đảm bảo đã commit code mới nhất

### Deploy Production
```bash
# Build và khởi động
docker-compose -f docker-compose.prod.yml up -d --build

# Hoặc với env file
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Quản lý Production
```bash
# Xem logs
docker-compose -f docker-compose.prod.yml logs -f

# Dừng
docker-compose -f docker-compose.prod.yml down

# Restart service
docker-compose -f docker-compose.prod.yml restart backend
```

### Truy cập Production
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3000

## 🔄 Workflow Phát Triển

### Khi làm việc với code mới
1. Chỉnh sửa code trong editor
2. Container tự động nhận thay đổi (volume mount)
3. Backend/Frontend tự động reload
4. Test ngay lập tức

### Khi thêm package mới
```bash
# Thêm package vào package.json
npm install <package-name>

# Rebuild container
docker-compose up -d --build backend
# hoặc
docker-compose up -d --build frontend
```

### Khi cần reset database
```bash
# Dừng và xóa volumes
docker-compose down -v

# Khởi động lại (sẽ tạo DB mới)
docker-compose up -d
```

## 🔧 Troubleshooting

### Port đã được sử dụng
Nếu AMPPS đang chạy:
- Backend: Đổi port trong docker-compose.yml (3000 -> 3001)
- MySQL: Đã dùng 3307 để tránh conflict
- Frontend: Đổi port (5173 -> 5174)

### Container không start
```bash
# Xem logs chi tiết
docker-compose logs backend

# Restart container
docker-compose restart backend
```

### Hot reload không hoạt động
```bash
# Rebuild container
docker-compose up -d --build

# Kiểm tra volume mounting
docker-compose config
```

### Database connection error
```bash
# Kiểm tra MySQL đã ready chưa
docker-compose logs mysql

# Restart backend sau khi MySQL ready
docker-compose restart backend
```

## 📦 Cấu Trúc Docker

```
project/
├── docker-compose.yml          # Dev environment
├── docker-compose.prod.yml     # Production environment
├── .dockerignore               # Global ignore
├── .env.production             # Production env vars
├── backend/
│   ├── Dockerfile              # Multi-stage build
│   └── .dockerignore
└── frontend/
    ├── Dockerfile              # Multi-stage build
    ├── nginx.conf              # Nginx config for prod
    └── .dockerignore
```

## 🎯 Best Practices

### Development
- ✅ Sử dụng volume mounting cho hot reload
- ✅ Expose ports để debug
- ✅ Sử dụng nodemon/vite dev server
- ✅ Logs verbose để debug

### Production
- ✅ Multi-stage builds để giảm image size
- ✅ Không mount volumes (security)
- ✅ Sử dụng nginx cho frontend
- ✅ Environment variables cho config
- ✅ Health checks cho services
- ✅ Restart policies

## 🔐 Security Notes

### Production Checklist
- [ ] Đổi `DB_PASSWORD` trong `.env.production`
- [ ] Đổi `JWT_SECRET` thành giá trị mới
- [ ] Không expose phpMyAdmin ra ngoài
- [ ] Sử dụng HTTPS với reverse proxy (nginx/traefik)
- [ ] Giới hạn MySQL chỉ internal network
- [ ] Regular backup database

## 🚢 Deploy lên Server

### Sử dụng Docker Compose
```bash
# Copy files lên server
scp -r . user@server:/path/to/app

# SSH vào server
ssh user@server

# Navigate và deploy
cd /path/to/app
docker-compose -f docker-compose.prod.yml up -d --build
```

### Sử dụng CI/CD
Tích hợp với GitHub Actions, GitLab CI, hoặc Jenkins để tự động build và deploy.

## 📊 Monitoring

### Kiểm tra resource usage
```bash
docker stats
```

### Kiểm tra container health
```bash
docker-compose ps
```

### Backup database
```bash
docker exec shoe_store_mysql_prod mysqldump -u root -p shoe_store > backup.sql
```

## 💡 Tips

1. **Phát triển song song với AMPPS**: Dùng ports khác nhau
2. **Import database**: Copy SQL files vào `backend/database/`
3. **Debug trong container**: `docker exec -it shoe_store_backend_dev sh`
4. **Clean up**: `docker system prune -a` để xóa unused images

---

Chúc bạn deploy thành công! 🎉
