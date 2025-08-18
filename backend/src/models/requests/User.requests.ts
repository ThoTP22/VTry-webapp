import { TokenType, UserVerificationStatus } from '~/constants/enums'
import { JwtPayload } from 'jsonwebtoken'

export interface RegisterReqBody {
  fullname: string
  password: string
  confirm_password: string
  email: string
  date_of_birth: string
  role?: 'admin' | 'member' | 'guest'
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerificationStatus
  role: 'admin' | 'member' | 'guest'
  exp: number
  iat: number
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface emailVerifyReqBody {
  email_verify_token: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}
