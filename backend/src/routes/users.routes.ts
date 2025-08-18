import { Router } from 'express'
import { emailVerifyController, forgotPasswordController, getMeController, loginController, logoutController, oauthController, refreshTokenController, registerController, resendEmailVerifyController, resetPasswordController } from '~/controllers/user.controllers'
import { accessTokenValidator, emailValidator, emailVerifyToken, loginValidator, refreshTokenValidator, registerValidator, resetPasswordValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const userRouter = Router()

userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
// Register users
// Path: /users/register
// Method: POST
// Request: { email: string, password: string ,confirm_password: string, fullname: string, date_of_birth: ISO8601 }

userRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
// Login users
// Path: /users/login
// Method: POST
// Request: { email: string, password: string }

userRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
// Get me users
// Path: /users/me
// Method: GET
// Header: { Authorization : Bearer <access_token> }
// Body: UserSchema

userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
// Logout users
// Path: /users/logout
// Method: POST
// Header: { Authorization : Bearer <access_token> }
// Body: { refresh_token: string }

userRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))
// Refresh Token
// Path: /users/refresh-token
// Method: POST
// Body: { refresh_token: string }

userRouter.post('/verify-email', emailVerifyToken, wrapRequestHandler(emailVerifyController))
// Verify email users
// Path: /users/verify-email
// Method: POST
// Body: { email_verify_token: string }

userRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))
// Resend verify email users
// Path: /users/verify-email
// Method: POST
// Header
// Body: {}

userRouter.get('/oauth/google', wrapRequestHandler(oauthController))
// Login with google
// Path: /users/oauth/google
// Method: POST
// Request: { email: string, password: string }

userRouter.post('/forgot-password', emailValidator, wrapRequestHandler(forgotPasswordController))
// Forgot password users
// Path: /users/forgot-password
// Method: POST
// Header: { Authorization : Bearer <access_token> }
// Body: { email: string }

userRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
// Reset password users
// Path: /users/reset-password
// Method: POST
// Body: { email: string, password: string, confirm_password: string , reset_password_token: string }

export default userRouter
