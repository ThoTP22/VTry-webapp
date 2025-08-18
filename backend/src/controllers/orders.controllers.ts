import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDERS_MESSAGES } from '~/constants/messages'
import {
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  GetOrdersQuery
} from '~/models/requests/Orders.requests'
import orderService from '~/services/orders.services'
import { OrderStatus } from '~/constants/enums'

export const createOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.decoded_authorization!
    const orderData = req.body as CreateOrderRequest

    const result = await orderService.createOrder(new ObjectId(user_id), orderData)

    res.json({
      message: ORDERS_MESSAGES.CREATE_ORDER_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getOrderByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: orderId } = req.params
    const { user_id, role } = req.decoded_authorization!

    // Admin can view any order, users can only view their own orders
    const userId = role === 'admin' ? undefined : new ObjectId(user_id)
    const result = await orderService.getOrderById(new ObjectId(orderId), userId)

    if (!result) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ORDERS_MESSAGES.ORDER_NOT_FOUND
      })
    }

    res.json({
      message: ORDERS_MESSAGES.GET_ORDER_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getOrderByOrderNumberController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.params
    const { user_id, role } = req.decoded_authorization!

    // Admin can view any order, users can only view their own orders
    const userId = role === 'admin' ? undefined : new ObjectId(user_id)
    const result = await orderService.getOrderByOrderNumber(orderNumber, userId)

    if (!result) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ORDERS_MESSAGES.ORDER_NOT_FOUND
      })
    }

    res.json({
      message: ORDERS_MESSAGES.GET_ORDER_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getUserOrdersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.decoded_authorization!
    const query = req.query as GetOrdersQuery

    const result = await orderService.getUserOrders(new ObjectId(user_id), query)

    res.json({
      message: ORDERS_MESSAGES.GET_ORDERS_SUCCESS,
      result: result.orders,
      pagination: result.pagination
    })
  } catch (error) {
    next(error)
  }
}

export const getAllOrdersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as GetOrdersQuery
    const result = await orderService.getAllOrders(query)

    res.json({
      message: ORDERS_MESSAGES.GET_ORDERS_SUCCESS,
      result: result.orders,
      pagination: result.pagination
    })
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: orderId } = req.params
    const { status, tracking_number, estimated_delivery_date } = req.body as UpdateOrderStatusRequest

    const deliveryDate = estimated_delivery_date ? new Date(estimated_delivery_date) : undefined

    const result = await orderService.updateOrderStatus(new ObjectId(orderId), status, tracking_number, deliveryDate)

    if (!result) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ORDERS_MESSAGES.ORDER_NOT_FOUND
      })
    }

    res.json({
      message: ORDERS_MESSAGES.UPDATE_ORDER_STATUS_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const cancelOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: orderId } = req.params
    const { user_id } = req.decoded_authorization!
    const { cancellation_reason } = req.body as CancelOrderRequest

    const result = await orderService.cancelOrder(new ObjectId(orderId), new ObjectId(user_id), cancellation_reason)

    if (!result) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ORDERS_MESSAGES.ORDER_NOT_FOUND
      })
    }

    res.json({
      message: ORDERS_MESSAGES.CANCEL_ORDER_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getOrderStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, user_id } = req.decoded_authorization!

    // Admin can see all stats, users can only see their own stats
    const userId = role === 'admin' ? undefined : new ObjectId(user_id)
    const result = await orderService.getOrderStats(userId)

    res.json({
      message: ORDERS_MESSAGES.GET_ORDER_STATS_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}
