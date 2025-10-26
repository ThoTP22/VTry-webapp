import { NextFunction, Request, Response } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import { verifyToken } from '~/utils/jwt'

// Extend Request interface to include decoded_authorization
declare global {
      namespace Express {
            interface Request {
                  decoded_authorization?: TokenPayload
            }
      }
}

export const injectUserIdToRating = async (req: Request, res: Response, next: NextFunction) => {
      try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization
            if (!authHeader) {
                  throw new ErrorWithStatus({
                        message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
                        status: HTTP_STATUS.UNAUTHORIZED
                  })
            }

            const access_token = authHeader.split(' ')[1]
            if (!access_token) {
                  throw new ErrorWithStatus({
                        message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
                        status: HTTP_STATUS.UNAUTHORIZED
                  })
            }

            // Verify token and extract payload
            const decoded_authorization = await verifyToken({
                  token: access_token,
                  secretOrPublicKey: process.env.JWT_SECRECT_ACCESS_TOKEN as string
            })

            // Inject user_id into request body
            req.body.userId = decoded_authorization.user_id

            // Store decoded token in request for potential future use
            req.decoded_authorization = decoded_authorization

            next()
      } catch (error) {
            if (error instanceof ErrorWithStatus) {
                  return res.status(error.status).json({
                        message: error.message
                  })
            }

            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                  message: error instanceof JsonWebTokenError ? error.message : 'Invalid token'
            })
      }
}