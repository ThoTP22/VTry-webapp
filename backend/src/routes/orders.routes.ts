import { Router } from 'express'
import {
  createOrderController,
  getOrderByIdController,
  getOrderByOrderNumberController,
  getUserOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
  cancelOrderController,
  getOrderStatsController
} from '~/controllers/orders.controllers'
import {
  createOrderValidator,
  orderIdValidator,
  orderNumberValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
  getOrdersQueryValidator,
  handleValidationErrors,
  checkOrderOwnership,
  requireAdminForOrders
} from '~/middlewares/orders.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'

const orderRouter = Router()

/**
 * Description: Create a new order
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: CreateOrderRequest
 */
orderRouter.post('/', accessTokenValidator, createOrderValidator, handleValidationErrors, createOrderController)

/**
 * Description: Get user's orders with pagination and filtering
 * Path: /my-orders
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: GetOrdersQuery (status, page, limit, sort, order, from_date, to_date)
 */
orderRouter.get(
  '/my-orders',
  accessTokenValidator,
  getOrdersQueryValidator,
  handleValidationErrors,
  getUserOrdersController
)

/**
 * Description: Get order statistics for current user
 * Path: /my-stats
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
orderRouter.get('/my-stats', accessTokenValidator, getOrderStatsController)

/**
 * Description: Get order by ID (user can only access their own orders, admin can access any)
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 */
orderRouter.get('/:id', accessTokenValidator, orderIdValidator, handleValidationErrors, getOrderByIdController)

/**
 * Description: Get order by order number (user can only access their own orders, admin can access any)
 * Path: /order-number/:orderNumber
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: { orderNumber: string }
 */
orderRouter.get(
  '/order-number/:orderNumber',
  accessTokenValidator,
  orderNumberValidator,
  handleValidationErrors,
  getOrderByOrderNumberController
)

/**
 * Description: Cancel order (user can only cancel their own orders)
 * Path: /:id/cancel
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: CancelOrderRequest
 * Params: { id: string }
 */
orderRouter.patch(
  '/:id/cancel',
  accessTokenValidator,
  cancelOrderValidator,
  handleValidationErrors,
  cancelOrderController
)

// Admin only routes
/**
 * Description: Get all orders (admin only)
 * Path: /admin/all
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: GetOrdersQuery
 */
orderRouter.get(
  '/admin/all',
  accessTokenValidator,
  requireAdminForOrders,
  getOrdersQueryValidator,
  handleValidationErrors,
  getAllOrdersController
)

/**
 * Description: Get order statistics for all users (admin only)
 * Path: /admin/stats
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
orderRouter.get('/admin/stats', accessTokenValidator, requireAdminForOrders, getOrderStatsController)

/**
 * Description: Update order status (admin only)
 * Path: /admin/:id/status
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: UpdateOrderStatusRequest
 * Params: { id: string }
 */
orderRouter.patch(
  '/admin/:id/status',
  accessTokenValidator,
  requireAdminForOrders,
  updateOrderStatusValidator,
  handleValidationErrors,
  updateOrderStatusController
)

export default orderRouter
