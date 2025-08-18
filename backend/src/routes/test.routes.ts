import { Router } from 'express'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import multer from 'multer'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import orderService from '~/services/orders.services'
import payOSService from '~/services/payos.services'
import { accessTokenValidator } from '~/middlewares/users.middlewares'

const testRouter = Router()

// Simple memory storage for test upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

/**
 * @swagger
 * /api/test/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Simple endpoint to test if the API is working
 *     tags:
 *       - Testing
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 server:
 *                   type: string
 *                   example: "Visual Try-On API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
testRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'Visual Try-On API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

/**
 * @swagger
 * /api/test/echo:
 *   post:
 *     summary: Echo endpoint
 *     description: Returns the request body back (useful for testing request format)
 *     tags:
 *       - Testing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               message: "Hello World"
 *               data: "Any data you want to echo"
 *     responses:
 *       200:
 *         description: Request echoed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: object
 *                   description: The original request body
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 method:
 *                   type: string
 *                   example: "POST"
 *             example:
 *               received:
 *                 message: "Hello World"
 *                 data: "Any data you want to echo"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *               method: "POST"
 */
testRouter.post('/echo', (req, res) => {
  res.json({
    received: req.body,
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    }
  })
})

/**
 * @swagger
 * /api/test/auth:
 *   get:
 *     summary: Test authentication
 *     description: Test endpoint that requires authentication
 *     tags:
 *       - Testing
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication successful"
 *                 user:
 *                   type: string
 *                   description: User ID from token
 *                   example: "60f7b1b3b3f3b3b3b3b3b3b3"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 */
testRouter.get('/auth', (req, res) => {
  // Simple auth check - in real app, use proper middleware
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Unauthorized - Bearer token required'
    })
  }

  res.json({
    message: 'Authentication successful',
    token_received: true,
    timestamp: new Date().toISOString(),
    note: 'This is a test endpoint - use real auth endpoints for production'
  })
})

/**
 * @swagger
 * /api/test/upload:
 *   post:
 *     summary: Test file upload
 *     description: Simple test endpoint for file upload functionality
 *     tags:
 *       - Testing
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Test file to upload
 *               message:
 *                 type: string
 *                 description: Optional message
 *                 example: "Test upload message"
 *     responses:
 *       200:
 *         description: File upload test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File upload test successful"
 *                 file_info:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     mimetype:
 *                       type: string
 *                     size:
 *                       type: number
 *                 additional_data:
 *                   type: object
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No file uploaded"
 */
testRouter.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file
  const body = req.body

  if (!file) {
    return res.status(400).json({
      message: 'No file uploaded',
      received_body: body
    })
  }

  res.json({
    message: 'File upload test successful',
    file_info: {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    },
    additional_data: body,
    timestamp: new Date().toISOString(),
    note: 'This is a test endpoint - file is not actually saved'
  })
})

/**
 * Test PayOS connection and order data
 * GET /api/test/payos/:order_id
 */
testRouter.get('/payos/:order_id', accessTokenValidator, async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params
    const { user_id } = req.decoded_authorization!

    // Test PayOS connection
    const payosConnected = payOSService.testConnection()

    // Get order data
    const order = await orderService.getOrderById(new ObjectId(order_id), new ObjectId(user_id))

    res.json({
      message: 'PayOS test results',
      result: {
        payos_connection: payosConnected,
        payos_env: {
          client_id: process.env.PAYOS_CLIENT_ID ? 'SET' : 'NOT_SET',
          api_key: process.env.PAYOS_API_KEY ? 'SET' : 'NOT_SET',
          checksum_key: process.env.PAYOS_CHECKSUM_KEY ? 'SET' : 'NOT_SET',
          return_url: process.env.PAYOS_RETURN_URL,
          cancel_url: process.env.PAYOS_CANCEL_URL
        },
        order_found: !!order,
        order_data: order
          ? {
              id: order._id,
              order_number: order.order_number,
              items_count: order.items?.length || 0,
              items: order.items || [],
              total_amount: order.total_amount,
              status: order.status,
              payment_info: order.payment_info
            }
          : null
      }
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Test failed',
      error: error.message
    })
  }
})

/**
 * @swagger
 * /api/test/visual-tryon-test:
 *   post:
 *     summary: Test Visual Try-On API
 *     description: Test endpoint for visual try-on functionality with sample data
 *     tags:
 *       - Testing
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Test model image file
 *               garment_image_url:
 *                 type: string
 *                 description: Test garment image URL
 *                 example: "https://example.com/sample-shirt.jpg"
 *     responses:
 *       200:
 *         description: Test completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 test_mode:
 *                   type: boolean
 *                 received_data:
 *                   type: object
 */
testRouter.post('/visual-tryon-test', upload.single('file'), (req, res) => {
  try {
    const file = req.file
    const { garment_image_url, mode = 'balanced', num_samples = 1 } = req.body

    // Basic validation
    const validation = {
      file_received: !!file,
      file_info: file
        ? {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            size_mb: (file.size / (1024 * 1024)).toFixed(2)
          }
        : null,
      garment_url_received: !!garment_image_url,
      garment_url_valid: garment_image_url
        ? (() => {
            try {
              new URL(garment_image_url)
              return true
            } catch {
              return false
            }
          })()
        : false,
      parameters: { mode, num_samples }
    }

    res.json({
      message: 'Visual Try-On test validation completed',
      test_mode: true,
      timestamp: new Date().toISOString(),
      validation,
      next_steps: [
        'If validation passes, you can try the real endpoint at /api/visual-tryon/tryon',
        'Make sure TRYON_API_KEY is set in environment variables',
        'Ensure AWS S3 credentials are configured',
        'Check that garment image URL is publicly accessible'
      ],
      ready_for_production: validation.file_received && validation.garment_url_valid
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Test failed',
      error: error.message
    })
  }
})

/**
 * @swagger
 * /api/test/fashn-status-test:
 *   post:
 *     summary: Test FASHN status API
 *     description: Test FASHN status endpoint với prediction ID để debug lỗi 404
 *     tags:
 *       - Testing
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prediction_id:
 *                 type: string
 *                 description: FASHN prediction ID để test
 *                 example: "123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1"
 *     responses:
 *       200:
 *         description: Test status results
 */
testRouter.post('/fashn-status-test', async (req, res) => {
  try {
    const { prediction_id } = req.body

    if (!prediction_id) {
      return res.status(400).json({
        message: 'Cần có prediction_id để test'
      })
    }

    if (!process.env.TRYON_API_KEY) {
      return res.status(400).json({
        message: 'TRYON_API_KEY không được cấu hình'
      })
    }

    const statusUrl = `https://api.fashn.ai/v1/status/${encodeURIComponent(prediction_id)}`

    console.log(`[Test] Testing FASHN status URL: ${statusUrl}`)

    const resp = await fetch(statusUrl, {
      headers: {
        Authorization: `Bearer ${process.env.TRYON_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const result: {
      url: string
      status: number
      statusText: string
      ok: boolean
      headers: { [k: string]: string }
      timestamp: string
      body?: any
      success?: boolean
      parseError?: string
      error?: any
    } = {
      url: statusUrl,
      status: resp.status,
      statusText: resp.statusText,
      ok: resp.ok,
      headers: Object.fromEntries(resp.headers.entries()),
      timestamp: new Date().toISOString()
    }

    if (resp.ok) {
      try {
        const jsonData = await resp.json()
        result.body = jsonData
        result.success = true
      } catch (parseError) {
        result.body = await resp.text()
        result.parseError = 'Failed to parse JSON response'
      }
    } else {
      try {
        result.error = await resp.json()
      } catch {
        result.error = await resp.text()
      }
    }

    res.json({
      message: 'FASHN status API test completed',
      prediction_id,
      result,
      diagnosis: {
        status_ok: resp.ok,
        likely_issue: !resp.ok
          ? resp.status === 404
            ? 'Prediction ID not found or invalid format'
            : resp.status === 401
              ? 'API key invalid or unauthorized'
              : resp.status === 429
                ? 'Rate limit exceeded'
                : `HTTP ${resp.status} error`
          : 'Success'
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Test failed với exception',
      error: (error as Error).message,
      stack: (error as Error).stack
    })
  }
})

/**
 * @swagger
 * /api/test/s3-permissions:
 *   post:
 *     summary: Test S3 bucket permissions
 *     description: Test S3 upload permissions để debug lỗi 403 Forbidden từ FASHN AI
 *     tags:
 *       - Testing
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Test image file to upload to S3
 *     responses:
 *       200:
 *         description: S3 permissions test results
 */
testRouter.post('/s3-permissions', upload.single('file'), async (req, res) => {
  const file = req.file

  if (!file) {
    return res.status(400).json({
      message: 'Cần có file để test S3 upload'
    })
  }

  // Check S3 config
  const s3Config = {
    bucket: process.env.AWS_S3_BUCKET_NAME,
    region: process.env.AWS_REGION || 'ap-southeast-1',
    accessKey: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
    secretKey: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET'
  }

  if (!s3Config.bucket) {
    return res.status(400).json({
      message: 'AWS_S3_BUCKET_NAME không được cấu hình',
      config: s3Config
    })
  }

  const s3 = new S3Client({ region: s3Config.region })
  const testKey = `test-permissions/${Date.now()}-${file.originalname}`

  try {
    // Test 1: Upload with public-read ACL
    const uploadResult: any = {}

    try {
      console.log('[Test] Attempting S3 upload with public-read ACL...')

      await s3.send(
        new PutObjectCommand({
          Bucket: s3Config.bucket,
          Key: testKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read'
        })
      )

      uploadResult.withACL = {
        success: true,
        method: 'public-read ACL'
      }
    } catch (aclError: any) {
      uploadResult.withACL = {
        success: false,
        error: aclError.message,
        code: aclError.Code || aclError.name
      }

      // Test 2: Upload without ACL (rely on bucket policy)
      try {
        console.log('[Test] ACL failed, trying without ACL...')

        await s3.send(
          new PutObjectCommand({
            Bucket: s3Config.bucket,
            Key: testKey,
            Body: file.buffer,
            ContentType: file.mimetype
          })
        )

        uploadResult.withoutACL = {
          success: true,
          method: 'bucket policy only'
        }
      } catch (noAclError: any) {
        uploadResult.withoutACL = {
          success: false,
          error: noAclError.message,
          code: noAclError.Code || noAclError.name
        }

        return res.status(500).json({
          message: 'Cả 2 phương thức upload đều fail',
          config: s3Config,
          uploadResult,
          recommendation: 'Kiểm tra AWS credentials và bucket permissions'
        })
      }
    }

    // Test 3: Check if uploaded file is publicly accessible
    const publicUrl = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${testKey}`

    try {
      const testResponse = await fetch(publicUrl, { method: 'HEAD' })

      const accessibilityTest = {
        url: publicUrl,
        accessible: testResponse.ok,
        status: testResponse.status,
        statusText: testResponse.statusText,
        headers: Object.fromEntries(testResponse.headers.entries())
      }

      res.json({
        message: 'S3 permissions test completed',
        file_info: {
          name: file.originalname,
          size: file.size,
          type: file.mimetype
        },
        s3_config: s3Config,
        upload_tests: uploadResult,
        accessibility_test: accessibilityTest,
        diagnosis: {
          can_upload: uploadResult.withACL?.success || uploadResult.withoutACL?.success,
          is_publicly_accessible: accessibilityTest.accessible,
          ready_for_fashn: accessibilityTest.accessible,
          recommendation: !accessibilityTest.accessible
            ? 'S3 bucket cần public read access để FASHN AI có thể truy cập. Thêm bucket policy hoặc enable public read ACL.'
            : 'S3 bucket permissions OK - FASHN AI có thể truy cập được images.'
        }
      })
    } catch (fetchError: any) {
      res.json({
        message: 'S3 upload OK nhưng không thể test accessibility',
        upload_tests: uploadResult,
        accessibility_error: fetchError.message,
        public_url: publicUrl,
        diagnosis: {
          can_upload: true,
          accessibility_unknown: true,
          recommendation: 'Manually check if URL is accessible: ' + publicUrl
        }
      })
    }
  } catch (error: any) {
    res.status(500).json({
      message: 'S3 test failed với exception',
      error: error.message,
      config: s3Config
    })
  }
})

export default testRouter
