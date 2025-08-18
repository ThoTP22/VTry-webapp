/**
 * @swagger
 * components:
 *   schemas:
 *     # Order Schemas
 *     OrderItem:
 *       type: object
 *       required:
 *         - product_id
 *         - quantity
 *         - price
 *       properties:
 *         product_id:
 *           type: string
 *           description: Product ID
 *           example: "60f7b1b3b3f3b3b3b3b3b3b3"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity of the product
 *           example: 2
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Price per item at the time of order
 *           example: 299000
 *         size:
 *           type: string
 *           description: Selected size
 *           example: "L"
 *         color:
 *           type: string
 *           description: Selected color
 *           example: "black"
 *
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - items
 *         - shipping_address
 *         - payment_method
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *           minItems: 1
 *           description: List of order items
 *         shipping_address:
 *           type: object
 *           required:
 *             - full_name
 *             - phone
 *             - address
 *             - city
 *             - district
 *             - ward
 *           properties:
 *             full_name:
 *               type: string
 *               example: "Nguyễn Văn A"
 *             phone:
 *               type: string
 *               example: "0123456789"
 *             address:
 *               type: string
 *               example: "123 Nguyễn Trãi"
 *             city:
 *               type: string
 *               example: "Hồ Chí Minh"
 *             district:
 *               type: string
 *               example: "Quận 1"
 *             ward:
 *               type: string
 *               example: "Phường Bến Nghé"
 *             postal_code:
 *               type: string
 *               example: "70000"
 *         payment_method:
 *           type: string
 *           enum: ["cod", "bank_transfer", "payos"]
 *           example: "payos"
 *         notes:
 *           type: string
 *           description: Order notes
 *           example: "Giao hàng buổi chiều"
 *         coupon_code:
 *           type: string
 *           description: Discount coupon code
 *           example: "NEWUSER10"
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7b1b3b3f3b3b3b3b3b3b3"
 *         order_number:
 *           type: string
 *           description: Unique order number
 *           example: "ORD-20240115-001"
 *         user_id:
 *           type: string
 *           example: "60f7b1b3b3f3b3b3b3b3b3b2"
 *         items:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/components/schemas/OrderItem'
 *               - type: object
 *                 properties:
 *                   product:
 *                     $ref: '#/components/schemas/Product'
 *         subtotal:
 *           type: number
 *           description: Subtotal before shipping and discounts
 *           example: 598000
 *         shipping_fee:
 *           type: number
 *           description: Shipping fee
 *           example: 30000
 *         discount:
 *           type: number
 *           description: Discount amount
 *           example: 50000
 *         total:
 *           type: number
 *           description: Total amount to pay
 *           example: 578000
 *         status:
 *           type: string
 *           enum: ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled"]
 *           example: "pending"
 *         payment_status:
 *           type: string
 *           enum: ["pending", "paid", "failed", "refunded"]
 *           example: "pending"
 *         payment_method:
 *           type: string
 *           enum: ["cod", "bank_transfer", "payos"]
 *           example: "payos"
 *         shipping_address:
 *           type: object
 *           properties:
 *             full_name:
 *               type: string
 *             phone:
 *               type: string
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             district:
 *               type: string
 *             ward:
 *               type: string
 *             postal_code:
 *               type: string
 *         notes:
 *           type: string
 *         tracking_number:
 *           type: string
 *           example: "VN123456789"
 *         estimated_delivery:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     UpdateOrderStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled"]
 *           example: "confirmed"
 *         tracking_number:
 *           type: string
 *           description: Shipping tracking number (for shipping status)
 *           example: "VN123456789"
 *         estimated_delivery:
 *           type: string
 *           format: date-time
 *           description: Estimated delivery date (for shipping status)
 *           example: "2024-01-20T10:00:00.000Z"
 *
 *     CancelOrderRequest:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           description: Reason for cancellation
 *           example: "Changed my mind"
 *
 * # Orders API Endpoints
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with items and shipping information (requires authentication)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *           example:
 *             items:
 *               - product_id: "60f7b1b3b3f3b3b3b3b3b3b3"
 *                 quantity: 2
 *                 price: 299000
 *                 size: "L"
 *                 color: "black"
 *             shipping_address:
 *               full_name: "Nguyễn Văn A"
 *               phone: "0123456789"
 *               address: "123 Nguyễn Trãi"
 *               city: "Hồ Chí Minh"
 *               district: "Quận 1"
 *               ward: "Phường Bến Nghé"
 *               postal_code: "70000"
 *             payment_method: "payos"
 *             notes: "Giao hàng buổi chiều"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order created successfully"
 *                 result:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (insufficient stock, invalid product, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *
 * /api/orders/my-orders:
 *   get:
 *     summary: Get user's orders
 *     description: Retrieve orders for the authenticated user with filtering and pagination
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled"]
 *         description: Filter by order status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: ["created_at", "total", "status"]
 *           default: "created_at"
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: Sort order
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date
 *         example: "2024-01-01"
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders to this date
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get user orders successful"
 *                 result:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve a specific order by ID (requires authentication)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *         example: "60f7b1b3b3f3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get order successful"
 *                 result:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       403:
 *         description: Access denied (not order owner or admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 *
 * /api/orders/order-number/{orderNumber}:
 *   get:
 *     summary: Get order by order number
 *     description: Retrieve a specific order by order number (requires authentication)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number
 *         example: "ORD-20240115-001"
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get order successful"
 *                 result:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 *
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancel order
 *     description: Cancel an order (only if status is pending or confirmed)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *         example: "60f7b1b3b3f3b3b3b3b3b3b3"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelOrderRequest'
 *           example:
 *             reason: "Changed my mind"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order cancelled successfully"
 *                 result:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cannot cancel order (invalid status)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cannot cancel order in current status"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 */

export {}
