# 🚀 Deployment Documentation

Tài liệu về triển khai và cấu hình môi trường.

## 📄 Tài Liệu

### [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
Hướng dẫn chi tiết về Docker deployment:
- Cấu hình Docker Compose cho dev & production
- Volume mounting cho hot reload
- Quản lý containers
- Troubleshooting
- Best practices

## 🎯 Quick Start

```bash
# Development
docker-compose up -d --build

# Production
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔗 Liên Kết

- [Quay lại tài liệu chính](../README.md)
