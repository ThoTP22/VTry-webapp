import { NextFunction, Request, Response } from 'express'
import { DeleteImageByUrlReqBody } from '~/models/requests/Images.requests'
import s3Services from '~/services/s3.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded'
      })
    }

    const file = req.file
    const key = s3Services.generateImageKey(file.originalname)

    const imageUrl = await s3Services.uploadImage(file.buffer, key, file.mimetype)

    // Return the uploaded image info without immediately checking accessibility
    // This avoids the presigned URL generation error during upload
    return res.json({
      message: 'Image uploaded successfully',
      result: {
        url: imageUrl,
        key: key,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        note: 'If URL is not accessible due to bucket permissions, use the /presigned endpoint to get a signed URL'
      }
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return res.status(500).json({
      message: 'Failed to upload image',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const uploadMultipleImagesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        message: 'No files uploaded'
      })
    }

    const files = req.files as Express.Multer.File[]
    const uploadPromises = files.map(async (file) => {
      const key = s3Services.generateImageKey(file.originalname)
      const imageUrl = await s3Services.uploadImage(file.buffer, key, file.mimetype)

      return {
        url: imageUrl,
        key: key,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      }
    })

    const uploadedImages = await Promise.all(uploadPromises)

    return res.json({
      message: 'Images uploaded successfully',
      result: uploadedImages,
      note: 'If any URLs are not accessible due to bucket permissions, use the /presigned endpoint with the image key to get signed URLs'
    })
  } catch (error) {
    console.error('Error uploading images:', error)
    return res.status(500).json({
      message: 'Failed to upload images',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const deleteImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params

    if (!key) {
      return res.status(400).json({
        message: 'Image key is required'
      })
    }

    // Decode the key in case it's URL encoded
    const decodedKey = decodeURIComponent(key)

    await s3Services.deleteImage(decodedKey)

    return res.json({
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting image:', error)
    return res.status(500).json({
      message: 'Failed to delete image',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const deleteImageByUrlController = async (
  req: Request<any, any, DeleteImageByUrlReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({
        message: 'Image URL is required'
      })
    }

    const key = s3Services.extractKeyFromUrl(url)
    await s3Services.deleteImage(key)

    return res.json({
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting image:', error)
    return res.status(500).json({
      message: 'Failed to delete image',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getPresignedUrlController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params
    const expiresIn = parseInt(req.query.expiresIn as string, 10) || 3600 // Default 1 hour

    if (!key) {
      return res.status(400).json({
        message: 'Image key is required'
      })
    }

    // Decode the key in case it's URL encoded
    const decodedKey = decodeURIComponent(key)

    const presignedUrl = await s3Services.getPresignedUrl(decodedKey, expiresIn)

    return res.json({
      message: 'Presigned URL generated successfully',
      result: {
        url: presignedUrl,
        key: decodedKey,
        expiresIn: expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      }
    })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return res.status(500).json({
      message: 'Failed to generate presigned URL',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getBucketPolicyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bucketPolicy = s3Services.getBucketPolicy()

    return res.json({
      message: 'Suggested bucket policy for public read access',
      result: {
        policy: bucketPolicy,
        instructions: [
          '1. Go to your S3 bucket in AWS Console',
          '2. Click on "Permissions" tab',
          '3. Scroll down to "Bucket policy"',
          '4. Click "Edit" and paste the policy below',
          '5. Save changes',
          '6. Also ensure "Block all public access" is turned OFF in the bucket settings'
        ]
      }
    })
  } catch (error) {
    console.error('Error generating bucket policy:', error)
    return res.status(500).json({
      message: 'Failed to generate bucket policy',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const checkUrlAccessibilityController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({
        message: 'URL is required'
      })
    }

    const isAccessible = await s3Services.isUrlAccessible(url)
    const key = s3Services.extractKeyFromUrl(url)

    return res.json({
      message: 'URL accessibility checked',
      result: {
        url: url,
        key: key,
        isAccessible: isAccessible,
        ...(isAccessible
          ? { status: 'URL is publicly accessible' }
          : {
              status: 'URL is not publicly accessible',
              suggestion: `Use GET /api/images/presigned/${encodeURIComponent(key)} to get a signed URL`
            })
      }
    })
  } catch (error) {
    console.error('Error checking URL accessibility:', error)
    return res.status(500).json({
      message: 'Failed to check URL accessibility',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
