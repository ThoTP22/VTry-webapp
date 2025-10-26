import multer from 'multer'
import { Request, Response, NextFunction } from 'express'

// Configure multer to store files in memory for Visual Try-on
const storage = multer.memoryStorage()

// File filter to accept only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed for try-on!'))
  }
}

// Multer configuration for visual tryon
const uploadTryonImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for better quality model images
  }
})

// Middleware for single model image upload (field name: 'file')
export const uploadModelImage = uploadTryonImage.single('file')

// Validation middleware for try-on request
export const validateTryonRequest = (req: Request, res: Response, next: NextFunction) => {
  const { garment_image_url } = req.body

  // Must have either uploaded file or model_image_url in body
  if (!req.file && !req.body.model_image_url) {
    return res.status(400).json({
      message: 'Cần có file upload (model image) hoặc model_image_url'
    })
  }

  // Must have garment image URL
  if (!garment_image_url) {
    return res.status(400).json({
      message: 'Cần có garment_image_url'
    })
  }

  // Validate garment image URL format
  try {
    new URL(garment_image_url)
  } catch {
    return res.status(400).json({
      message: 'garment_image_url không hợp lệ'
    })
  }

  next()
}

// Error handling middleware for multer errors
export const handleTryonUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File ảnh quá lớn. Kích thước tối đa là 10MB'
      })
    }
    return res.status(400).json({
      message: error.message
    })
  }

  if (error.message === 'Only image files are allowed for try-on!') {
    return res.status(400).json({
      message: 'Chỉ chấp nhận file ảnh'
    })
  }

  next(error)
}
