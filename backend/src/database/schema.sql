-- Schema cho tính năng quản lý nhập hàng và bán hàng với size EU
-- Lưu ý: Mỗi record trong bảng products đại diện cho một sản phẩm với nhiều sizes

-- Cập nhật cột size trong bảng products thành VARCHAR để lưu nhiều sizes
-- ALTER TABLE products MODIFY COLUMN size VARCHAR(255) COMMENT 'Danh sách sizes (ví dụ: 36, 37, 38, 39, 40 hoặc S, M, L, XL)';

-- Bảng suppliers: Nhà cung cấp
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng purchase_invoices: Hóa đơn nhập hàng
CREATE TABLE IF NOT EXISTS purchase_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'Số hóa đơn nhập',
  supplier_id INT NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Tổng chi phí nhập hàng',
  invoice_date DATE NOT NULL,
  notes TEXT,
  created_by INT COMMENT 'User ID người tạo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  INDEX idx_invoice_number (invoice_number),
  INDEX idx_supplier_id (supplier_id),
  INDEX idx_invoice_date (invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng purchase_invoice_items: Chi tiết hóa đơn nhập hàng
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_invoice_id INT NOT NULL,
  product_id INT NOT NULL,
  size_eu VARCHAR(20) COMMENT 'Size đơn lẻ (ví dụ: 38, 39, S, M, L)',
  quantity INT NOT NULL COMMENT 'Số lượng nhập',
  unit_cost DECIMAL(15,2) NOT NULL COMMENT 'Giá nhập mỗi đơn vị',
  total_cost DECIMAL(15,2) NOT NULL COMMENT 'Tổng chi phí = quantity * unit_cost',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_invoice_id) REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_purchase_invoice_id (purchase_invoice_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng sales_invoices: Hóa đơn bán hàng (gộp nhiều sản phẩm trong một lần)
CREATE TABLE IF NOT EXISTS sales_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'Số hóa đơn bán',
  customer_id INT COMMENT 'User ID khách hàng (nếu có)',
  customer_name VARCHAR(255) COMMENT 'Tên khách lẻ',
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  total_revenue DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Tổng doanh thu',
  invoice_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  INDEX idx_invoice_number (invoice_number),
  INDEX idx_customer_id (customer_id),
  INDEX idx_invoice_date (invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng sales_invoice_items: Chi tiết hóa đơn bán hàng
CREATE TABLE IF NOT EXISTS sales_invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sales_invoice_id INT NOT NULL,
  product_id INT NOT NULL,
  size_eu VARCHAR(20) COMMENT 'Size đơn lẻ (ví dụ: 38, 39, S, M, L)',
  quantity INT NOT NULL COMMENT 'Số lượng bán',
  unit_price DECIMAL(15,2) NOT NULL COMMENT 'Giá bán mỗi đơn vị',
  total_price DECIMAL(15,2) NOT NULL COMMENT 'Tổng giá = quantity * unit_price',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sales_invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_sales_invoice_id (sales_invoice_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng return_exchanges: Hoàn trả/Đổi hàng
CREATE TABLE IF NOT EXISTS return_exchanges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sales_invoice_id INT NOT NULL,
  type ENUM('return', 'exchange') NOT NULL COMMENT 'return: hoàn trả, exchange: đổi hàng',
  reason TEXT COMMENT 'Lý do hoàn trả/đổi',
  notes TEXT,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sales_invoice_id) REFERENCES sales_invoices(id),
  INDEX idx_sales_invoice_id (sales_invoice_id),
  INDEX idx_type (type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng return_exchange_items: Chi tiết hoàn trả/đổi hàng
CREATE TABLE IF NOT EXISTS return_exchange_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  return_exchange_id INT NOT NULL,
  sales_invoice_item_id INT NOT NULL COMMENT 'Item gốc từ hóa đơn bán',
  product_id INT NOT NULL COMMENT 'Sản phẩm hoàn trả',
  quantity INT NOT NULL COMMENT 'Số lượng hoàn trả/đổi',
  new_product_id INT DEFAULT NULL COMMENT 'Sản phẩm mới (nếu đổi hàng)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (return_exchange_id) REFERENCES return_exchanges(id) ON DELETE CASCADE,
  FOREIGN KEY (sales_invoice_item_id) REFERENCES sales_invoice_items(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (new_product_id) REFERENCES products(id),
  INDEX idx_return_exchange_id (return_exchange_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Bảng product_sizes: Quản lý số lượng theo từng size của sản phẩm
CREATE TABLE IF NOT EXISTS product_sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size_value VARCHAR(20) NOT NULL COMMENT 'Giá trị size (ví dụ: 36, 37, 38, S, M, L, XL)',
  quantity INT NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho của size này',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_size (product_id, size_value),
  INDEX idx_product_id (product_id),
  INDEX idx_size_value (size_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
