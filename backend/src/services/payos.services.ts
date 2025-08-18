import PayOS from '@payos/node'
import { ObjectId } from 'mongodb'
import { OrderType } from '~/models/schemas/Order.schema'

// PayOS configuration
const payOS = new PayOS(process.env.PAYOS_CLIENT_ID!, process.env.PAYOS_API_KEY!, process.env.PAYOS_CHECKSUM_KEY!)

export interface PaymentLink {
  bin: string
  accountNumber: string
  accountName: string
  amount: number
  description: string
  orderCode: number
  currency: string
  paymentLinkId: string
  status: string
  checkoutUrl: string
  qrCode: string
}

export interface CreatePaymentLinkData {
  orderCode: number
  amount: number
  description: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  returnUrl: string
  cancelUrl: string
  signature?: string
}

class PayOSService {
  private payOS: PayOS

  constructor() {
    this.payOS = payOS
    console.log('PayOS initialized with:', {
      client_id: process.env.PAYOS_CLIENT_ID ? 'SET' : 'NOT_SET',
      api_key: process.env.PAYOS_API_KEY ? 'SET' : 'NOT_SET',
      checksum_key: process.env.PAYOS_CHECKSUM_KEY ? 'SET' : 'NOT_SET'
    })
  }

  /**
   * Test PayOS connection
   */
  testConnection(): boolean {
    try {
      return !!(process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY)
    } catch (error) {
      console.error('PayOS connection test failed:', error)
      return false
    }
  }

  /**
   * Generate unique order code for PayOS (must be numeric and unique)
   */
  generateOrderCode(): number {
    return Math.floor(Date.now() / 1000) // Unix timestamp as order code
  }

  /**
   * Create a safe description that doesn't exceed PayOS 25 character limit
   */
  private createSafeDescription(orderNumber: string): string {
    const prefix = 'DH '
    const maxOrderNumberLength = 25 - prefix.length

    // Truncate order number if it's too long
    const truncatedOrderNumber =
      orderNumber.length > maxOrderNumberLength ? orderNumber.substring(0, maxOrderNumberLength) : orderNumber

    return `${prefix}${truncatedOrderNumber}`
  }

  /**
   * Create payment link for order
   */
  async createPaymentLink(order: OrderType): Promise<any> {
    try {
      // Validate environment variables
      if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
        throw new Error('PayOS credentials not configured properly')
      }

      // Validate order data
      if (!order) {
        throw new Error('Order is required')
      }

      if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
        throw new Error('Order must have items')
      }

      if (!order.total_amount || order.total_amount <= 0) {
        throw new Error('Order total amount must be greater than 0')
      }

      console.log('Creating payment link for order:', {
        order_number: order.order_number,
        items_count: order.items.length,
        total_amount: order.total_amount
      })

      const orderCode = this.generateOrderCode()

      const paymentData: CreatePaymentLinkData = {
        orderCode,
        amount: Math.round(order.total_amount), // PayOS requires integer amount
        description: this.createSafeDescription(order.order_number), // Safe description within 25 chars
        items: order.items.map((item) => ({
          name: item.product_name || 'Unknown Product',
          quantity: item.quantity || 1,
          price: Math.round(item.unit_price || 0)
        })),
        returnUrl: process.env.PAYOS_RETURN_URL || 'http://localhost:3000/payment/success',
        cancelUrl: process.env.PAYOS_CANCEL_URL || 'http://localhost:3000/payment/cancel'
      }

      console.log('PayOS payment data:', paymentData)

      const paymentLinkResponse = await this.payOS.createPaymentLink(paymentData)

      console.log('PayOS response:', paymentLinkResponse)

      return paymentLinkResponse
    } catch (error) {
      console.error('PayOS create payment link error:', error)
      throw new Error(`Failed to create payment link: ${error}`)
    }
  }

  /**
   * Get payment information by order code
   */
  async getPaymentInfo(orderCode: number): Promise<any> {
    try {
      const paymentInfo = await this.payOS.getPaymentLinkInformation(orderCode)
      return paymentInfo
    } catch (error) {
      console.error('PayOS get payment info error:', error)
      throw new Error(`Failed to get payment info: ${error}`)
    }
  }

  /**
   * Cancel payment link
   */
  async cancelPaymentLink(orderCode: number, cancellationReason?: string): Promise<any> {
    try {
      const reason = cancellationReason || 'Hủy thanh toán theo yêu cầu khách hàng'
      const result = await this.payOS.cancelPaymentLink(orderCode, reason)
      return result
    } catch (error) {
      console.error('PayOS cancel payment error:', error)
      throw new Error(`Failed to cancel payment: ${error}`)
    }
  }

  /**
   * Verify webhook signature
   */
  verifyPaymentWebhookData(webhookData: any): any {
    try {
      const verified = this.payOS.verifyPaymentWebhookData(webhookData)
      return verified
    } catch (error) {
      console.error('PayOS webhook verification error:', error)
      throw new Error(`Failed to verify webhook: ${error}`)
    }
  }

  /**
   * Confirm webhook (send back to PayOS)
   */
  async confirmWebhook(webhookUrl: string): Promise<string> {
    try {
      return await this.payOS.confirmWebhook(webhookUrl)
    } catch (error) {
      console.error('PayOS confirm webhook error:', error)
      throw new Error(`Failed to confirm webhook: ${error}`)
    }
  }

  /**
   * Check if payment method is supported
   */
  isSupportedPaymentMethod(method: string): boolean {
    const supportedMethods = ['VIETQR', 'ATM', 'VISA', 'MASTERCARD', 'JCB', 'AMEX']
    return supportedMethods.includes(method.toUpperCase())
  }

  /**
   * Format amount for display (PayOS amounts are in VND)
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  /**
   * Get payment status from PayOS response
   */
  mapPaymentStatus(payosStatus: string): string {
    const statusMap: { [key: string]: string } = {
      PENDING: 'pending',
      PROCESSING: 'processing',
      PAID: 'completed',
      CANCELLED: 'cancelled',
      EXPIRED: 'expired'
    }

    return statusMap[payosStatus] || 'pending'
  }
}

const payOSService = new PayOSService()
export default payOSService
