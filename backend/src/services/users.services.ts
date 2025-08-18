import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerificationStatus } from '~/constants/enums'
import { RegisterReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import { signToken, verifyToken } from '~/utils/jwt'
import databaseService from './database.services'
import { hashPassword } from '~/utils/crypto'
import lodash, { omit } from 'lodash'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { USERS_MESSAGES } from '~/constants/messages'
import { sendVerifyEmail } from '~/utils/ses_config'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import axios from 'axios'

config()

class UserService {
  private signAccessToken({
    user_id,
    verify,
    role
  }: {
    user_id: string
    verify: UserVerificationStatus
    role: 'admin' | 'member' | 'guest'
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify,
        role
      },
      privateKey: process.env.JWT_SECRECT_ACCESS_TOKEN as string,
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
      }
    })
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return user !== null
  }
  private signRefreshToken({
    user_id,
    verify,
    role,
    exp
  }: {
    user_id: string
    verify: UserVerificationStatus
    role: 'admin' | 'member' | 'guest'
    exp?: number
  }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          verify,
          role,
          exp
        },
        privateKey: process.env.JWT_SECRECT_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify,
        role
      },
      privateKey: process.env.JWT_SECRECT_REFRESH_TOKEN as string,
      options: {
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN)
      }
    })
  }
  private signAccessAndRefreshToken({
    user_id,
    verify,
    role
  }: {
    user_id: string
    verify: UserVerificationStatus
    role: 'admin' | 'member' | 'guest'
  }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify, role }),
      this.signRefreshToken({ user_id, verify, role })
    ])
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerificationStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRECT_EMAIL_TOKEN as string,
      options: {
        expiresIn: Number(process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN || 3600)
      }
    })
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRECT_REFRESH_TOKEN as string
    })
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const emailVerifyToken = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerificationStatus.Unverified
    })

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token: emailVerifyToken,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        role: 'guest',
        phone: '',
        created_at: new Date(),
        updated_at: new Date(),
        forgot_password_token: '',
        verify: UserVerificationStatus.Unverified,
        bio: '',
        location: '',
        website: '',
        username: '',
        avatar: '',
        cover_photo: ''
      })
    )

    console.log('New user created with role:', 'guest')
    const loginUser = await databaseService.users.findOne({ _id: user_id })
    console.log('Retrieved user:', loginUser)

    // try {
    //   await sendVerifyEmail(
    //     payload.email,
    //     '[Verify Email] Urban Food Hub',
    //     `<h1>Verify your email</h1><p>Please click the link below to verify your email:</p><a href="${process.env.URL_VERIFY_EMAIL}?email_verify_token=${emailVerifyToken}">Verify Email</a>`
    //   )
    // } catch (error) {
    //   console.error('Failed to send verification email:', error)
    //   console.log('email_verify_token: ', emailVerifyToken)
    // }
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerificationStatus.Unverified,
      role: 'guest'
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    return {
      access_token,
      refresh_token,
      user: lodash.omit(loginUser, ['password', 'email_verify_token', 'forgot_password_token'])
    }
  }

  async login({
    user_id,
    verify,
    role
  }: {
    user_id: string
    verify: UserVerificationStatus
    role: 'admin' | 'member' | 'guest'
  }) {
    // await databaseService.refreshToken.deleteOne({ user_id: new ObjectId(user_id) })
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify,
      role
    })
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    return {
      access_token,
      refresh_token,
      user: omit(user, ['password', 'email_verify_token', 'forgot_password_token'])
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshToken.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp,
    role
  }: {
    user_id: string
    verify: UserVerificationStatus
    refresh_token: string
    exp: number
    role: 'admin' | 'member' | 'guest'
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify, role }),
      this.signRefreshToken({ user_id, verify, exp, role }),
      databaseService.refreshToken.deleteOne({ token: refresh_token })
    ])
    const { iat } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: new_refresh_token, iat, exp })
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }

  async verifyEmailToken(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerificationStatus.Verified, role: 'guest' }),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerificationStatus.Verified
            // updated_at: new Date()
          },
          $currentDate: { updated_at: true }
        }
      )
    ])
    const [access_token, refresh_token] = token
    await databaseService.refreshToken.deleteMany({ user_id: new ObjectId(user_id) })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    return {
      access_token,
      refresh_token,
      user: omit(user, ['password', 'email_verify_token', 'forgot_password_token'])
    }
  }

  async resendEmailVerify(user_id: string) {
    const emailVerifyToken = await this.signEmailVerifyToken({ user_id, verify: UserVerificationStatus.Unverified })
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    try {
      if (user?.email) {
        await sendVerifyEmail(
          user.email,
          '[Verify Email] Urban Food Hub',
          `<h1>Verify your email</h1><p>Please click the link below to verify your email:</p><a href="${process.env.URL_VERIFY_EMAIL}?email_verify_token=${emailVerifyToken}">Verify Email</a>`
        )
      }
    } catch (error) {
      console.error('Failed to send verification email:', error)
      // Bạn có thể thêm logic để xử lý lỗi ở đây, như ghi log, thông báo lỗi cho người dùng, v.v.
      console.log('resend_email_verify_token: ', emailVerifyToken)
    }
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token: emailVerifyToken
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS
    }
  }

  private async getOauthGooleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: { access_token, alt: 'json' },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGooleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GOOGLE_EMAIL_NOT_VERIFY,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const user = await databaseService.users.findOne({ email: userInfo.email })
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify,
        role: user.role
      })
      const { iat, exp } = await this.decodeRefreshToken(refresh_token)
      await databaseService.refreshToken.insertOne(
        new RefreshToken({ user_id: new ObjectId(user._id), token: refresh_token, iat, exp })
      )
      return {
        access_token,
        refresh_token,
        newUser: false,
        user: omit(user, ['password', 'email_verify_token', 'forgot_password_token'])
      }
    } else {
      const password = Math.random().toString(36).substring(2, 15)
      const data = await this.register({
        email: userInfo.email,
        fullname: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password: password,
        confirm_password: password
      })
      await databaseService.users.updateOne({ email: userInfo.email }, { $set: { avatar: userInfo.picture } })
      return { ...data, newUser: true }
    }
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerificationStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: Number(process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN)
      }
    })
  }

  async resetPassword({
    user_id,
    password,
    verify
  }: {
    user_id: string
    password: string
    verify: UserVerificationStatus
  }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify, role: 'guest' })

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: { updated_at: true }
      }
    )
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS,
      access_token,
      refresh_token
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerificationStatus }) {
    const forgotPasswordToken = await this.signForgotPasswordToken({ user_id, verify })
    console.log('forgot_password_token: ', forgotPasswordToken)
    await databaseService.refreshToken.deleteMany({ user_id: new ObjectId(user_id) })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: forgotPasswordToken
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGES.FORGOT_PASSWORD_SUCCESS
    }
  }
}

const usersService = new UserService()

export default usersService
