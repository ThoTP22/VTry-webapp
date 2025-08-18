import { Router } from 'express'
import {
  uploadImageController,
  uploadMultipleImagesController,
  deleteImageController,
  deleteImageByUrlController,
  getPresignedUrlController,
  getBucketPolicyController,
  checkUrlAccessibilityController
} from '~/controllers/image.controllers'
import {
  uploadSingleImage,
  uploadMultipleImages,
  handleUploadError,
  validateImageUpload
} from '~/middlewares/image.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const imageRouter = Router()

// Single image upload
imageRouter.post(
  '/upload',
  accessTokenValidator,
  uploadSingleImage,
  handleUploadError,
  validateImageUpload,
  wrapRequestHandler(uploadImageController)
)

// Multiple images upload
imageRouter.post(
  '/upload-multiple',
  accessTokenValidator,
  uploadMultipleImages,
  handleUploadError,
  validateImageUpload,
  wrapRequestHandler(uploadMultipleImagesController)
)

// Get presigned URL for an existing image
imageRouter.get('/presigned/:key(*)', accessTokenValidator, wrapRequestHandler(getPresignedUrlController))

// Get bucket policy for public access setup
imageRouter.get('/bucket-policy', accessTokenValidator, wrapRequestHandler(getBucketPolicyController))

// Check URL accessibility
imageRouter.post('/check-url', accessTokenValidator, wrapRequestHandler(checkUrlAccessibilityController))

// Delete image by key
imageRouter.delete('/delete/:key(*)', accessTokenValidator, wrapRequestHandler(deleteImageController))

// Delete image by URL (using request body)
imageRouter.delete('/delete-by-url', accessTokenValidator, wrapRequestHandler(deleteImageByUrlController))

export default imageRouter
