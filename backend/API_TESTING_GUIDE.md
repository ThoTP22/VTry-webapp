# 🧪 Testing API với Swagger UI

## 🚀 Bắt đầu

1. **Khởi động server:**

   ```bash
   npm run dev
   ```

2. **Truy cập Swagger UI:**
   ```
   http://localhost:[PORT]/api-docs
   ```
   (PORT sẽ được hiển thị trong console khi server khởi động)

## 📋 Test Flow Recommendations

### Phase 1: 🔍 **Kiểm tra cơ bản**

1. **Health Check** - `GET /api/test/health`
2. **Echo Test** - `POST /api/test/echo`

### Phase 2: 👤 **Authentication Flow**

3. **User Register** - `POST /api/users/register`
4. **User Login** - `POST /api/users/login` → Lấy access_token
5. **Set Authorization** - Click "Authorize" button, nhập Bearer token
6. **Get User Profile** - `GET /api/users/me`

### Phase 3: 🛍️ **Products Management**

7. **Get All Products** - `GET /api/products/all`
8. **Create Product** - `POST /api/products/create` (cần auth)
9. **Get Product by ID** - `GET /api/products/{id}`
10. **Update Product** - `POST /api/products/update` (cần auth)

### Phase 4: 🖼️ **Images Upload**

11. **Upload Single Image** - `POST /api/images/upload` (cần auth)
12. **Upload Multiple Images** - `POST /api/images/upload-multiple` (cần auth)
13. **Delete Image** - `DELETE /api/images/delete` (cần auth)

### Phase 5: 🛒 **Orders Management**

14. **Create Order** - `POST /api/orders` (cần auth)
15. **Get User Orders** - `GET /api/orders/my-orders` (cần auth)
16. **Get Order by ID** - `GET /api/orders/{id}` (cần auth)
17. **Cancel Order** - `POST /api/orders/{id}/cancel` (cần auth)

### Phase 6: 💳 **Payments**

18. **Create Payment** - `POST /api/payments` (cần auth)
19. **Get Payment Status** - `GET /api/payments/{orderCode}` (cần auth)
20. **Get User Payments** - `GET /api/payments/my-payments` (cần auth)

## 🔧 Tips cho Testing

### 1. **Sample Data Templates**

#### User Registration:

```json
{
  "email": "testuser@example.com",
  "password": "Password123!",
  "confirm_password": "Password123!",
  "fullname": "Test User",
  "date_of_birth": "1995-06-15"
}
```

#### Create Product:

```json
{
  "name": "Áo thun nam basic",
  "description": "Áo thun nam cơ bản, chất liệu cotton 100%",
  "price": 299000,
  "category": "shirts",
  "brand": "Local Brand",
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["white", "black", "blue"],
  "stock": 100
}
```

#### Create Order:

```json
{
  "items": [
    {
      "product_id": "PRODUCT_ID_FROM_CREATE_PRODUCT_RESPONSE",
      "quantity": 2,
      "price": 299000,
      "size": "L",
      "color": "black"
    }
  ],
  "shipping_address": {
    "full_name": "Nguyễn Văn A",
    "phone": "0123456789",
    "address": "123 Nguyễn Trãi",
    "city": "Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé",
    "postal_code": "70000"
  },
  "payment_method": "payos",
  "notes": "Giao hàng buổi chiều"
}
```

#### Create Payment:

```json
{
  "order_id": "ORDER_ID_FROM_CREATE_ORDER_RESPONSE",
  "return_url": "https://yourapp.com/payment/success",
  "cancel_url": "https://yourapp.com/payment/cancel",
  "description": "Thanh toán đơn hàng"
}
```

### 2. **Testing Image Uploads**

- **Supported formats:** JPEG, PNG, GIF, WebP
- **Max file size:** 5MB per image
- **Max files:** 10 images for multiple upload
- **Tip:** Use small test images để test nhanh hơn

### 3. **Debug với Network Tab**

- Mở Developer Tools (F12)
- Tab "Network" để xem requests/responses chi tiết
- Kiểm tra HTTP status codes và error messages

### 4. **Common Error Codes**

- **400**: Bad Request (dữ liệu không hợp lệ)
- **401**: Unauthorized (thiếu hoặc sai token)
- **403**: Forbidden (không có quyền truy cập)
- **404**: Not Found (resource không tồn tại)
- **413**: Payload Too Large (file quá lớn)
- **422**: Validation Error (lỗi validation form)
- **500**: Server Error (lỗi server)

### 5. **Advanced Testing Tips**

#### Testing File Uploads:

1. Chọn "Try it out" trong Swagger UI
2. Click "Choose file" button
3. Chọn image file từ máy tính
4. Click "Execute"

#### Testing Pagination:

- Thử các query parameters khác nhau:
  - `?page=1&limit=5`
  - `?page=2&limit=10`

#### Testing Filters:

- Products: `?category=shirts&search=áo thun`
- Orders: `?status=pending&from_date=2024-01-01`
- Payments: `?status=PAID`

## 🐛 Troubleshooting

### Lỗi CORS

Nếu gặp lỗi CORS khi test:

```json
{
  "message": "CORS policy blocked"
}
```

➡️ Kiểm tra server đã cấu hình CORS đúng chưa

### Lỗi 401 Unauthorized

```json
{
  "message": "Access token is required"
}
```

➡️ Đảm bảo đã set Bearer token đúng cách

### Lỗi Validation

```json
{
  "message": "Validation failed",
  "errors": {...}
}
```

➡️ Kiểm tra format dữ liệu input theo schema

## 📊 Response Format

Tất cả API responses đều có format chuẩn:

```json
{
  "message": "Success/Error message",
  "result": {
    // Data object
  }
}
```

## 🎯 Advanced Testing

### Test với cURL (từ Swagger UI)

1. Sau khi execute request thành công
2. Click "Copy as cURL"
3. Có thể chạy trong terminal để test bên ngoài Swagger

### Export OpenAPI Spec

- Truy cập: `http://localhost:[PORT]/api-docs.json`
- Import vào Postman hoặc tools khác

---

**🎉 Happy Testing!**

Nếu gặp vấn đề gì, kiểm tra console log của server để debug.
