import { TokenPayload } from './models/requests/User.requests'
import User from './models/schemas/User.schema'
import Order from './models/schemas/Order.schema'

declare module 'express' {
  interface Request {
    user?: User
    order?: Order
    webhookSignature?: string
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}
