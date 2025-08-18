import { Collection, ObjectId } from 'mongodb'
import databaseService from './database.services'
import Order, { OrderType } from '~/models/schemas/Order.schema'
import { CreateOrderRequest, GetOrdersQuery } from '~/models/requests/Orders.requests'
import { OrderStatus, PaymentStatus } from '~/constants/enums'
import Product from '~/models/schemas/Product.schema'
import User from '~/models/schemas/User.schema'

class OrderService {
  private orders: Collection<OrderType>
  private products: Collection<Product>
  private users: Collection<User>

  constructor() {
    this.orders = databaseService.orders
    this.products = databaseService.products
    this.users = databaseService.users
  }

  async createOrder(user_id: ObjectId, orderData: CreateOrderRequest) {
    // 1. Validate and get product details
    const productIds = orderData.items.map((item) => new ObjectId(item.product_id))
    const products = await this.products.find({ _id: { $in: productIds } }).toArray()

    if (products.length !== orderData.items.length) {
      throw new Error('One or more products not found')
    }

    // 2. Calculate order details
    let subtotal = 0
    const orderItems = orderData.items.map((item) => {
      const product = products.find((p) => p._id!.toString() === item.product_id)
      if (!product) {
        throw new Error(`Product with id ${item.product_id} not found`)
      }

      const totalPrice = product.price * item.quantity
      subtotal += totalPrice

      return {
        product_id: new ObjectId(item.product_id),
        product_name: product.name,
        product_image: product.image,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: totalPrice
      }
    })

    // 3. Calculate fees and totals
    const taxRate = 0.0 // 10% tax
    const taxAmount = subtotal * taxRate
    const shippingFee = subtotal > 100 ? 0 : 15 // Free shipping over $100
    const totalAmount = subtotal + taxAmount + shippingFee

    // 4. Create order
    const order = new Order({
      user_id,
      order_number: Order.generateOrderNumber(),
      items: orderItems,
      subtotal,
      tax_amount: taxAmount,
      shipping_fee: shippingFee,
      discount_amount: 0,
      total_amount: totalAmount,
      currency: orderData.currency || 'USD',
      status: OrderStatus.Pending,
      payment_info: {
        method: orderData.payment_method,
        status: PaymentStatus.Pending
      },
      shipping_address: orderData.shipping_address,
      notes: orderData.notes,
      created_at: new Date(),
      updated_at: new Date()
    })

    const result = await this.orders.insertOne(order)
    return await this.orders.findOne({ _id: result.insertedId })
  }

  async getOrderById(orderId: ObjectId, userId?: ObjectId) {
    const filter: any = { _id: orderId }
    if (userId) {
      filter.user_id = userId
    }

    return await this.orders.findOne(filter)
  }

  async getOrderByOrderNumber(orderNumber: string, userId?: ObjectId) {
    const filter: any = { order_number: orderNumber }
    if (userId) {
      filter.user_id = userId
    }

    return await this.orders.findOne(filter)
  }

  async getOrderByPayOSCode(payosOrderCode: number, userId?: ObjectId) {
    const filter: any = { 'payment_info.payos_order_code': payosOrderCode }
    if (userId) {
      filter.user_id = userId
    }

    return await this.orders.findOne(filter)
  }

  async updateOrderPaymentInfo(orderId: ObjectId, paymentInfo: any) {
    const updateData: any = {}

    if (paymentInfo.payos_order_code) {
      updateData['payment_info.payos_order_code'] = paymentInfo.payos_order_code
    }
    if (paymentInfo.payment_link_id) {
      updateData['payment_info.payment_link_id'] = paymentInfo.payment_link_id
    }
    if (paymentInfo.checkout_url) {
      updateData['payment_info.checkout_url'] = paymentInfo.checkout_url
    }
    if (paymentInfo.status) {
      updateData['payment_info.status'] = paymentInfo.status
    }
    if (paymentInfo.transaction_id) {
      updateData['payment_info.transaction_id'] = paymentInfo.transaction_id
    }
    if (paymentInfo.paid_at) {
      updateData['payment_info.paid_at'] = paymentInfo.paid_at
    }

    updateData.updated_at = new Date()

    return await this.orders.findOneAndUpdate({ _id: orderId }, { $set: updateData }, { returnDocument: 'after' })
  }

  async getUserOrders(userId: ObjectId, query: GetOrdersQuery = {}) {
    const { status, page = 1, limit = 10, sort = 'created_at', order = 'desc', from_date, to_date } = query

    const filter: any = { user_id: userId }

    if (status) {
      filter.status = status
    }

    if (from_date || to_date) {
      filter.created_at = {}
      if (from_date) {
        filter.created_at.$gte = new Date(from_date)
      }
      if (to_date) {
        filter.created_at.$lte = new Date(to_date)
      }
    }

    const sortOptions: any = {}
    sortOptions[sort] = order === 'asc' ? 1 : -1

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      this.orders.find(filter).sort(sortOptions).skip(skip).limit(limit).toArray(),
      this.orders.countDocuments(filter)
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async getAllOrders(query: GetOrdersQuery = {}) {
    const { status, page = 1, limit = 10, sort = 'created_at', order = 'desc', from_date, to_date } = query

    const filter: any = {}

    if (status) {
      filter.status = status
    }

    if (from_date || to_date) {
      filter.created_at = {}
      if (from_date) {
        filter.created_at.$gte = new Date(from_date)
      }
      if (to_date) {
        filter.created_at.$lte = new Date(to_date)
      }
    }

    const sortOptions: any = {}
    sortOptions[sort] = order === 'asc' ? 1 : -1

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      this.orders.find(filter).sort(sortOptions).skip(skip).limit(limit).toArray(),
      this.orders.countDocuments(filter)
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async updateOrderStatus(
    orderId: ObjectId,
    status: OrderStatus,
    trackingNumber?: string,
    estimatedDeliveryDate?: Date
  ) {
    const updateData: any = {
      status,
      updated_at: new Date()
    }

    if (trackingNumber) {
      updateData.tracking_number = trackingNumber
    }

    if (estimatedDeliveryDate) {
      updateData.estimated_delivery_date = estimatedDeliveryDate
    }

    const result = await this.orders.findOneAndUpdate(
      { _id: orderId },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result
  }

  async cancelOrder(orderId: ObjectId, userId: ObjectId, reason: string) {
    const order = await this.orders.findOne({ _id: orderId, user_id: userId })

    if (!order) {
      throw new Error('Order not found')
    }

    const orderInstance = new Order(order)
    if (!orderInstance.canBeCancelled()) {
      throw new Error('Order cannot be cancelled at this stage')
    }

    const result = await this.orders.findOneAndUpdate(
      { _id: orderId, user_id: userId },
      {
        $set: {
          status: OrderStatus.Cancelled,
          cancelled_at: new Date(),
          cancellation_reason: reason,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    return result
  }

  async getOrderStats(userId?: ObjectId) {
    const matchStage = userId ? { $match: { user_id: userId } } : { $match: {} }

    const result = await this.orders
      .aggregate([
        matchStage,
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            total_amount: { $sum: '$total_amount' }
          }
        }
      ])
      .toArray()

    const stats = {
      total_orders: 0,
      total_revenue: 0,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    }

    result.forEach((stat) => {
      stats.total_orders += stat.count
      stats.total_revenue += stat.total_amount
      stats[stat._id as keyof typeof stats] = stat.count
    })

    return stats
  }
}

const orderService = new OrderService()
export default orderService
