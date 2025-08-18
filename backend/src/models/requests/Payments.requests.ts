export interface CreatePaymentRequest {
  order_id: string
  payment_method: 'payos'
  return_url?: string
  cancel_url?: string
}

export interface PaymentWebhookData {
  code: string
  desc: string
  data: {
    orderCode: number
    amount: number
    description: string
    accountNumber: string
    reference: string
    transactionDateTime: string
    currency: string
    paymentLinkId: string
    code: string
    desc: string
    counterAccountBankId?: string
    counterAccountBankName?: string
    counterAccountName?: string
    counterAccountNumber?: string
    virtualAccountName?: string
    virtualAccountNumber?: string
  }
  signature: string
}

export interface PaymentStatusQuery {
  order_code?: string
  payment_link_id?: string
}

export interface CancelPaymentRequest {
  cancellation_reason?: string
}
