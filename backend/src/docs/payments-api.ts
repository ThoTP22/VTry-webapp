/**
 * @swagger
 * components:
 *   schemas:
 *     # Payment Schemas
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - order_id
 *         - return_url
 *         - cancel_url
 *       properties:
 *         order_id:
 *           type: string
 *           description: Order ID to create payment for
 *           example: "60f7b1b3b3f3b3b3b3b3b3b3"
 *         return_url:
 *           type: string
 *           format: uri
 *           description: URL to redirect after successful payment
 *           example: "https://yourapp.com/payment/success"
 *         cancel_url:
 *           type: string
 *           format: uri
 *           description: URL to redirect after cancelled payment
 *           example: "https://yourapp.com/payment/cancel"
 *         description:
 *           type: string
 *           description: Payment description
 *           example: "Thanh toán đơn hàng ORD-20240115-001"
 *
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Payment created successfully"
 *         result:
 *           type: object
 *           properties:
 *             orderCode:
 *               type: number
 *               description: Unique payment order code
 *               example: 1642234567
 *             amount:
 *               type: number
 *               description: Payment amount
 *               example: 578000
 *             description:
 *               type: string
 *               example: "Thanh toán đơn hàng ORD-20240115-001"
 *             accountNumber:
 *               type: string
 *               example: "12345678"
 *             reference:
 *               type: string
 *               example: "FT22267498765"
 *             checkoutUrl:
 *               type: string
 *               description: URL to redirect user for payment
 *               example: "https://payment.payos.vn/web/..."
 *             qrCode:
 *               type: string
 *               description: Base64 encoded QR code for payment
 *               example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *             status:
 *               type: string
 *               enum: ["PENDING", "PAID", "CANCELLED", "EXPIRED"]
 *               example: "PENDING"
 *
 *     PaymentStatus:
 *       type: object
 *       properties:
 *         orderCode:
 *           type: number
 *           example: 1642234567
 *         amount:
 *           type: number
 *           example: 578000
 *         amountPaid:
 *           type: number
 *           example: 578000
 *         amountRemaining:
 *           type: number
 *           example: 0
 *         status:
 *           type: string
 *           enum: ["PENDING", "PAID", "CANCELLED", "EXPIRED"]
 *           example: "PAID"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         transactions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               reference:
 *                 type: string
 *                 example: "FT22267498765"
 *               amount:
 *                 type: number
 *                 example: 578000
 *               accountNumber:
 *                 type: string
 *                 example: "12345678"
 *               description:
 *                 type: string
 *               transactionDateTime:
 *                 type: string
 *                 format: date-time
 *               virtualAccountName:
 *                 type: string
 *               virtualAccountNumber:
 *                 type: string
 *               counterAccountBankId:
 *                 type: string
 *               counterAccountBankName:
 *                 type: string
 *               counterAccountName:
 *                 type: string
 *               counterAccountNumber:
 *                 type: string
 *
 *     CancelPaymentRequest:
 *       type: object
 *       properties:
 *         cancellationReason:
 *           type: string
 *           description: Reason for payment cancellation
 *           example: "Customer requested cancellation"
 *
 *     PaymentListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get user payments successful"
 *         result:
 *           type: object
 *           properties:
 *             payments:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   order_id:
 *                     type: string
 *                   user_id:
 *                     type: string
 *                   orderCode:
 *                     type: number
 *                   amount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *             pagination:
 *               $ref: '#/components/schemas/PaginationMeta'
 *
 * # Payments API Endpoints
 * /api/payments:
 *   post:
 *     summary: Create payment link
 *     description: Create a payment link for an order using PayOS (requires authentication)
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *           example:
 *             order_id: "60f7b1b3b3f3b3b3b3b3b3b3"
 *             return_url: "https://yourapp.com/payment/success"
 *             cancel_url: "https://yourapp.com/payment/cancel"
 *             description: "Thanh toán đơn hàng ORD-20240115-001"
 *     responses:
 *       201:
 *         description: Payment link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Bad request (order already paid, invalid order, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order has already been paid"
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found"
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *
 * /api/payments/my-payments:
 *   get:
 *     summary: Get user's payments
 *     description: Retrieve payment history for the authenticated user
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["PENDING", "PAID", "CANCELLED", "EXPIRED"]
 *         description: Filter by payment status
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
 *         description: Number of payments per page
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date
 *         example: "2024-01-01"
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments to this date
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *
 * /api/payments/{orderCode}:
 *   get:
 *     summary: Get payment status
 *     description: Get payment status by order code (requires authentication)
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderCode
 *         required: true
 *         schema:
 *           type: number
 *         description: Payment order code
 *         example: 1642234567
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get payment status successful"
 *                 result:
 *                   $ref: '#/components/schemas/PaymentStatus'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment not found"
 *
 * /api/payments/{orderCode}/cancel:
 *   post:
 *     summary: Cancel payment
 *     description: Cancel a payment by order code (requires authentication)
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderCode
 *         required: true
 *         schema:
 *           type: number
 *         description: Payment order code to cancel
 *         example: 1642234567
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelPaymentRequest'
 *           example:
 *             cancellationReason: "Customer requested cancellation"
 *     responses:
 *       200:
 *         description: Payment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment cancelled successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     orderCode:
 *                       type: number
 *                     status:
 *                       type: string
 *                       example: "CANCELLED"
 *       400:
 *         description: Cannot cancel payment (already paid, expired, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cannot cancel paid payment"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment not found"
 *
 * /api/payments/webhook:
 *   post:
 *     summary: Payment webhook
 *     description: Webhook endpoint for PayOS payment status updates (internal use)
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: PayOS webhook payload
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Webhook processed successfully"
 *       400:
 *         description: Invalid webhook signature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid webhook signature"
 */

export {}
