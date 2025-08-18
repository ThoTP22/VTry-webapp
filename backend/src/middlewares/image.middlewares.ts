import multer from 'multer'
import { Request, Response, NextFunction } from 'express'

// Configure multer to store files in memory
const storage = multer.memoryStorage()

// File filter to accept only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'))
  }
}

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
})

// Middleware for single image upload
export const uploadSingleImage = upload.single('image')

// Middleware for multiple image uploads
export const uploadMultipleImages = upload.array('images', 10) // Maximum 10 images

// Error handling middleware for multer errors
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size too large. Maximum size is 5MB'
      })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum is 10 files'
      })
    }
    return res.status(400).json({
      message: error.message
    })
  }

  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      message: 'Only image files are allowed'
    })
  }

  next(error)
}

// Validation middleware for image upload
export const validateImageUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      message: 'No image file provided'
    })
  }
  next()
}
