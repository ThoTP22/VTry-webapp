import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { PAYMENTS_MESSAGES } from '~/constants/messages'
import { CreatePaymentRequest, PaymentWebhookData, CancelPaymentRequest } from '~/models/requests/Payments.requests'
import orderService from '~/services/orders.services'
import payOSService from '~/services/payos.services'
import { PaymentStatus, OrderStatus } from '~/constants/enums'

// Create payment link for an order
export const createPaymentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order_id, payment_method, return_url, cancel_url } = req.body as CreatePaymentRequest
    const { user_id } = req.decoded_authorization!

    // Get order details
    const order = await orderService.getOrderById(new ObjectId(order_id), new ObjectId(user_id))

    if (!order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: PAYMENTS_MESSAGES.ORDER_NOT_FOUND
      })
    }

    console.log('Order found for payment:', {
      order_id: order._id,
      order_number: order.order_number,
      items_count: order.items?.length || 0,
      total_amount: order.total_amount,
      status: order.status
    })

    // Check if order can be paid
    if (order.status !== OrderStatus.Pending) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: PAYMENTS_MESSAGES.ORDER_CANNOT_BE_PAID
      })
    }

    // Check if payment is already completed
    if (order.payment_info.status === PaymentStatus.Completed) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: PAYMENTS_MESSAGES.PAYMENT_ALREADY_COMPLETED
      })
    }

    if (payment_method !== 'payos') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: PAYMENTS_MESSAGES.UNSUPPORTED_PAYMENT_METHOD
      })
    }

    // Create payment link with PayOS
    const paymentLink = await payOSService.createPaymentLink(order)

    // Update order with payment information
    await orderService.updateOrderPaymentInfo(new ObjectId(order_id), {
      payos_order_code: paymentLink.orderCode,
      payment_link_id: paymentLink.paymentLinkId,
      checkout_url: paymentLink.checkoutUrl,
      status: PaymentStatus.Processing
    })

    res.json({
      message: PAYMENTS_MESSAGES.PAYMENT_LINK_CREATED,
      result: {
        order_id,
        order_code: paymentLink.orderCode,
        payment_link_id: paymentLink.paymentLinkId,
        checkout_url: paymentLink.checkoutUrl,
        qr_code: paymentLink.qrCode,
        amount: paymentLink.amount,
        description: paymentLink.description
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get payment status
export const getPaymentStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order_code } = req.params
    const { user_id } = req.decoded_authorization!

    if (!order_code) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: PAYMENTS_MESSAGES.ORDER_CODE_REQUIRED
      })
    }

    // Get payment info from PayOS
    const paymentInfo = await payOSService.getPaymentInfo(parseInt(order_code))

    // Get order from database
    const order = await orderService.getOrderByPayOSCode(parseInt(order_code), new ObjectId(user_id))

    if (!order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: PAYMENTS_MESSAGES.ORDER_NOT_FOUND
      })
    }

    res.json({
      message: PAYMENTS_MESSAGES.GET_PAYMENT_STATUS_SUCCESS,
      result: {
        order_id: order._id,
        order_code: paymentInfo.orderCode,
        amount: paymentInfo.amount,
        status: payOSService.mapPaymentStatus(paymentInfo.status),
        description: paymentInfo.description,
        payment_link_id: paymentInfo.paymentLinkId,
        created_at: paymentInfo.createdAt,
        transaction_info: paymentInfo.transactions || []
      }
    })
  } catch (error) {
    next(error)
  }
}

// Cancel payment
export const cancelPaymentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order_code } = req.params
    const { user_id } = req.decoded_authorization!
    const { cancellation_reason } = req.body as CancelPaymentRequest

    if (!order_code) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: PAYMENTS_MESSAGES.ORDER_CODE_REQUIRED
      })
    }

    // Get order from database
    const order = await orderService.getOrderByPayOSCode(parseInt(order_code), new ObjectId(user_id))

    if (!order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: PAYMENTS_MESSAGES.ORDER_NOT_FOUND
      })
    }

    // Check if payment can be cancelled
    if (order.payment_info.status === PaymentStatus.Completed) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: PAYMENTS_MESSAGES.PAYMENT_CANNOT_BE_CANCELLED
      })
    }

    // Cancel payment in PayOS
    const cancelResult = await payOSService.cancelPaymentLink(parseInt(order_code), cancellation_reason)

    // Update order status
    await orderService.updateOrderPaymentInfo(new ObjectId(order._id!.toString()), {
      status: PaymentStatus.Cancelled
    })

    res.json({
      message: PAYMENTS_MESSAGES.PAYMENT_CANCELLED_SUCCESS,
      result: {
        order_id: order._id,
        order_code: parseInt(order_code),
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason
      }
    })
  } catch (error) {
    next(error)
  }
}

// PayOS Webhook handler
export const paymentWebhookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookData = req.body as PaymentWebhookData

    // Verify webhook signature
    const verifiedData = payOSService.verifyPaymentWebhookData(webhookData)

    if (!verifiedData) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: PAYMENTS_MESSAGES.INVALID_WEBHOOK_SIGNATURE
      })
    }

    const { orderCode, amount, description, reference, transactionDateTime } = verifiedData.data

    // Find order by PayOS order code
    const order = await orderService.getOrderByPayOSCode(orderCode)

    if (!order) {
      console.error(`Order not found for PayOS order code: ${orderCode}`)
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: PAYMENTS_MESSAGES.ORDER_NOT_FOUND
      })
    }

    // Update payment status based on webhook data
    const paymentStatus = payOSService.mapPaymentStatus(verifiedData.data.code)

    await orderService.updateOrderPaymentInfo(new ObjectId(order._id!.toString()), {
      status: paymentStatus as any,
      transaction_id: reference,
      paid_at: paymentStatus === 'completed' ? new Date(transactionDateTime) : undefined
    })

    // If payment is completed, update order status
    if (paymentStatus === 'completed') {
      await orderService.updateOrderStatus(new ObjectId(order._id!.toString()), OrderStatus.Confirmed)
    } else if (paymentStatus === 'cancelled' || paymentStatus === 'expired') {
      await orderService.updateOrderStatus(new ObjectId(order._id!.toString()), OrderStatus.Cancelled)
    }

    // Send response to PayOS
    res.json({
      error: 0,
      message: 'Webhook processed successfully',
      data: {
        orderCode,
        status: paymentStatus
      }
    })
  } catch (error) {
    console.error('Payment webhook error:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 1,
      message: 'Webhook processing failed',
      data: null
    })
  }
}

// Get all payments for a user (for admin or user's own payments)
export const getUserPaymentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, role } = req.decoded_authorization!
    const { page = 1, limit = 10, status } = req.query

    let targetUserId = new ObjectId(user_id)

    // If admin is accessing, they can get payments for any user
    if (role === 'admin' && req.params.user_id) {
      targetUserId = new ObjectId(req.params.user_id)
    }

    const orders = await orderService.getUserOrders(targetUserId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
      // Filter only orders with PayOS payments
    })

    // Filter orders that have PayOS payment info
    const paymentsOrders = orders.orders.filter(
      (order) => order.payment_info.method === 'payos' && order.payment_info.payos_order_code
    )

    res.json({
      message: PAYMENTS_MESSAGES.GET_PAYMENTS_SUCCESS,
      result: {
        payments: paymentsOrders.map((order) => ({
          order_id: order._id,
          order_code: order.payment_info.payos_order_code,
          amount: order.total_amount,
          status: order.payment_info.status,
          payment_method: order.payment_info.method,
          checkout_url: order.payment_info.checkout_url,
          created_at: order.created_at,
          paid_at: order.payment_info.paid_at,
          transaction_id: order.payment_info.transaction_id
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: paymentsOrders.length,
          pages: Math.ceil(paymentsOrders.length / parseInt(limit as string))
        }
      }
    })
  } catch (error) {
    next(error)
  }
}
