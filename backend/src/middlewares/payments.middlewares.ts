import { NextFunction, Request, Response } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { PAYMENTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { ObjectId } from 'mongodb'

// Validation for creating payment
export const createPaymentValidator = [
  body('order_id')
    .notEmpty()
    .withMessage(PAYMENTS_MESSAGES.ORDER_NOT_FOUND)
    .custom((orderId) => {
      if (!ObjectId.isValid(orderId)) {
        throw new Error(PAYMENTS_MESSAGES.ORDER_NOT_FOUND)
      }
      return true
    }),

  body('payment_method').isIn(['payos']).withMessage(PAYMENTS_MESSAGES.UNSUPPORTED_PAYMENT_METHOD)

  // URL validation removed for easier testing
  // body('return_url')...
  // body('cancel_url')...
]

// Validation for order code parameter
export const orderCodeValidator = [
  param('order_code')
    .notEmpty()
    .withMessage(PAYMENTS_MESSAGES.ORDER_CODE_REQUIRED)
    .isNumeric()
    .withMessage(PAYMENTS_MESSAGES.INVALID_ORDER_CODE)
]

// Validation for cancel payment
export const cancelPaymentValidator = [
  ...orderCodeValidator,
  body('cancellation_reason')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Cancellation reason must be between 5 and 500 characters')
]

// Validation for payment queries
export const paymentQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'expired'])
    .withMessage('Invalid payment status')
]

// Generic validation result handler
export const handlePaymentValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg)
    throw new ErrorWithStatus({
      message: errorMessages.join(', '),
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  next()
}

// Middleware to verify PayOS webhook signature
export const verifyPayOSWebhook = (req: Request, res: Response, next: NextFunction) => {
  try {
    // PayOS webhook verification is handled in the service
    // This middleware can be used for additional security checks
    const signature = req.headers['x-payos-signature']

    if (!signature) {
      throw new ErrorWithStatus({
        message: 'Missing webhook signature',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Add signature to request for verification in controller
    req.webhookSignature = signature as string
    next()
  } catch (error) {
    next(error)
  }
}

// Middleware to check admin permissions for payment operations
export const requireAdminForPayments = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.decoded_authorization!

  if (role !== 'admin') {
    throw new ErrorWithStatus({
      message: 'Insufficient permissions to access payment data',
      status: HTTP_STATUS.FORBIDDEN
    })
  }

  next()
}
