import { Router } from 'express'
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
