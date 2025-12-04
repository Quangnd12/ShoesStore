# Debounce cho Bộ lọc Sản phẩm

## Vấn đề

Khi người dùng gõ từng ký tự vào ô tìm kiếm (tên sản phẩm, thương hiệu...), hệ thống gọi API liên tục sau mỗi lần gõ.

### Ví dụ:
Gõ "Giày Nike" (9 ký tự) → 9 API calls:
1. `GET /api/products?name=G`
2. `GET /api/products?name=Gi`
3. `GET /api/products?name=Giầ`
4. `GET /api/products?name=Giày`
5. `GET /api/products?name=Giày `
6. `GET /api/products?name=Giày N`
7. `GET /api/products?name=Giày Ni`
8. `GET /api/products?name=Giày Nik`
9. `GET /api/products?name=Giày Nike`

### Hậu quả:
- ❌ Tải nặng cho server (nhiều request không cần thiết)
- ❌ Giảm hiệu năng giao diện
- ❌ Tốn băng thông và tài nguyên backend
- ❌ Trải nghiệm người dùng kém (loading liên tục)

## Giải pháp: Debounce

**Debounce** là kỹ thuật trì hoãn việc thực thi một hàm cho đến khi người dùng ngừng thao tác trong một khoảng thời gian nhất định.

### Cách hoạt động:
- Người dùng gõ "Giày Nike"
- Hệ thống chờ 500ms sau khi người dùng ngừng gõ
- Chỉ gọi API 1 lần với `name=Giày Nike`

## Triển khai

### 1. Tách state thành 2 phần

```javascript
// State cho input (cập nhật ngay lập tức)
const [inputFilters, setInputFilters] = useState({
  name: "",
  category: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  minStock: "",
  maxStock: "",
});

// State thực sự dùng để gọi API (sau debounce)
const [filters, setFilters] = useState({
  name: "",
  category: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  minStock: "",
  maxStock: "",
});
```

### 2. Thêm useEffect với debounce

```javascript
// Debounce filters: Chờ 500ms sau khi người dùng ngừng gõ
useEffect(() => {
  const debounceTimer = setTimeout(() => {
    setFilters(inputFilters);
  }, 500);

  // Cleanup: Hủy timer cũ khi inputFilters thay đổi
  return () => clearTimeout(debounceTimer);
}, [inputFilters]);
```

### 3. Cập nhật input để dùng inputFilters

```javascript
// TRƯỚC (Gọi API ngay)
<input
  value={filters.name}
  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
/>

// SAU (Debounce 500ms)
<input
  value={inputFilters.name}
  onChange={(e) => setInputFilters({ ...inputFilters, name: e.target.value })}
/>
```

### 4. API vẫn dùng filters (đã debounce)

```javascript
useEffect(() => {
  fetchProducts();
}, [currentPage, itemsPerPage, filters]); // filters, không phải inputFilters
```

## Luồng hoạt động

### Khi người dùng gõ "Giày Nike":

1. **Gõ "G"**:
   - `inputFilters.name = "G"`
   - Timer bắt đầu đếm 500ms
   
2. **Gõ "i" (sau 100ms)**:
   - `inputFilters.name = "Gi"`
   - Timer cũ bị hủy
   - Timer mới bắt đầu đếm 500ms
   
3. **Gõ "ầ" (sau 100ms)**:
   - `inputFilters.name = "Giầ"`
   - Timer cũ bị hủy
   - Timer mới bắt đầu đếm 500ms
   
4. **... tiếp tục cho đến "Giày Nike"**

5. **Ngừng gõ 500ms**:
   - Timer hoàn thành
   - `setFilters(inputFilters)` được gọi
   - `filters.name = "Giày Nike"`
   - `fetchProducts()` được trigger
   - **Chỉ 1 API call**: `GET /api/products?name=Giày Nike`

## Lợi ích

### Trước khi có Debounce:
- Gõ "Giày Nike" → **9 API calls**
- Thời gian: ~900ms (9 calls × 100ms)
- Băng thông: 9× dữ liệu

### Sau khi có Debounce:
- Gõ "Giày Nike" → **1 API call**
- Thời gian: ~100ms (1 call)
- Băng thông: 1× dữ liệu

### Cải thiện:
- ✅ Giảm 89% số lượng API calls
- ✅ Giảm tải server
- ✅ Tiết kiệm băng thông
- ✅ Tăng hiệu năng frontend
- ✅ Trải nghiệm người dùng tốt hơn (không loading liên tục)

## Tùy chỉnh thời gian Debounce

```javascript
// Nhanh hơn (300ms) - Phản hồi nhanh nhưng nhiều calls hơn
const debounceTimer = setTimeout(() => {
  setFilters(inputFilters);
}, 300);

// Chậm hơn (800ms) - Ít calls nhưng phản hồi chậm
const debounceTimer = setTimeout(() => {
  setFilters(inputFilters);
}, 800);

// Khuyến nghị: 500ms - Cân bằng giữa UX và hiệu năng
```

## Áp dụng cho các trường khác

Debounce hoạt động tốt cho:
- ✅ Tìm kiếm text (name, brand)
- ✅ Nhập số (price, stock)
- ⚠️ Dropdown/Select: Không cần debounce (chọn 1 lần)
- ⚠️ Checkbox: Không cần debounce (toggle 1 lần)

## Testing

### Test cases:
1. ✅ Gõ nhanh → Chỉ 1 API call sau khi ngừng
2. ✅ Gõ chậm (>500ms giữa các ký tự) → Nhiều calls (đúng)
3. ✅ Xóa text → API call với filter rỗng
4. ✅ Chọn dropdown → API call ngay lập tức
5. ✅ Clear filters → Reset cả inputFilters và filters

## So sánh với Throttle

| Kỹ thuật | Cách hoạt động | Use case |
|----------|----------------|----------|
| **Debounce** | Chờ đến khi ngừng thao tác | Tìm kiếm, autocomplete |
| **Throttle** | Giới hạn số lần gọi trong khoảng thời gian | Scroll, resize window |

**Ví dụ Throttle**: Gọi API tối đa 1 lần/giây, bất kể gõ bao nhiêu ký tự.

## File thay đổi

**`frontend/src/pages/ProductsEnhanced.jsx`**

### Thêm mới:
- State `inputFilters`: Lưu giá trị input tạm thời
- useEffect debounce: Chờ 500ms trước khi cập nhật `filters`

### Cập nhật:
- Tất cả input onChange: Dùng `setInputFilters` thay vì `setFilters`
- Tất cả input value: Dùng `inputFilters` thay vì `filters`
- `clearFilters()`: Reset cả `inputFilters`

## Best Practices

1. **Cleanup timer**: Luôn return `clearTimeout` trong useEffect
2. **Thời gian hợp lý**: 300-800ms tùy use case
3. **Visual feedback**: Có thể thêm loading indicator khi đang debounce
4. **Không debounce mọi thứ**: Chỉ áp dụng cho text input
5. **Test kỹ**: Đảm bảo không bị miss API call

## Nâng cao: Custom Hook

Có thể tạo custom hook để tái sử dụng:

```javascript
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Sử dụng
const debouncedFilters = useDebounce(inputFilters, 500);
```
