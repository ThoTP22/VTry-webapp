import { Router } from 'express'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { tryonOneStopController } from '~/controllers/visualtryon.controllers'
import { uploadModelImage, validateTryonRequest, handleTryonUploadError } from '~/middlewares/visualtryon.middlewares'

const visualTryonRoute = Router()

// Main try-on endpoint - handles file upload and processing in one step
visualTryonRoute.post(
  '/tryon',
  uploadModelImage,
  validateTryonRequest,
  handleTryonUploadError,
  wrapRequestHandler(tryonOneStopController)
)

// Legacy endpoint for backward compatibility - redirect to new endpoint
visualTryonRoute.post(
  '/analysis',
  uploadModelImage,
  validateTryonRequest,
  handleTryonUploadError,
  wrapRequestHandler(tryonOneStopController)
)

export default visualTryonRoute
