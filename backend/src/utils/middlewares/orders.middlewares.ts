import { NextFunction, Request, Response } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { OrderStatus, PaymentMethod } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import orderService from '~/services/orders.services'
import Order from '~/models/schemas/Order.schema'

// Validation for creating order
export const createOrderValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage(ORDERS_MESSAGES.ITEMS_REQUIRED)
    .custom((items) => {
      for (const item of items) {
        if (!item.product_id || !ObjectId.isValid(item.product_id)) {
          throw new Error(ORDERS_MESSAGES.INVALID_PRODUCT_ID)
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(ORDERS_MESSAGES.INVALID_QUANTITY)
        }
      }
      return true
    }),

  body('shipping_address.fullname').notEmpty().withMessage(ORDERS_MESSAGES.SHIPPING_ADDRESS_FULLNAME_REQUIRED),

  body('shipping_address.phone').notEmpty().withMessage(ORDERS_MESSAGES.SHIPPING_ADDRESS_PHONE_REQUIRED),

  body('shipping_address.address_line_1').notEmpty().withMessage(ORDERS_MESSAGES.SHIPPING_ADDRESS_LINE1_REQUIRED),

  body('shipping_address.city').notEmpty().withMessage(ORDERS_MESSAGES.SHIPPING_ADDRESS_CITY_REQUIRED),

  body('shipping_address.state').notEmpty().withMessage(ORDERS_MESSAGES.SHIPPING_ADDRESS_STATE_REQUIRED),

  body('shipping_address.postal_code').notEmpty().withMessage(ORDERS_MESSAGES.SHIPPING_ADDRESS_POSTAL_CODE_REQUIRED),

  body('shipping_address.country').notEmpty().withMessage(ORDERS_MESSAGES.SHIPPING_ADDRESS_COUNTRY_REQUIRED),

  body('payment_method').isIn(Object.values(PaymentMethod)).withMessage(ORDERS_MESSAGES.INVALID_PAYMENT_METHOD),

  body('currency').optional().isString().withMessage(ORDERS_MESSAGES.INVALID_CURRENCY),
  body('notes').optional().isString().withMessage(ORDERS_MESSAGES.INVALID_NOTES)
]

// Validation for order ID parameter
export const orderIdValidator = [
  param('id').custom((id) => {
    if (!ObjectId.isValid(id)) {
      throw new Error(ORDERS_MESSAGES.INVALID_ORDER_ID)
    }
    return true
  })
]

// Validation for order number parameter
export const orderNumberValidator = [param('orderNumber').notEmpty().withMessage(ORDERS_MESSAGES.ORDER_NUMBER_REQUIRED)]

// Validation for updating order status
export const updateOrderStatusValidator = [
  ...orderIdValidator,
  body('status').isIn(Object.values(OrderStatus)).withMessage(ORDERS_MESSAGES.INVALID_ORDER_STATUS),
  body('tracking_number').optional().isString().withMessage(ORDERS_MESSAGES.INVALID_TRACKING_NUMBER),
  body('estimated_delivery_date').optional().isISO8601().withMessage(ORDERS_MESSAGES.INVALID_DELIVERY_DATE)
]

// Validation for cancelling order
export const cancelOrderValidator = [
  ...orderIdValidator,
  body('cancellation_reason')
    .notEmpty()
    .isLength({ min: 5, max: 500 })
    .withMessage(ORDERS_MESSAGES.INVALID_CANCELLATION_REASON)
]

// Validation for getting orders query
export const getOrdersQueryValidator = [
  query('status').optional().isIn(Object.values(OrderStatus)).withMessage(ORDERS_MESSAGES.INVALID_ORDER_STATUS),
  query('page').optional().isInt({ min: 1 }).toInt().withMessage(ORDERS_MESSAGES.INVALID_PAGE),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage(ORDERS_MESSAGES.INVALID_LIMIT),
  query('sort')
    .optional()
    .isIn(['created_at', 'updated_at', 'total_amount'])
    .withMessage(ORDERS_MESSAGES.INVALID_SORT_FIELD),
  query('order').optional().isIn(['asc', 'desc']).withMessage(ORDERS_MESSAGES.INVALID_SORT_ORDER),
  query('from_date').optional().isISO8601().withMessage(ORDERS_MESSAGES.INVALID_FROM_DATE),
  query('to_date').optional().isISO8601().withMessage(ORDERS_MESSAGES.INVALID_TO_DATE)
]

// Generic validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
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

// Middleware to check if user owns the order (for user-specific operations)
export const checkOrderOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: orderId } = req.params
    const { user_id } = req.decoded_authorization!

    const orderData = await orderService.getOrderById(new ObjectId(orderId), new ObjectId(user_id))

    if (!orderData) {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Assuming you have an Order class that takes orderData as a constructor argument
    req.order = new Order(orderData)
    next()
  } catch (error) {
    next(error)
  }
}

// Middleware to check admin permissions for admin-only operations
export const requireAdminForOrders = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.decoded_authorization!

  if (role !== 'admin') {
    throw new ErrorWithStatus({
      message: ORDERS_MESSAGES.INSUFFICIENT_PERMISSIONS,
      status: HTTP_STATUS.FORBIDDEN
    })
  }

  next()
}
