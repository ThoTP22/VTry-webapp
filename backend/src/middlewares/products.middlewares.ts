import { validate } from '~/utils/validation'
import { checkSchema } from 'express-validator'

export const createProductValidator = validate(
  checkSchema({
    name: {
      in: ['body'],
      isString: {
        errorMessage: 'Name must be a string'
      },
      notEmpty: {
        errorMessage: 'Name cannot be empty'
      }
    },
    description: {
      in: ['body'],
      isString: {
        errorMessage: 'Description must be a string'
      },
      notEmpty: {
        errorMessage: 'Description cannot be empty'
      }
    },
    price: {
      in: ['body'],
      isFloat: {
        errorMessage: 'Price must be a number'
      },
      notEmpty: {
        errorMessage: 'Price cannot be empty'
      }
    },
    category: {
      in: ['body'],
      isString: {
        errorMessage: 'Category must be a string'
      },
      notEmpty: {
        errorMessage: 'Category cannot be empty'
      }
    }
  })
)
