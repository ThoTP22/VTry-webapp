import { ObjectId } from 'mongodb'
import { OrderStatus, PaymentStatus, PaymentMethod } from '~/constants/enums'

export interface OrderItem {
  product_id: ObjectId
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface ShippingAddress {
  fullname: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface PaymentInfo {
  method: PaymentMethod
  status: PaymentStatus
  transaction_id?: string
  paid_at?: Date
  payos_order_code?: number
  payment_link_id?: string
  checkout_url?: string
}

export type OrderType = {
  _id?: ObjectId
  user_id: ObjectId
  order_number: string
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  shipping_fee: number
  discount_amount: number
  total_amount: number
  currency: string
  status: OrderStatus
  payment_info: PaymentInfo
  shipping_address: ShippingAddress
  notes?: string
  estimated_delivery_date?: Date
  tracking_number?: string
  created_at: Date
  updated_at: Date
  cancelled_at?: Date
  cancellation_reason?: string
}

export default class Order {
  _id?: ObjectId
  user_id: ObjectId
  order_number: string
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  shipping_fee: number
  discount_amount: number
  total_amount: number
  currency: string
  status: OrderStatus
  payment_info: PaymentInfo
  shipping_address: ShippingAddress
  notes?: string
  estimated_delivery_date?: Date
  tracking_number?: string
  created_at: Date
  updated_at: Date
  cancelled_at?: Date
  cancellation_reason?: string

  constructor(order: OrderType) {
    const date = new Date()
    this._id = order._id || new ObjectId()
    this.user_id = order.user_id
    this.order_number = order.order_number
    this.items = order.items || []
    this.subtotal = order.subtotal || 0
    this.tax_amount = order.tax_amount || 0
    this.shipping_fee = order.shipping_fee || 0
    this.discount_amount = order.discount_amount || 0
    this.total_amount = order.total_amount || 0
    this.currency = order.currency || 'USD'
    this.status = order.status || OrderStatus.Pending
    this.payment_info = order.payment_info
    this.shipping_address = order.shipping_address
    this.notes = order.notes
    this.estimated_delivery_date = order.estimated_delivery_date
    this.tracking_number = order.tracking_number
    this.created_at = order.created_at || date
    this.updated_at = order.updated_at || date
    this.cancelled_at = order.cancelled_at
    this.cancellation_reason = order.cancellation_reason
  }

  // Generate unique order number
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORD-${timestamp.slice(-8)}-${random}`
  }

  // Calculate total amount
  calculateTotalAmount(): number {
    return this.subtotal + this.tax_amount + this.shipping_fee - this.discount_amount
  }

  // Check if order can be cancelled
  canBeCancelled(): boolean {
    return [OrderStatus.Pending, OrderStatus.Confirmed].includes(this.status)
  }
}
