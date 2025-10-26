import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
import { NextFunction, request, Request, Response } from 'express'
import { capitalize } from 'lodash'

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        in: ['body'],
        isEmail: {
          errorMessage: USERS_MESSAGES.ERROR_INVALID_EMAIL
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        in: ['body'],
        isString: {
          errorMessage: USERS_MESSAGES.ERROR_PASSWORD_STRING
        },
        notEmpty: true
      }
    },
    ['body']
  )
)

export const emailVerifyToken = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRECT_EMAIL_TOKEN as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRECT_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: (error as JsonWebTokenError).message,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRECT_REFRESH_TOKEN as string }),
                databaseService.refreshToken.findOne({ token: value })
              ])
              if (refresh_token === null) {
                {
                  throw new ErrorWithStatus({
                    message: USERS_MESSAGES.REFRESH_TOKEN_NOT_EXIST,
                    status: HTTP_STATUS.UNAUTHORIZED
                  })
                }
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.REFRESH_TOKEN_INVALID,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      email: {
        in: ['body'],
        isEmail: {
          errorMessage: USERS_MESSAGES.ERROR_INVALID_EMAIL
        },
        notEmpty: true,
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await usersService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(USERS_MESSAGES.ERROR_EMAIL_EXISTS)
            }
            return true
          }
        }
      },
      password: {
        in: ['body'],
        isLength: {
          errorMessage: USERS_MESSAGES.ERROR_PASSWORD_LENGTH,
          options: { min: 8, max: 100 }
        },
        notEmpty: true,
        isString: true,
        isStrongPassword: {
          errorMessage: USERS_MESSAGES.ERROR_PASSWORD_STRONG
        }
      },
      confirm_password: {
        in: ['body'],
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGES.ERROR_PASSWORD_CONFIRMATION)
            }
            return true
          }
        }
      },
      fullname: {
        in: ['body'],

        isLength: {
          errorMessage: USERS_MESSAGES.ERROR_FULLNAME_LENGTH,
          options: { min: 3, max: 100 }
        },
        trim: true,
        notEmpty: true
      },
      date_of_birth: {
        in: ['body'],
        isISO8601: {
          errorMessage: USERS_MESSAGES.ERROR_DATE_OF_BIRTH
        }
      }
    },
    ['body']
  )
)

export const emailValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.ERROR_INVALID_EMAIL
        },
        trim: true,
        custom: {
          options: async (value) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_REQUIRED,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: {
        isLength: {
          errorMessage: USERS_MESSAGES.ERROR_PASSWORD_LENGTH,
          options: { min: 8, max: 100 }
        },
        notEmpty: true,
        isString: true,
        isStrongPassword: {
          errorMessage: USERS_MESSAGES.ERROR_PASSWORD_STRONG
        }
      },
      confirm_password: {
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGES.ERROR_PASSWORD_CONFIRMATION)
            }
            return true
          }
        }
      },
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })
              ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const roleValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRECT_ACCESS_TOKEN as string
              })
              if (decoded_authorization.role !== 'admin') {
                throw new ErrorWithStatus({
                  message: 'You do not have permission to perform this action',
                  status: HTTP_STATUS.FORBIDDEN
                })
              }
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              if (error instanceof ErrorWithStatus) {
                throw error
              }
              throw new ErrorWithStatus({
                message: (error as JsonWebTokenError).message,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)
