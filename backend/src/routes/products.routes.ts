import { Router } from 'express'
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController
} from '~/controllers/product.controllers'
import { uploadImageController, uploadMultipleImagesController } from '~/controllers/image.controllers'
import { createProductValidator } from '~/middlewares/products.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import {
  uploadSingleImage,
  uploadMultipleImages,
  handleUploadError,
  validateImageUpload
} from '~/middlewares/image.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const productRouter = Router()

productRouter.get('/all', wrapRequestHandler(getAllProductsController))

productRouter.post('/create', accessTokenValidator, createProductValidator, wrapRequestHandler(createProductController))

productRouter.get('/:id', wrapRequestHandler(getProductByIdController))

productRouter.delete('/:id', accessTokenValidator, wrapRequestHandler(deleteProductController))

productRouter.post('/update', accessTokenValidator, wrapRequestHandler(updateProductController))

// Product image upload routes
productRouter.post(
  '/upload-image',
  accessTokenValidator,
  uploadSingleImage,
  handleUploadError,
  validateImageUpload,
  wrapRequestHandler(uploadImageController)
)

productRouter.post(
  '/upload-images',
  accessTokenValidator,
  uploadMultipleImages,
  handleUploadError,
  validateImageUpload,
  wrapRequestHandler(uploadMultipleImagesController)
)

export default productRouter
