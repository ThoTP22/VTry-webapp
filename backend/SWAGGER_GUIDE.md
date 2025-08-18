# Swagger API Documentation Setup

## Tổng quan

Dự án này đã được cấu hình với Swagger/OpenAPI 3.0 để tạo documentation tự động cho API endpoints.

## Cách sử dụng

### 1. Truy cập Swagger UI

Sau khi khởi động server, bạn có thể truy cập Swagger UI tại:

```
http://localhost:4000/api-docs
```

### 2. Cấu trúc file

- **Cấu hình Swagger**: `src/config/swagger.ts`
- **Documentation trong routes**: Các file `src/routes/*.ts` chứa JSDoc comments với Swagger annotations

### 3. Cách thêm documentation cho API endpoints

#### Cơ bản:

```typescript
/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     summary: Mô tả ngắn gọn của endpoint
 *     tags: [TagName]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchemaName'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseSchema'
 *       400:
 *         description: Bad request
 */
```

#### Định nghĩa Schema:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     UserRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 */
```

#### Authentication:

```typescript
/**
 * @swagger
 * /api/protected-endpoint:
 *   get:
 *     summary: Protected endpoint
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
```

### 4. Tags thường dùng

- `Users` - Các endpoint liên quan đến user
- `Products` - Các endpoint liên quan đến sản phẩm
- `Images` - Các endpoint liên quan đến hình ảnh
- `Orders` - Các endpoint liên quan đến đơn hàng
- `Payments` - Các endpoint liên quan đến thanh toán

### 5. Các loại dữ liệu Schema thường dùng

```typescript
// String với validation
email: type: string
format: email

// Number với giới hạn
price: type: number
minimum: 0

// Array
tags: type: array
items: type: string

// Object lồng nhau
address: type: object
properties: street: type: string
city: type: string

// Date
created_at: type: string
format: date - time
```

### 6. Response templates thường dùng

```typescript
// Success Response
ApiResponse: type: object
properties: message: type: string
result: type: object

// Error Response
ErrorResponse: type: object
properties: message: type: string
errors: type: object
```

## Lưu ý

1. **Auto-refresh**: Swagger UI sẽ tự động cập nhật khi bạn thay đổi code và restart server
2. **Testing**: Bạn có thể test API trực tiếp từ Swagger UI
3. **Authentication**: Sử dụng "Authorize" button trong Swagger UI để thêm Bearer token
4. **Export**: Bạn có thể export OpenAPI specification ở format JSON từ `/api-docs.json`

## Ví dụ hoàn chỉnh

Xem file `src/routes/users.routes.ts` để có ví dụ hoàn chỉnh về cách sử dụng Swagger annotations.
