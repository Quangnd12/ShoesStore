# Hướng dẫn sử dụng Docker cho Shoe Store Project

## Yêu cầu
- Docker Desktop đã được cài đặt và đang chạy
- Port 3307, 5000, 5173, 8080 không bị sử dụng bởi ứng dụng khác

## Cách chạy dự án

### 1. Môi trường Development (Khuyến nghị)
```bash
# Cách 1: Sử dụng script có sẵn
start-dev.bat

# Cách 2: Chạy trực tiếp
docker-compose up -d
```

### 2. Môi trường Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Các dịch vụ và cổng

### Development Environment
- **Frontend (React)**: http://localhost:5173
- **Backend (Node.js API)**: http://localhost:5000
- **phpMyAdmin**: http://localhost:8080
- **MySQL Database**: localhost:3307
  - Username: root
  - Password: mysql
  - Database: shoe_store

### Production Environment
- **Frontend (Nginx)**: http://localhost:80
- **Backend (Node.js API)**: http://localhost:5000
- **MySQL Database**: Internal network only

## Các lệnh hữu ích

### Quản lý containers
```bash
# Xem trạng thái containers
docker-compose ps

# Xem logs
docker-compose logs -f

# Dừng tất cả services
docker-compose down
# hoặc sử dụng script
stop-dev.bat

# Rebuild containers (khi có thay đổi Dockerfile)
docker-compose up --build

# Xóa tất cả (bao gồm volumes)
docker-compose down -v
```

### Truy cập vào containers
```bash
# Vào backend container
docker exec -it shoe_store_backend_dev sh

# Vào frontend container
docker exec -it shoe_store_frontend_dev sh

# Vào MySQL container
docker exec -it shoe_store_mysql_dev mysql -u root -p
```

### Backup và Restore Database
```bash
# Backup
docker exec shoe_store_mysql_dev mysqldump -u root -pmysql shoe_store > backup.sql

# Restore
docker exec -i shoe_store_mysql_dev mysql -u root -pmysql shoe_store < backup.sql
```

## Troubleshooting

### Lỗi thường gặp
1. **Port đã được sử dụng**: Thay đổi port trong docker-compose.yml
2. **Docker không chạy**: Khởi động Docker Desktop
3. **Container không start**: Kiểm tra logs với `docker-compose logs`

### Reset hoàn toàn
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Cấu trúc dự án trong Docker
```
shoe-store/
├── backend/          # Node.js API
├── frontend/         # React App
├── docker-compose.yml        # Development config
├── docker-compose.prod.yml   # Production config
├── start-dev.bat            # Script khởi động dev
└── stop-dev.bat             # Script dừng dev
```