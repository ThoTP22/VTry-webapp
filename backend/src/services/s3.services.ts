import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { config } from 'dotenv'

config()

class S3Services {
  private s3Client: S3Client
  private bucketName: string

  constructor() {
    // Validate environment variables but don't throw immediately
    const requiredVars = {
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME
    }

    const missingVars = Object.entries(requiredVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      console.warn('⚠️  S3 Service Warning: Missing required environment variables:')
      missingVars.forEach((varName) => {
        console.warn(`   - ${varName}`)
      })
      console.warn('   S3 image upload functionality will not work until these are configured.')
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'NOT_CONFIGURED',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'NOT_CONFIGURED'
      }
    })
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'NOT_CONFIGURED'

    if (missingVars.length === 0) {
      console.log(
        `✅ S3 Service initialized with bucket: ${this.bucketName}, region: ${process.env.AWS_REGION || 'us-east-1'}`
      )
    }
  }

  async uploadImage(file: Buffer, key: string, contentType: string): Promise<string> {
    try {
      // Check if S3 is properly configured
      if (this.bucketName === 'NOT_CONFIGURED') {
        throw new Error('S3 is not configured. Please check your environment variables.')
      }

      console.log(`Uploading image with key: ${key}, contentType: ${contentType}, size: ${file.length} bytes`)

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        // Set public-read ACL to ensure public access
        ACL: 'public-read'
      })

      const result = await this.s3Client.send(command)
      console.log('S3 upload successful:', result)

      // Return direct public URL
      const directUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
      console.log(`Generated direct URL: ${directUrl}`)

      return directUrl
    } catch (error) {
      console.error('Detailed S3 upload error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        code: (error as any)?.Code || 'No code',
        statusCode: (error as any)?.$metadata?.httpStatusCode || 'No status code',
        requestId: (error as any)?.$metadata?.requestId || 'No request ID',
        bucket: this.bucketName,
        key: key,
        region: process.env.AWS_REGION || 'us-east-1'
      })

      // Handle ACL permission errors
      if (error instanceof Error) {
        if (error.name === 'NoSuchBucket') {
          throw new Error(`S3 bucket '${this.bucketName}' does not exist`)
        }
        if (error.name === 'InvalidAccessKeyId') {
          throw new Error('Invalid AWS Access Key ID')
        }
        if (error.name === 'SignatureDoesNotMatch') {
          throw new Error('Invalid AWS Secret Access Key')
        }
        if (error.name === 'AccessDenied' && error.message.includes('ACL')) {
          console.warn('ACL permission denied, trying without public-read ACL...')
          // Retry without ACL
          try {
            const retryCommand = new PutObjectCommand({
              Bucket: this.bucketName,
              Key: key,
              Body: file,
              ContentType: contentType
              // No ACL - rely on bucket policy
            })

            await this.s3Client.send(retryCommand)
            console.log('S3 upload successful without ACL')

            // Return direct URL for now, presigned URL will be created in controller if needed
            const directUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
            console.log(`Generated direct URL (no ACL): ${directUrl}`)
            return directUrl
          } catch (retryError) {
            throw new Error(
              `Failed to upload even without ACL: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`
            )
          }
        }
        if (error.name === 'AccessDenied') {
          throw new Error('Access denied. Check AWS permissions for S3 bucket')
        }
      }

      throw new Error(`Failed to upload image to S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })

      await this.s3Client.send(command)
    } catch (error) {
      console.error('Error deleting from S3:', error)
      throw new Error('Failed to delete image from S3')
    }
  }

  async getImageUrl(key: string): Promise<string> {
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
  }

  // Generate presigned URL for secure access
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn })
      return signedUrl
    } catch (error) {
      console.error('Error generating presigned URL:', error)
      throw new Error('Failed to generate presigned URL')
    }
  }

  // Generate unique key for uploaded files
  generateImageKey(originalName: string, folder: string = 'images'): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = originalName.split('.').pop()
    return `${folder}/${timestamp}-${randomString}.${fileExtension}`
  }

  // Extract key from S3 URL
  extractKeyFromUrl(url: string): string {
    const urlParts = url.split('/')
    return urlParts.slice(3).join('/') // Remove protocol, domain, and bucket name
  }

  // Helper method to create bucket policy for public read access
  getBucketPolicy(): string {
    return JSON.stringify(
      {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`]
          }
        ]
      },
      null,
      2
    )
  }

  // Method to check if URL is accessible
  async isUrlAccessible(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }
}

const s3Services = new S3Services()
export default s3Services
