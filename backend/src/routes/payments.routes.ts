import { Router } from 'express'
import { ObjectId } from 'mongodb'
import {
  createPaymentController,
  getPaymentStatusController,
  cancelPaymentController,
  paymentWebhookController,
  getUserPaymentsController
} from '~/controllers/payments.controllers'
import {
  createPaymentValidator,
  orderCodeValidator,
  cancelPaymentValidator,
  paymentQueryValidator,
  handlePaymentValidationErrors,
  verifyPayOSWebhook,
  requireAdminForPayments
} from '~/middlewares/payments.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import orderService from '~/services/orders.services'
import { OrderStatus } from '~/constants/enums'

const paymentRouter = Router()

/**
 * Description: Create payment link for an order
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: CreatePaymentRequest
 */
paymentRouter.post(
  '/',
  accessTokenValidator,
  createPaymentValidator,
  handlePaymentValidationErrors,
  createPaymentController
)

/**
 * Description: Get payment status by order code
 * Path: /status/:order_code
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: { order_code: string }
 */
paymentRouter.get(
  '/status/:order_code',
  accessTokenValidator,
  orderCodeValidator,
  handlePaymentValidationErrors,
  getPaymentStatusController
)

/**
 * Description: Cancel payment by order code
 * Path: /cancel/:order_code
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: CancelPaymentRequest
 * Params: { order_code: string }
 */
paymentRouter.post(
  '/cancel/:order_code',
  accessTokenValidator,
  cancelPaymentValidator,
  handlePaymentValidationErrors,
  cancelPaymentController
)

/**
 * Description: PayOS webhook endpoint (no authentication required)
 * Path: /webhook
 * Method: POST
 * Body: PaymentWebhookData
 */
paymentRouter.post('/webhook', verifyPayOSWebhook, paymentWebhookController)

/**
 * Description: Manually update payment status (for testing)
 * Path: /update-status/:order_code
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { status: string }
 */
paymentRouter.post('/update-status/:order_code', accessTokenValidator, async (req, res) => {
  try {
    const { order_code } = req.params
    const { status } = req.body
    const { user_id } = req.decoded_authorization!

    // Get order from database
    const order = await orderService.getOrderByPayOSCode(parseInt(order_code), new ObjectId(user_id))

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      })
    }

    // Update payment status
    await orderService.updateOrderPaymentInfo(new ObjectId(order._id!.toString()), {
      status: status as any,
      paid_at: status === 'completed' ? new Date() : undefined
    })

    // If payment is completed, update order status
    if (status === 'completed') {
      await orderService.updateOrderStatus(new ObjectId(order._id!.toString()), OrderStatus.Confirmed)
    }

    res.json({
      message: 'Payment status updated successfully',
      result: {
        order_id: order._id,
        order_code: parseInt(order_code),
        status: status
      }
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error updating payment status',
      error: error.message
    })
  }
})

/**
 * Description: Get user's payment history
 * Path: /my-payments
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { page?, limit?, status? }
 */
paymentRouter.get(
  '/my-payments',
  accessTokenValidator,
  paymentQueryValidator,
  handlePaymentValidationErrors,
  getUserPaymentsController
)

// Admin only routes
/**
 * Description: Get payments for any user (admin only)
 * Path: /admin/user/:user_id/payments
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { page?, limit?, status? }
 * Params: { user_id: string }
 */
paymentRouter.get(
  '/admin/user/:user_id/payments',
  accessTokenValidator,
  requireAdminForPayments,
  paymentQueryValidator,
  handlePaymentValidationErrors,
  getUserPaymentsController
)

export default paymentRouter
