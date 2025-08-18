# Orders API Documentation

## Overview

API này cung cấp đầy đủ chức năng quản lý đơn hàng cho ứng dụng e-commerce, bao gồm tạo đơn hàng, theo dõi trạng thái, hủy đơn hàng và thống kê.

## Base URL

```
/api/orders
```

## Authentication

Tất cả các endpoint đều yêu cầu Bearer Token trong header:

```
Authorization: Bearer <access_token>
```

## Order Status Flow

```
Pending → Confirmed → Processing → Shipped → Delivered
   ↓
Cancelled (chỉ có thể hủy khi ở trạng thái Pending hoặc Confirmed)
```

## Payment Methods

- `credit_card` - Thẻ tín dụng
- `debit_card` - Thẻ ghi nợ
- `paypal` - PayPal
- `bank_transfer` - Chuyển khoản ngân hàng
- `cash_on_delivery` - Thanh toán khi nhận hàng

## Endpoints

### 1. Create Order

**POST** `/api/orders/`

Tạo đơn hàng mới cho người dùng hiện tại.

**Request Body:**

```json
{
  "items": [
    {
      "product_id": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "shipping_address": {
    "fullname": "Nguyen Van A",
    "phone": "0123456789",
    "address_line_1": "123 Nguyen Trai",
    "address_line_2": "Phuong 1", // optional
    "city": "Ho Chi Minh",
    "state": "Ho Chi Minh",
    "postal_code": "70000",
    "country": "Vietnam"
  },
  "billing_address": {
    // optional, same format as shipping_address
    // Nếu không cung cấp, sẽ sử dụng shipping_address
  },
  "payment_method": "cash_on_delivery",
  "currency": "VND", // optional, default: "USD"
  "notes": "Giao hàng trong giờ hành chính" // optional
}
```

**Response:**

```json
{
  "message": "Order created successfully",
  "result": {
    "_id": "507f1f77bcf86cd799439012",
    "user_id": "507f1f77bcf86cd799439010",
    "order_number": "ORD-12345678-ABC123",
    "items": [
      {
        "product_id": "507f1f77bcf86cd799439011",
        "product_name": "Áo thun nam",
        "product_image": "https://example.com/image.jpg",
        "quantity": 2,
        "unit_price": 250000,
        "total_price": 500000
      }
    ],
    "subtotal": 500000,
    "tax_amount": 50000,
    "shipping_fee": 30000,
    "discount_amount": 0,
    "total_amount": 580000,
    "currency": "VND",
    "status": "pending",
    "payment_info": {
      "method": "cash_on_delivery",
      "status": "pending"
    },
    "shipping_address": {
      /* ... */
    },
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### 2. Get User's Orders

**GET** `/api/orders/my-orders`

Lấy danh sách đơn hàng của người dùng hiện tại với phân trang và lọc.

**Query Parameters:**

- `status` (optional): Lọc theo trạng thái (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`)
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số item per page (default: 10, max: 100)
- `sort` (optional): Sắp xếp theo (`created_at`, `updated_at`, `total_amount`) (default: `created_at`)
- `order` (optional): Thứ tự sắp xếp (`asc`, `desc`) (default: `desc`)
- `from_date` (optional): Lọc từ ngày (ISO-8601 format)
- `to_date` (optional): Lọc đến ngày (ISO-8601 format)

**Example:**

```
GET /api/orders/my-orders?status=pending&page=1&limit=10&sort=created_at&order=desc
```

### 3. Get Order by ID

**GET** `/api/orders/:id`

Lấy chi tiết đơn hàng theo ID. User chỉ có thể xem đơn hàng của mình, Admin có thể xem tất cả.

### 4. Get Order by Order Number

**GET** `/api/orders/order-number/:orderNumber`

Lấy chi tiết đơn hàng theo mã đơn hàng.

### 5. Cancel Order

**PATCH** `/api/orders/:id/cancel`

Hủy đơn hàng (chỉ được phép khi order ở trạng thái `pending` hoặc `confirmed`).

**Request Body:**

```json
{
  "cancellation_reason": "Đổi ý không muốn mua nữa"
}
```

### 6. Get User's Order Statistics

**GET** `/api/orders/my-stats`

Lấy thống kê đơn hàng của người dùng hiện tại.

**Response:**

```json
{
  "message": "Get order stats successfully",
  "result": {
    "total_orders": 15,
    "total_revenue": 5500000,
    "pending": 2,
    "confirmed": 1,
    "processing": 3,
    "shipped": 4,
    "delivered": 4,
    "cancelled": 1,
    "refunded": 0
  }
}
```

## Admin-Only Endpoints

### 7. Get All Orders (Admin)

**GET** `/api/orders/admin/all`

Lấy tất cả đơn hàng trong hệ thống (chỉ Admin). Hỗ trợ cùng query parameters như endpoint `/my-orders`.

### 8. Get All Order Statistics (Admin)

**GET** `/api/orders/admin/stats`

Lấy thống kê tổng thể của tất cả đơn hàng (chỉ Admin).

### 9. Update Order Status (Admin)

**PATCH** `/api/orders/admin/:id/status`

Cập nhật trạng thái đơn hàng (chỉ Admin).

**Request Body:**

```json
{
  "status": "shipped",
  "tracking_number": "VN123456789", // optional
  "estimated_delivery_date": "2023-01-05T00:00:00.000Z" // optional
}
```

## Error Responses

### 400 Bad Request

```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized

```json
{
  "message": "Access token is required"
}
```

### 403 Forbidden

```json
{
  "message": "Insufficient permissions to access this resource"
}
```

### 404 Not Found

```json
{
  "message": "Order not found"
}
```

## Business Logic

### Order Calculation

- **Subtotal**: Tổng giá trị sản phẩm
- **Tax**: 10% của subtotal
- **Shipping Fee**: 30,000 VND (miễn phí nếu subtotal > 2,500,000 VND)
- **Total**: Subtotal + Tax + Shipping Fee - Discount

### Order Number Generation

Mã đơn hàng được tạo tự động theo format: `ORD-{timestamp}-{random}`

### Cancellation Rules

- Chỉ có thể hủy đơn hàng khi ở trạng thái `pending` hoặc `confirmed`
- Người dùng chỉ có thể hủy đơn hàng của chính mình
- Admin có thể hủy bất kỳ đơn hàng nào

### Permission Rules

- **Users**: Chỉ có thể xem và thao tác với đơn hàng của chính mình
- **Admin**: Có thể xem, chỉnh sửa tất cả đơn hàng và truy cập các endpoint thống kê tổng thể

## Database Schema

### Order Collection

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "order_number": "String",
  "items": [
    {
      "product_id": "ObjectId",
      "product_name": "String",
      "product_image": "String",
      "quantity": "Number",
      "unit_price": "Number",
      "total_price": "Number"
    }
  ],
  "subtotal": "Number",
  "tax_amount": "Number",
  "shipping_fee": "Number",
  "discount_amount": "Number",
  "total_amount": "Number",
  "currency": "String",
  "status": "String",
  "payment_info": {
    "method": "String",
    "status": "String",
    "transaction_id": "String", // optional
    "paid_at": "Date" // optional
  },
  "shipping_address": {
    "fullname": "String",
    "phone": "String",
    "address_line_1": "String",
    "address_line_2": "String", // optional
    "city": "String",
    "state": "String",
    "postal_code": "String",
    "country": "String"
  },
  "billing_address": {
    /* same as shipping_address */
  }, // optional
  "notes": "String", // optional
  "estimated_delivery_date": "Date", // optional
  "tracking_number": "String", // optional
  "created_at": "Date",
  "updated_at": "Date",
  "cancelled_at": "Date", // optional
  "cancellation_reason": "String" // optional
}
```
