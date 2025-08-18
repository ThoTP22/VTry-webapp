import { OrderStatus, PaymentMethod } from '~/constants/enums'
import { OrderItem, ShippingAddress } from '../schemas/Order.schema'

export interface CreateOrderRequest {
  items: {
    product_id: string
    quantity: number
  }[]
  shipping_address: ShippingAddress
  payment_method: PaymentMethod
  notes?: string
  currency?: string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  tracking_number?: string
  estimated_delivery_date?: string
}

export interface CancelOrderRequest {
  cancellation_reason: string
}

export interface GetOrdersQuery {
  status?: OrderStatus
  page?: number
  limit?: number
  sort?: 'created_at' | 'updated_at' | 'total_amount'
  order?: 'asc' | 'desc'
  from_date?: string
  to_date?: string
}
