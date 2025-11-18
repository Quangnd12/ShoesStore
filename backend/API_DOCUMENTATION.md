# Tài liệu API - Tính năng Quản lý Nhập/Bán hàng với Size EU

## Tổng quan

Hệ thống đã được mở rộng với các tính năng:

- Quản lý sản phẩm theo size EU (ví dụ: 36.0, 37.5, 42.0)
- Nhập hàng theo túi (nhiều size cùng một sản phẩm)
- Hóa đơn nhập hàng từ nhà cung cấp
- Hóa đơn bán hàng (gộp nhiều sản phẩm trong một lần bán, không phụ thuộc order)
- Báo cáo doanh thu và chi phí theo ngày/tuần/tháng/năm

## Cài đặt Database

Chạy file SQL schema để tạo các bảng mới:

```bash
mysql -u [username] -p [database_name] < src/database/schema.sql
```

Hoặc import file `src/database/schema.sql` vào MySQL.

## API Endpoints

### 1. Products (Quản lý Sản phẩm với Size EU)

#### Nhập hàng theo túi (nhiều size cùng một sản phẩm)

```
POST /api/products/batch
Authorization: Bearer [admin_token]
Content-Type: application/json

{
  "name": "Giày thể thao Nike",
  "description": "Giày thể thao cao cấp",
  "price": 500000,
  "category_id": 1,
  "image_url": "https://example.com/shoe.jpg",
  "discount_price": 450000,
  "brand": "Nike",
  "color": "Đen",
  "sizes": [
    {"size_eu": 36.0, "stock_quantity": 5},
    {"size_eu": 37.0, "stock_quantity": 5},
    {"size_eu": 38.0, "stock_quantity": 5},
    {"size_eu": 39.0, "stock_quantity": 5},
    {"size_eu": 40.0, "stock_quantity": 5}
  ]
}
```

**Lưu ý:** Endpoint này sẽ tạo nhiều products cùng tên nhưng khác size. Mỗi product sẽ có một ID riêng.

#### Lấy tất cả size của một sản phẩm (theo tên)

```
GET /api/products/name/:name
```

Ví dụ: `GET /api/products/name/Giày thể thao Nike` sẽ trả về tất cả các size của sản phẩm này.

#### Thêm sản phẩm đơn lẻ

```
POST /api/products
Authorization: Bearer [admin_token]
Content-Type: application/json

{
  "name": "Giày thể thao Nike",
  "description": "Giày thể thao cao cấp",
  "price": 500000,
  "category_id": 1,
  "stock_quantity": 10,
  "size": 42.0,
  "image_url": "https://example.com/shoe.jpg",
  "brand": "Nike",
  "color": "Đen"
}
```

### 2. Suppliers (Nhà cung cấp)

#### Lấy tất cả nhà cung cấp

```
GET /api/suppliers
```

#### Tạo nhà cung cấp mới

```
POST /api/suppliers
Authorization: Bearer [admin_token]
Content-Type: application/json

{
  "name": "Nhà cung cấp ABC",
  "contact_person": "Nguyễn Văn A",
  "phone": "0123456789",
  "email": "contact@abc.com",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

#### Cập nhật nhà cung cấp

```
PUT /api/suppliers/:id
Authorization: Bearer [admin_token]
```

#### Xóa nhà cung cấp

```
DELETE /api/suppliers/:id
Authorization: Bearer [admin_token]
```

### 3. Purchase Invoices (Hóa đơn Nhập hàng)

#### Tạo hóa đơn nhập hàng

```
POST /api/purchase-invoices
Authorization: Bearer [admin_token]
Content-Type: application/json

{
  "invoice_number": "PN-2024-001",
  "supplier_id": 1,
  "invoice_date": "2024-01-15",
  "notes": "Nhập hàng tháng 1",
  "items": [
    {
      "product_id": 1,
      "quantity": 5,
      "unit_cost": 200000
    },
    {
      "product_id": 2,
      "quantity": 5,
      "unit_cost": 200000
    }
  ]
}


### Mới fix
Trường hợp 1: Nhập hàng cho sản phẩm đã tồn tại

POST /api/purchase-invoices
`
{
  "invoice_number": "PN001",
  "supplier_id": 1,
  "invoice_date": "2025-11-18",
  "items": [
    {
      "product_id": 5,
      "quantity": 100,
      "unit_cost": 500000
    },
    {
      "product_id": 6,
      "quantity": 50,
      "unit_cost": 800000
    }
  ],
  "notes": "Nhập hàng tháng 11"
}

Trường hợp 2: Nhập hàng mới (tạo sản phẩm mới)

{
  "invoice_number": "PN002",
  "supplier_id": 1,
  "invoice_date": "2025-11-18",
  "items": [
    {
      "name": "Nike Air Force 1",
      "description": "Giày thể thao classic",
      "price": 2500000,
      "category_id": 1,
      "brand": "Nike",
      "size": "42",
      "color": "Trắng",
      "image_url": "https://example.com/nike-af1.jpg",
      "discount_price": 2000000,
      "quantity": 50,
      "unit_cost": 1500000
    },
    {
      "name": "Adidas Superstar",
      "description": "Giày thể thao retro",
      "price": 2000000,
      "category_id": 1,
      "brand": "Adidas",
      "size": "41",
      "color": "Đen",
      "quantity": 30,
      "unit_cost": 1200000
    }
  ],
  "notes": "Nhập hàng mới từ nhà cung cấp"
}

Trường hợp 3: Kết hợp cả 2 (sản phẩm cũ + sản phẩm mới)

POST /api/purchase-invoices

{
  "invoice_number": "PN003",
  "supplier_id": 1,
  "invoice_date": "2025-11-18",
  "items": [
    {
      "product_id": 5,
      "quantity": 20,
      "unit_cost": 500000
    },
    {
      "name": "Puma RS-X",
      "description": "Giày chạy bộ",
      "price": 1800000,
      "category_id": 1,
      "brand": "Puma",
      "size": "40",
      "color": "Xanh",
      "quantity": 40,
      "unit_cost": 1100000
    }
  ],
  "notes": "Nhập bổ sung hàng cũ và thêm hàng mới"
}
```

**Lưu ý:**

- Mỗi `product_id` đại diện cho một sản phẩm với size cụ thể (đã được tạo trước đó)
- Khi tạo hóa đơn nhập, hệ thống sẽ tự động:
  - Tính tổng chi phí
  - Cập nhật tồn kho cho product đó
  - Lấy size từ product (không cần truyền size_eu trong items)

#### Lấy tất cả hóa đơn nhập

```
GET /api/purchase-invoices?page=1&limit=10
Authorization: Bearer [admin_token]
```

#### Lấy chi tiết hóa đơn nhập

```
GET /api/purchase-invoices/:id
Authorization: Bearer [token]
```

#### Xóa hóa đơn nhập (sẽ hoàn trả tồn kho)

```
DELETE /api/purchase-invoices/:id
Authorization: Bearer [admin_token]
```

### 4. Sales Invoices (Hóa đơn Bán hàng)

> **Gộp order & sales_invoices:** Nếu database của bạn vẫn còn cột `order_id` trong bảng `sales_invoices`, hãy bỏ cột này để hóa đơn bán hoạt động độc lập:
>
> ```sql
> ALTER TABLE sales_invoices
>   DROP FOREIGN KEY IF EXISTS sales_invoices_ibfk_1,
>   DROP COLUMN order_id;
> ```
>
> (Tùy chọn) Nếu không còn dùng bảng `orders` / `order_items`, bạn có thể drop các bảng đó để đơn giản hệ thống.

#### Tạo hóa đơn bán trực tiếp (một hóa đơn cho nhiều sản phẩm)

```
POST /api/sales-invoices
Authorization: Bearer [admin_token]
Content-Type: application/json

{
  "invoice_number": "HD-2025-010",
  "invoice_date": "2025-10-17",
  "customer_id": 1,            // có thể null nếu khách lẻ
  "notes": "Khách mua trực tiếp tại cửa hàng",
  "items": [
    { "product_id": 1, "quantity": 2, "unit_price": 2500000 },
    { "product_id": 5, "quantity": 1 }   // unit_price sẽ mặc định lấy theo sản phẩm
  ]
}
```

**Lưu ý:**

- `items` là bắt buộc, mỗi item cần `product_id` và `quantity`
- Nếu không gửi `unit_price`, hệ thống sẽ dùng `price` của sản phẩm
- Hệ thống sẽ tự động kiểm tra tồn kho và trừ tồn kho nếu đủ

> **Tip:** Bạn có thể lưu thông tin khách lẻ ngay trên hóa đơn:
>
> ```json
> {
>   "customer_name": "Nguyễn Văn A",
>   "customer_phone": "0909 123 456",
>   "customer_email": "vana@example.com"
> }
> ```
>
> **Tự động tạo user:** Nếu bạn cung cấp `customer_email` nhưng không có `customer_id`, hệ thống sẽ tự động:
>
> - Kiểm tra xem email đã tồn tại trong bảng `users` chưa
> - Nếu chưa có, tự động tạo user mới với:
>   - `username`: lấy từ `customer_name` hoặc phần trước @ của email
>   - `password`: mặc định là "123456" (khách hàng có thể đổi sau)
>   - `role`: "user"
> - Gán `customer_id` vào hóa đơn

#### Lấy tất cả hóa đơn bán

```
GET /api/sales-invoices?page=1&limit=10
Authorization: Bearer [admin_token]
```

#### Lấy chi tiết hóa đơn bán

```
GET /api/sales-invoices/:id
Authorization: Bearer [token]
```

### 5. Return/Exchange (Hoàn trả/Đổi hàng)

#### Tạo yêu cầu hoàn trả hàng

```
POST /api/return-exchanges
Authorization: Bearer [admin_token]
Content-Type: application/json

{
  "sales_invoice_id": 1,
  "type": "return",
  "reason": "Sản phẩm bị lỗi",
  "items": [
    {
      "sales_invoice_item_id": 5,
      "quantity": 1
    }
  ],
  "notes": "Khách hàng yêu cầu hoàn trả"
}
```

**Lưu ý:**

- `type` phải là `"return"` (hoàn trả) hoặc `"exchange"` (đổi hàng)
- Khi hoàn trả, hệ thống sẽ tự động cộng lại tồn kho cho sản phẩm
- `sales_invoice_item_id` là ID của item trong hóa đơn bán (lấy từ chi tiết hóa đơn)

#### Tạo yêu cầu đổi hàng

```
POST /api/return-exchanges
Authorization: Bearer [admin_token]
Content-Type: application/json


{
  "sales_invoice_id": 1,
  "type": "exchange",
  "reason": "Khách muốn đổi sang size khác",
  "items": [
    {
      "sales_invoice_item_id": 5,
      "quantity": 1,
      "new_product_id": 10,
      "new_unit_price": 2500000
    }
  ],
  "notes": "Đổi từ size 42 sang size 43"
}
```

**Lưu ý:**

- Khi đổi hàng, hệ thống sẽ:
  - Cộng lại tồn kho cho sản phẩm cũ
  - Trừ tồn kho cho sản phẩm mới (nếu đủ tồn kho)
- `new_product_id` là bắt buộc khi `type` là `"exchange"`

#### Lấy tất cả yêu cầu hoàn trả/đổi

```
GET /api/return-exchanges?page=1&limit=10
Authorization: Bearer [admin_token]
```

#### Lấy chi tiết yêu cầu hoàn trả/đổi

```
GET /api/return-exchanges/:id
Authorization: Bearer [admin_token]
```

### 6. Reports (Báo cáo)

#### Báo cáo theo ngày

```
GET /api/reports/daily?date=2024-01-15
Authorization: Bearer [admin_token]
```

Response:

```json
{
  "date": "2024-01-15",
  "revenue": {
    "total_revenue": 5000000,
    "invoice_count": 5
  },
  "cost": {
    "total_cost": 2000000,
    "invoice_count": 2
  },
  "profit": 3000000
}
```

#### Báo cáo chi tiết theo ngày

```
GET /api/reports/daily/detail?date=2024-01-15
Authorization: Bearer [admin_token]
```

#### Báo cáo theo tuần

```
GET /api/reports/weekly?year=2024&week=3
Authorization: Bearer [admin_token]
```

#### Báo cáo theo tháng

```
GET /api/reports/monthly?year=2024&month=1
Authorization: Bearer [admin_token]
```

#### Báo cáo theo năm

```
GET /api/reports/yearly?year=2024
Authorization: Bearer [admin_token]
```

#### Báo cáo theo khoảng thời gian

```
GET /api/reports/range?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer [admin_token]
```

## Quy trình sử dụng

### 1. Nhập hàng mới

**Bước 1:** Tạo nhà cung cấp (nếu chưa có)

```
POST /api/suppliers
```

**Bước 2:** Tạo hóa đơn nhập hàng

```
POST /api/purchase-invoices
```

Hệ thống sẽ tự động cập nhật tồn kho cho từng size.

### 2. Bán hàng

**Bước 1:** Khi khách chọn sản phẩm (có thể nhiều size), nhân viên thu ngân kiểm tra tồn kho (GET /api/products hoặc /api/products/name/:name).

**Bước 2:** Tạo hóa đơn bán trực tiếp, nhập danh sách sản phẩm, số lượng, giá (nếu muốn ghi đè):

```
POST /api/sales-invoices
```

Hệ thống sẽ tự động trừ tồn kho cho từng sản phẩm, lưu thông tin khách hàng (nếu nhập) và có thể in/ghi nhận mã hóa đơn để hai bên đối chiếu.

### 3. Xem báo cáo

Xem báo cáo doanh thu và chi phí:

```
GET /api/reports/daily?date=2024-01-15
GET /api/reports/monthly?year=2024&month=1
```

## Lưu ý quan trọng

1. **Size EU:** Hệ thống sử dụng size theo chuẩn EU (ví dụ: 36.0, 37.5, 42.0)
2. **Tồn kho:** Tồn kho được quản lý theo từng size riêng biệt
3. **Hóa đơn:** Mỗi lần nhập/bán đều có hóa đơn để theo dõi
4. **Transaction:** Tất cả các thao tác nhập/bán đều sử dụng transaction để đảm bảo tính nhất quán
5. **Kiểm tra tồn kho:** Hệ thống tự động kiểm tra tồn kho trước khi bán

## Ví dụ sử dụng

### Ví dụ 1: Nhập 1 túi hàng có 5 đôi giày với các size khác nhau

**Cách 1: Sử dụng batch create (khuyến nghị)**

```json
POST /api/products/batch
{
  "name": "Giày thể thao Nike",
  "description": "Giày thể thao cao cấp",
  "price": 500000,
  "category_id": 1,
  "sizes": [
    {"size_eu": 36.0, "stock_quantity": 1},
    {"size_eu": 37.0, "stock_quantity": 1},
    {"size_eu": 38.0, "stock_quantity": 1},
    {"size_eu": 39.0, "stock_quantity": 1},
    {"size_eu": 40.0, "stock_quantity": 1}
  ]
}
```

Sau đó tạo hóa đơn nhập:

```json
POST /api/purchase-invoices
{
  "invoice_number": "PN-2024-001",
  "supplier_id": 1,
  "invoice_date": "2024-01-15",
  "items": [
    {"product_id": 101, "quantity": 1, "unit_cost": 200000},
    {"product_id": 102, "quantity": 1, "unit_cost": 200000},
    {"product_id": 103, "quantity": 1, "unit_cost": 200000},
    {"product_id": 104, "quantity": 1, "unit_cost": 200000},
    {"product_id": 105, "quantity": 1, "unit_cost": 200000}
  ]
}
```

### Ví dụ 2: Xem báo cáo tháng 1/2024

```
GET /api/reports/monthly?year=2024&month=1
```

Response sẽ cho biết:

- Tổng doanh thu bán ra trong tháng
- Tổng chi phí nhập hàng trong tháng
- Lợi nhuận = Doanh thu - Chi phí
