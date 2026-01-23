# 📚 Documentation Index - ShoesStore

Quick reference để tìm tài liệu nhanh chóng.

## 🚀 Quick Links

| Mục đích | Link |
|----------|------|
| **Bắt đầu dự án** | [README.md](./README.md) |
| **Deploy với Docker** | [docs/deployment/DOCKER_GUIDE.md](./docs/deployment/DOCKER_GUIDE.md) |
| **Xem tất cả tài liệu** | [docs/README.md](./docs/README.md) |
| **Lịch sử thay đổi** | [CHANGELOG.md](./CHANGELOG.md) |

## 📂 Tài Liệu Theo Chủ Đề

### 🐳 Docker & Deployment
- [Docker Guide](./docs/deployment/DOCKER_GUIDE.md) - Setup dev & production
- [.env.production](./.env.production) - Production environment variables

### 📖 Hướng Dẫn Sử Dụng
- [Dashboard Widgets](./docs/guides/DASHBOARD_WIDGETS_GUIDE.md)
- [Quick Checkout](./docs/guides/QUICK_CHECKOUT_GUIDE.md)
- [SearchableSelect Component](./docs/guides/SEARCHABLE_SELECT_USAGE_GUIDE.md)
- [Multi-tab Sales Invoices](./docs/guides/SALES_INVOICES_MULTITAB_GUIDE.md)
- [Product Variants](./docs/guides/GROUPED_PRODUCT_VARIANTS_GUIDE.md)

### 🔧 Chi Tiết Kỹ Thuật
- [Auto Increment Invoice](./docs/implementations/AUTO_INCREMENT_INVOICE_NUMBER_IMPLEMENTATION.md)
- [Dashboard Cache](./docs/implementations/DASHBOARD_CACHE_IMPLEMENTATION.md)
- [Invoice Cache](./docs/implementations/INVOICES_CACHE_IMPLEMENTATION.md)
- [SearchableSelect](./docs/implementations/SEARCHABLE_SELECT_IMPLEMENTATION.md)
- [Loading Spinner](./docs/implementations/LOADING_SPINNER_IMPLEMENTATION.md)

### ✨ Tính Năng
- [SearchableSelect](./docs/features/SEARCHABLE_SELECT_FINAL.md)
- [Auto Increment Invoice Number](./docs/features/AUTO_INCREMENT_INVOICE_NUMBER.md)
- [Product Pagination & Cache](./docs/features/PRODUCTS_PAGINATION_CACHE.md)
- [Sales Invoice Search](./docs/features/SALES_INVOICE_SEARCHABLE_PRODUCT.md)
- [Image Zoom Feature](./docs/features/IMAGE_ZOOM_FEATURE.md)

### 🔨 Bug Fixes
- [Sales Invoices Debug](./docs/fixes/DEBUG_SALES_INVOICES.md)
- [Invoice Cache Fix](./docs/fixes/INVOICE_CACHE_FIX.md)
- [Pagination Fixes](./docs/fixes/PAGINATION_AND_FIXES.md)
- [Return/Exchange Improvements](./docs/fixes/RETURN_EXCHANGE_IMPROVEMENTS.md)

## 🔍 Tìm Theo Tính Năng

### SearchableSelect Component
1. [Feature Overview](./docs/features/SEARCHABLE_SELECT_FINAL.md)
2. [Implementation Details](./docs/implementations/SEARCHABLE_SELECT_IMPLEMENTATION.md)
3. [Usage Guide](./docs/guides/SEARCHABLE_SELECT_USAGE_GUIDE.md)
4. [Summary](./docs/features/SEARCHABLE_SELECT_SUMMARY.md)

### Invoice Management
1. [Auto Increment Feature](./docs/features/AUTO_INCREMENT_INVOICE_NUMBER.md)
2. [Implementation](./docs/implementations/AUTO_INCREMENT_INVOICE_NUMBER_IMPLEMENTATION.md)
3. [Cache Implementation](./docs/implementations/INVOICES_CACHE_IMPLEMENTATION.md)
4. [Debug Notes](./docs/fixes/DEBUG_SALES_INVOICES.md)

### Dashboard
1. [Widgets Guide](./docs/guides/DASHBOARD_WIDGETS_GUIDE.md)
2. [Cache Implementation](./docs/implementations/DASHBOARD_CACHE_IMPLEMENTATION.md)

### Products
1. [Pagination & Cache](./docs/features/PRODUCTS_PAGINATION_CACHE.md)
2. [Backend Filter Fix](./docs/fixes/PRODUCTS_BACKEND_FILTER_FIX.md)
3. [Debounce Filter](./docs/fixes/PRODUCTS_DEBOUNCE_FILTER.md)
4. [Product Variants Guide](./docs/guides/GROUPED_PRODUCT_VARIANTS_GUIDE.md)

## 📊 Thống Kê Tài Liệu

- **Tổng số file**: 41+ markdown files
- **Deployment**: 1 guide
- **User Guides**: 7 files
- **Implementations**: 7 files
- **Features**: 11 files
- **Bug Fixes**: 9 files

## 🎯 Workflow Đọc Tài Liệu

### Cho Developer Mới
1. Đọc [README.md](./README.md) - Overview
2. Đọc [DOCKER_GUIDE.md](./docs/deployment/DOCKER_GUIDE.md) - Setup
3. Đọc [IMPLEMENTATION_GUIDE.md](./docs/guides/IMPLEMENTATION_GUIDE.md) - General guide
4. Browse [docs/features/](./docs/features/) - Xem tính năng có sẵn

### Khi Cần Thêm Tính Năng Mới
1. Xem [docs/implementations/](./docs/implementations/) - Học cách implement
2. Xem [docs/features/](./docs/features/) - Tham khảo tính năng tương tự
3. Xem [docs/fixes/](./docs/fixes/) - Tránh lỗi đã biết

### Khi Gặp Lỗi
1. Xem [docs/fixes/](./docs/fixes/) - Tìm fix tương tự
2. Xem [CHANGELOG.md](./CHANGELOG.md) - Kiểm tra breaking changes

## 📝 Cấu Trúc Thư Mục

```
ShoesStore/
├── README.md                    ← Bắt đầu ở đây
├── CHANGELOG.md                 ← Lịch sử thay đổi
├── DOCUMENTATION_INDEX.md       ← File này
├── docker-compose.yml           ← Dev environment
├── docker-compose.prod.yml      ← Production
│
├── docs/                        ← Tất cả tài liệu
│   ├── README.md               ← Index chính
│   ├── ORGANIZATION.md         ← Cách tổ chức
│   ├── deployment/             ← Docker guides
│   ├── guides/                 ← User guides
│   ├── implementations/        ← Technical details
│   ├── features/               ← Feature specs
│   └── fixes/                  ← Bug fixes
│
├── backend/                     ← Node.js API
└── frontend/                    ← React app
```

## 💡 Tips

- Dùng Ctrl+F để tìm kiếm trong file này
- Mỗi thư mục có README.md riêng
- Link trong tài liệu đều hoạt động
- Tài liệu được cập nhật liên tục

## 🔗 External Resources

- [Docker Documentation](https://docs.docker.com/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

**Cập nhật**: January 23, 2026
