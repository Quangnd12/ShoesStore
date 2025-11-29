# Fix Cache Issue - Invoice Pages

## Vấn đề

Khi thêm mới hóa đơn (Purchase/Sales), danh sách hóa đơn không cập nhật ngay lập tức. Phải reload trình duyệt mới thấy hóa đơn mới.

**Nguyên nhân chính**: 
1. Cache đang hoạt động nhưng không được xóa/reset đúng cách
2. `fetchInvoices()` vẫn check cache ngay cả sau khi `setPageCache({})`
3. Nếu user đang ở trang 1, `setCurrentPage(1)` không trigger useEffect
4. Race condition: `setPageCache({})` chưa kịp clear thì `fetchInvoices()` đã chạy

## Giải pháp

### 1. PurchaseInvoices

#### Vấn đề phát hiện:
- ✅ `handleSubmitAll`: Đã có `setPageCache({})`
- ❌ `handleDelete`: Thiếu `setPageCache({})`
- ❌ Không reset về trang 1 sau khi thêm mới

#### Fix áp dụng:

**fetchInvoices - Thêm forceRefresh parameter:**
```javascript
const fetchInvoices = async (forceRefresh = false) => {
  try {
    const cacheKey = JSON.stringify({
      page: currentPage,
      limit: itemsPerPage,
      filters: filters,
    });

    // Kiểm tra cache (skip nếu forceRefresh)
    if (!forceRefresh && pageCache[cacheKey]) {
      const cached = pageCache[cacheKey];
      setInvoices(cached.invoices);
      setTotalPages(cached.totalPages);
      setLoading(false);
      return;
    }
    
    // ... fetch from API
  }
};
```

**handleSubmitAll - Force refresh:**
```javascript
setActiveTabIndex(0);

// Xóa cache vì dữ liệu đã thay đổi
setPageCache({});
// Reset về trang 1 để thấy hóa đơn mới
setCurrentPage(1);
// Force refresh để bỏ qua cache
await fetchInvoices(true);
window.dispatchEvent(new Event("products-updated"));
```

**handleDelete - Force refresh:**
```javascript
const handleDelete = async (id) => {
  if (!window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return;
  try {
    await purchaseInvoicesAPI.delete(id);
    showToast("Xóa hóa đơn nhập thành công!", "success");
    
    // Xóa cache vì dữ liệu đã thay đổi
    setPageCache({});
    // Force refresh để bỏ qua cache
    await fetchInvoices(true);
  } catch (error) {
    showToast(error.response?.data?.message || "Có lỗi xảy ra", "error");
  }
};
```

### 2. SalesInvoices

#### Vấn đề phát hiện:
- ✅ `handleSubmit`: Đã có `setPageCache({})`
- ❌ Không reset về trang 1 sau khi thêm mới

#### Fix áp dụng:

**fetchInvoices - Thêm forceRefresh parameter:**
```javascript
const fetchInvoices = async (forceRefresh = false) => {
  try {
    const cacheKey = JSON.stringify({
      page: currentPage,
      limit: itemsPerPage,
      filters: filters,
    });

    // Kiểm tra cache (skip nếu forceRefresh)
    if (!forceRefresh && pageCache[cacheKey]) {
      const cached = pageCache[cacheKey];
      setInvoices(cached.invoices);
      setTotalPages(cached.totalPages);
      setLoading(false);
      return;
    }
    
    // ... fetch from API
  }
};
```

**handleSubmit - Force refresh:**
```javascript
// Xóa cache vì dữ liệu đã thay đổi
setPageCache({});
// Reset về trang 1 để thấy hóa đơn mới
setCurrentPage(1);
// Force refresh để bỏ qua cache
await fetchInvoices(true);
await fetchProducts();
```

## Cơ chế Cache

### Cache Structure
```javascript
const [pageCache, setPageCache] = useState({});

// Cache key format
const cacheKey = JSON.stringify({
  page: currentPage,
  limit: itemsPerPage,
  filters: filters,
});

// Cache data structure
{
  "page-1-limit-10-filters-{}": {
    invoices: [...],
    totalPages: 5,
    timestamp: 1701234567890
  }
}
```

### Cache Invalidation Strategy

#### 1. Clear All Cache
```javascript
setPageCache({});
```
**Khi nào dùng:**
- Sau khi thêm mới hóa đơn
- Sau khi xóa hóa đơn
- Sau khi cập nhật hóa đơn

#### 2. Reset to Page 1
```javascript
setCurrentPage(1);
```
**Khi nào dùng:**
- Sau khi thêm mới (hóa đơn mới thường ở trang đầu)
- Sau khi thay đổi filters

#### 3. Keep Current Page
```javascript
// Không reset page
fetchInvoices();
```
**Khi nào dùng:**
- Sau khi xóa (giữ nguyên trang hiện tại)
- Sau khi cập nhật (giữ nguyên vị trí)

## Flow Diagram

### Before Fix (Attempt 1)
```
User thêm hóa đơn mới (đang ở page 1)
    ↓
handleSubmitAll() executed
    ↓
setPageCache({}) ✅
    ↓
setCurrentPage(1) → No change! (already page 1)
    ↓
useEffect NOT triggered ❌
    ↓
fetchInvoices() called manually
    ↓
Check cache → pageCache still has old data! ❌
    ↓
Return cached data → Không thấy hóa đơn mới! ❌
```

**Vấn đề**: Race condition - `setPageCache({})` là async, chưa kịp clear thì `fetchInvoices()` đã check cache!

### After Fix (Final)
```
User thêm hóa đơn mới
    ↓
handleSubmitAll() executed
    ↓
setPageCache({}) ✅
    ↓
setCurrentPage(1) ✅
    ↓
await fetchInvoices(true) ✅ (forceRefresh = true)
    ↓
Skip cache check → Fetch directly from API ✅
    ↓
Get fresh data with new invoice
    ↓
Update cache with new data
    ↓
Hóa đơn mới hiển thị ngay! ✅
```

## Testing

### Test Case 1: Thêm hóa đơn mới
```
1. Mở trang Purchase Invoices
2. Đang ở trang 2
3. Click "Thêm hóa đơn nhập"
4. Điền thông tin và submit
5. Expected: Tự động về trang 1 và thấy hóa đơn mới
6. Result: ✅ Pass
```

### Test Case 2: Xóa hóa đơn
```
1. Mở trang Purchase Invoices
2. Đang ở trang 2
3. Click xóa một hóa đơn
4. Expected: Giữ nguyên trang 2, danh sách cập nhật
5. Result: ✅ Pass
```

### Test Case 3: Cache vẫn hoạt động
```
1. Load trang 1 → Cache MISS
2. Chuyển sang trang 2 → Cache MISS
3. Quay lại trang 1 → Cache HIT ✅
4. Result: ✅ Pass
```

### Test Case 4: Sales Invoices
```
1. Mở trang Sales Invoices
2. Đang ở trang 3
3. Thêm hóa đơn mới
4. Expected: Tự động về trang 1 và thấy hóa đơn mới
5. Result: ✅ Pass
```

## Best Practices

### 1. Always Clear Cache on Data Mutation
```javascript
// Good
await api.create(data);
setPageCache({});
fetchData();

// Bad
await api.create(data);
fetchData(); // Cache vẫn còn!
```

### 2. Reset Page on Create
```javascript
// Good - User sees new item immediately
setPageCache({});
setCurrentPage(1);
fetchData();

// Bad - User might not see new item
setPageCache({});
fetchData(); // Still on page 5
```

### 3. Keep Page on Delete
```javascript
// Good - User stays on current page
setPageCache({});
fetchData(); // Stay on current page

// Bad - Confusing UX
setPageCache({});
setCurrentPage(1); // Jump to page 1
fetchData();
```

### 4. Dispatch Events for Related Updates
```javascript
// Good - Update related components
setPageCache({});
fetchInvoices();
window.dispatchEvent(new Event("products-updated"));

// Bad - Products not updated
setPageCache({});
fetchInvoices();
```

## Related Files

- `frontend/src/pages/PurchaseInvoices.jsx`
- `frontend/src/pages/SalesInvoices.jsx`
- `frontend/src/pages/ProductsEnhanced.jsx` (reference implementation)

## Performance Impact

### Before Fix
- Cache works but shows stale data
- User confusion
- Extra page navigation needed

### After Fix
- Cache works correctly
- Fresh data after mutations
- Better UX
- No performance degradation

## Root Cause Analysis

### Vấn đề chính: Race Condition

```javascript
// ❌ Cách cũ - Race condition
setPageCache({});        // Async state update
fetchInvoices();         // Runs immediately, cache chưa clear!

// ✅ Cách mới - Force refresh
setPageCache({});        // Clear cache
await fetchInvoices(true); // Skip cache check, fetch fresh data
```

### Tại sao `setPageCache({})` không đủ?

React state updates là **asynchronous**. Khi gọi `setPageCache({})`, state không clear ngay lập tức. Nếu `fetchInvoices()` chạy ngay sau đó, nó vẫn thấy cache cũ!

### Giải pháp: forceRefresh Parameter

Thay vì dựa vào việc clear cache, ta thêm parameter `forceRefresh` để **bỏ qua** cache check hoàn toàn.

```javascript
const fetchInvoices = async (forceRefresh = false) => {
  // Skip cache nếu forceRefresh = true
  if (!forceRefresh && pageCache[cacheKey]) {
    return cached data;
  }
  
  // Fetch fresh data from API
  const response = await api.getAll();
  // ...
};
```

## Kết luận

Cache issue đã được fix thành công:

- ✅ PurchaseInvoices: forceRefresh on create/delete
- ✅ SalesInvoices: forceRefresh on create
- ✅ Cache vẫn hoạt động bình thường cho các lần load khác
- ✅ Không còn race condition
- ✅ UX được cải thiện đáng kể
- ✅ Không ảnh hưởng performance

**Giờ thêm/xóa hóa đơn sẽ thấy cập nhật ngay lập tức!** 🎉
