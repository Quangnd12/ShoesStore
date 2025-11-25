# Cải tiến tính năng Hoàn trả / Đổi hàng

## Vấn đề đã khắc phục

### 1. Dropdown "Sản phẩm trong hóa đơn" vẫn hiển thị sản phẩm đã hoàn trả
**Vấn đề**: Sau khi hoàn trả/đổi hàng thành công, dropdown vẫn hiển thị các sản phẩm đã hoàn trả hết (quantity = 0).

**Giải pháp**: 
- Backend: Thêm điều kiện `AND sii.quantity > 0` vào query `getItems()`
- Frontend: Thêm filter `.filter((item) => item.quantity > 0)` trong dropdown

### 2. Hóa đơn chi tiết không hiển thị lý do hoàn trả/đổi
**Vấn đề**: Không biết khách hàng đã đổi/hoàn trả sản phẩm nào và vì lý do gì.

**Giải pháp**:
- Backend: Thêm hàm `getReturnExchanges()` để lấy lịch sử hoàn trả/đổi
- Controller: Trả về `returnExchanges` cùng với chi tiết hóa đơn
- Frontend: Hiển thị section "Lịch sử hoàn trả / đổi hàng" với đầy đủ thông tin

### 3. Hóa đơn chi tiết hiển thị sản phẩm cũ dù đã đổi
**Vấn đề**: Items không được cập nhật sau khi đổi hàng.

**Giải pháp**: Backend đã xử lý đúng việc cập nhật `sales_invoice_items`:
- Đổi toàn bộ: UPDATE item với product_id mới
- Đổi một phần: Giảm quantity item cũ, thêm item mới
- Hoàn trả: Giảm quantity item (hoặc = 0 nếu hoàn trả hết)

## Thay đổi Backend

### 1. Model: `backend/src/models/SalesInvoice.js`

#### Cập nhật hàm `getItems()`
```javascript
getItems: async (invoiceId) => {
  const [rows] = await db.execute(
    `SELECT sii.*, p.name as product_name, p.brand, p.image_url 
     FROM sales_invoice_items sii 
     LEFT JOIN products p ON sii.product_id = p.id 
     WHERE sii.sales_invoice_id = ? AND sii.quantity > 0`,  // Chỉ lấy items còn quantity > 0
    [invoiceId]
  );
  return rows;
},
```

#### Thêm hàm `getReturnExchanges()`
```javascript
getReturnExchanges: async (invoiceId) => {
  const [rows] = await db.execute(
    `SELECT re.*, 
            rei.sales_invoice_item_id, 
            rei.product_id as old_product_id,
            rei.quantity as return_quantity,
            rei.new_product_id,
            p_old.name as old_product_name,
            p_old.size as old_product_size,
            p_new.name as new_product_name,
            p_new.size as new_product_size
     FROM return_exchanges re
     LEFT JOIN return_exchange_items rei ON re.id = rei.return_exchange_id
     LEFT JOIN products p_old ON rei.product_id = p_old.id
     LEFT JOIN products p_new ON rei.new_product_id = p_new.id
     WHERE re.sales_invoice_id = ?
     ORDER BY re.created_at DESC`,
    [invoiceId]
  );
  return rows;
},
```

### 2. Controller: `backend/src/controllers/salesInvoiceController.js`

```javascript
exports.getSalesInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await SalesInvoice.getById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn bán" });
    }
    const items = await SalesInvoice.getItems(id);
    const returnExchanges = await SalesInvoice.getReturnExchanges(id);  // Thêm dòng này
    res.json({ ...invoice, items, returnExchanges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

## Thay đổi Frontend

### 1. Lọc sản phẩm trong dropdown hoàn trả/đổi

```javascript
<select>
  <option value="">Chọn sản phẩm</option>
  {selectedInvoiceForReturn.items
    ?.filter((item) => item.quantity > 0)  // Chỉ hiển thị items còn hàng
    .map((item) => (
      <option key={item.id} value={item.id}>
        {item.product_name} - Size: {item.size_eu || "N/A"} (SL: {item.quantity})
      </option>
    ))}
</select>
```

### 2. Hiển thị lịch sử hoàn trả/đổi trong chi tiết hóa đơn

```javascript
{selectedInvoice.returnExchanges && selectedInvoice.returnExchanges.length > 0 && (
  <div className="mt-4">
    <h3 className="font-medium mb-2 text-orange-600">
      Lịch sử hoàn trả / đổi hàng
    </h3>
    <div className="space-y-3">
      {selectedInvoice.returnExchanges.map((re, idx) => (
        <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          {/* Hiển thị loại, thời gian, sản phẩm cũ/mới, lý do, ghi chú */}
        </div>
      ))}
    </div>
  </div>
)}
```

## Giao diện mới

### Lịch sử hoàn trả/đổi hàng
- **Badge màu**: 
  - Hoàn trả: Đỏ (bg-red-100 text-red-700)
  - Đổi hàng: Xanh dương (bg-blue-100 text-blue-700)
- **Thông tin hiển thị**:
  - Loại (Hoàn trả / Đổi hàng)
  - Thời gian
  - Sản phẩm cũ (tên, size, số lượng)
  - Sản phẩm mới (nếu là đổi hàng)
  - Lý do
  - Ghi chú (nếu có)

## Lợi ích

1. **Tránh nhầm lẫn**: Không thể chọn sản phẩm đã hoàn trả hết
2. **Minh bạch**: Biết rõ lịch sử hoàn trả/đổi của từng hóa đơn
3. **Dữ liệu chính xác**: Items luôn phản ánh đúng trạng thái hiện tại
4. **Trải nghiệm tốt**: Giao diện rõ ràng, dễ hiểu

## File thay đổi

- `backend/src/models/SalesInvoice.js`
- `backend/src/controllers/salesInvoiceController.js`
- `frontend/src/pages/SalesInvoices.jsx`
