# Payments API Documentation - PayOS Integration

## Overview

API thanh toán tích hợp với PayOS, hỗ trợ tạo link thanh toán, theo dõi trạng thái, hủy thanh toán và xử lý webhook.

## Base URL

```
/api/payments
```

## Authentication

Tất cả endpoint đều yêu cầu Bearer Token (trừ webhook):

```
Authorization: Bearer <access_token>
```

## PayOS Configuration

Các biến môi trường cần thiết:

```env
PAYOS_CLIENT_ID=82abc836-12c8-4180-9e51-332c1915d1f7
PAYOS_API_KEY=5d4c6f38-7227-4764-9e08-a40ce7a71dc6
PAYOS_CHECKSUM_KEY=60b26169ab6676a9a3169e11266820dd1fd6d5a16f5cf2466dfc2db8670d2f70
PAYOS_RETURN_URL=http://localhost:3000/payment/success
PAYOS_CANCEL_URL=http://localhost:3000/payment/cancel
PAYOS_WEBHOOK_URL=http://localhost:4000/api/payments/webhook
```

## Payment Status Flow

```
Pending → Processing → Completed
   ↓           ↓
Cancelled   Expired
   ↓
Failed
```

## Endpoints

### 1. Create Payment Link

**POST** `/api/payments/`

Tạo link thanh toán PayOS cho đơn hàng.

**Request Body:**

```json
{
  "order_id": "507f1f77bcf86cd799439012",
  "payment_method": "payos",
  "return_url": "http://localhost:3000/payment/success", // optional
  "cancel_url": "http://localhost:3000/payment/cancel" // optional
}
```

**Response:**

```json
{
  "message": "Payment link created successfully",
  "result": {
    "order_id": "507f1f77bcf86cd799439012",
    "order_code": 1692123456,
    "payment_link_id": "abc123def456",
    "checkout_url": "https://pay.payos.vn/web/abc123def456",
    "qr_code": "https://img.payos.vn/qr/abc123def456.png",
    "amount": 580000,
    "description": "Thanh toán đơn hàng ORD-12345678-ABC123"
  }
}
```

### 2. Get Payment Status

**GET** `/api/payments/status/:order_code`

Kiểm tra trạng thái thanh toán theo order code.

**Parameters:**

- `order_code`: PayOS order code (number)

**Response:**

```json
{
  "message": "Get payment status successfully",
  "result": {
    "order_id": "507f1f77bcf86cd799439012",
    "order_code": 1692123456,
    "amount": 580000,
    "status": "completed",
    "description": "Thanh toán đơn hàng ORD-12345678-ABC123",
    "payment_link_id": "abc123def456",
    "created_at": "2023-08-15T10:30:00.000Z",
    "transaction_info": [
      {
        "reference": "TXN123456789",
        "amount": 580000,
        "accountNumber": "12345678901",
        "description": "Thanh toán qua VietQR",
        "transactionDateTime": "2023-08-15T10:35:00.000Z"
      }
    ]
  }
}
```

### 3. Cancel Payment

**POST** `/api/payments/cancel/:order_code`

Hủy thanh toán (chỉ khi chưa thanh toán thành công).

**Parameters:**

- `order_code`: PayOS order code (number)

**Request Body:**

```json
{
  "cancellation_reason": "Khách hàng đổi ý" // optional
}
```

**Response:**

```json
{
  "message": "Payment cancelled successfully",
  "result": {
    "order_id": "507f1f77bcf86cd799439012",
    "order_code": 1692123456,
    "status": "cancelled",
    "cancelled_at": "2023-08-15T11:00:00.000Z",
    "cancellation_reason": "Khách hàng đổi ý"
  }
}
```

### 4. Get User Payment History

**GET** `/api/payments/my-payments`

Lấy lịch sử thanh toán của user hiện tại.

**Query Parameters:**

- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số item per page (default: 10, max: 100)
- `status` (optional): Lọc theo trạng thái (`pending`, `processing`, `completed`, `failed`, `cancelled`, `expired`)

**Response:**

```json
{
  "message": "Get payments successfully",
  "result": {
    "payments": [
      {
        "order_id": "507f1f77bcf86cd799439012",
        "order_code": 1692123456,
        "amount": 580000,
        "status": "completed",
        "payment_method": "payos",
        "checkout_url": "https://pay.payos.vn/web/abc123def456",
        "created_at": "2023-08-15T10:30:00.000Z",
        "paid_at": "2023-08-15T10:35:00.000Z",
        "transaction_id": "TXN123456789"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 5. PayOS Webhook (No Auth Required)

**POST** `/api/payments/webhook`

Webhook endpoint để nhận thông báo từ PayOS khi có thay đổi trạng thái thanh toán.

**Headers:**

- `x-payos-signature`: PayOS signature for verification

**Request Body:**

```json
{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 1692123456,
    "amount": 580000,
    "description": "Thanh toán đơn hàng ORD-12345678-ABC123",
    "accountNumber": "12345678901",
    "reference": "TXN123456789",
    "transactionDateTime": "2023-08-15T10:35:00.000Z",
    "currency": "VND",
    "paymentLinkId": "abc123def456",
    "code": "00",
    "desc": "Thành công",
    "counterAccountBankId": "970415",
    "counterAccountBankName": "Vietinbank",
    "counterAccountName": "NGUYEN VAN A",
    "counterAccountNumber": "113366668888",
    "virtualAccountName": "CONG TY ABC",
    "virtualAccountNumber": "12345678901"
  },
  "signature": "payos_signature_here"
}
```

**Response:**

```json
{
  "error": 0,
  "message": "Webhook processed successfully",
  "data": {
    "orderCode": 1692123456,
    "status": "completed"
  }
}
```

## Admin Endpoints

### 6. Get User Payments (Admin)

**GET** `/api/payments/admin/user/:user_id/payments`

Admin xem lịch sử thanh toán của bất kỳ user nào.

**Parameters:**

- `user_id`: User ID to get payments for

**Query Parameters:** Same as `/my-payments`

## Error Responses

### 400 Bad Request

```json
{
  "message": "Order cannot be paid at this stage"
}
```

### 404 Not Found

```json
{
  "message": "Order not found"
}
```

### 401 Unauthorized

```json
{
  "message": "Access token is required"
}
```

## PayOS Payment Methods Supported

- **VietQR**: Quét mã QR qua app ngân hàng
- **ATM**: Thẻ ATM nội địa
- **VISA/MasterCard**: Thẻ quốc tế
- **JCB**: Thẻ JCB
- **AMEX**: American Express

## Business Logic

### Payment Flow

1. User tạo đơn hàng → Order status: `pending`
2. User tạo payment link → Payment status: `processing`
3. User thanh toán thành công → Payment status: `completed`, Order status: `confirmed`
4. Nếu thanh toán thất bại → Payment status: `failed`
5. Nếu hủy thanh toán → Payment status: `cancelled`

### Order Code Generation

PayOS sử dụng số nguyên làm order code, được tạo từ Unix timestamp.

### Webhook Security

- PayOS gửi signature trong header `x-payos-signature`
- Server verify signature bằng checksum key
- Chỉ xử lý webhook đã được verify thành công

### Currency

- PayOS chỉ hỗ trợ VND
- Amount phải là số nguyên (không có phần thập phân)

## Integration Examples

### Frontend Integration

```javascript
// Create payment
const createPayment = async (orderId) => {
  const response = await fetch('/api/payments/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      order_id: orderId,
      payment_method: 'payos',
      return_url: 'http://localhost:3000/payment/success',
      cancel_url: 'http://localhost:3000/payment/cancel'
    })
  })

  const data = await response.json()

  // Redirect to PayOS checkout
  if (data.result.checkout_url) {
    window.location.href = data.result.checkout_url
  }
}

// Check payment status
const checkPaymentStatus = async (orderCode) => {
  const response = await fetch(`/api/payments/status/${orderCode}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const data = await response.json()
  return data.result
}
```

### Webhook Handler Testing

```bash
# Test webhook với curl
curl -X POST http://localhost:4000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "x-payos-signature: test_signature" \
  -d '{
    "code": "00",
    "desc": "success",
    "data": {
      "orderCode": 1692123456,
      "amount": 580000,
      "description": "Test payment",
      "reference": "TEST123",
      "transactionDateTime": "2023-08-15T10:35:00.000Z"
    }
  }'
```

## Security Considerations

1. **Webhook Verification**: Always verify PayOS signature
2. **Amount Validation**: Double-check payment amount matches order
3. **Idempotency**: Handle duplicate webhook calls
4. **HTTPS**: Use HTTPS for all payment endpoints in production
5. **Rate Limiting**: Implement rate limiting for payment endpoints

## Error Handling

### Common Error Codes

- `ORDER_NOT_FOUND`: Đơn hàng không tồn tại
- `ORDER_CANNOT_BE_PAID`: Đơn hàng không thể thanh toán (đã thanh toán hoặc đã hủy)
- `PAYMENT_ALREADY_COMPLETED`: Thanh toán đã hoàn tất
- `UNSUPPORTED_PAYMENT_METHOD`: Phương thức thanh toán không được hỗ trợ
- `PAYMENT_LINK_EXPIRED`: Link thanh toán đã hết hạn
- `INVALID_WEBHOOK_SIGNATURE`: Signature webhook không hợp lệ
