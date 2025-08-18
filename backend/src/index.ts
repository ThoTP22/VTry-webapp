import { config } from 'dotenv'
import databaseService from './services/database.services'
import express from 'express'
import cors from 'cors'
import userRouter from './routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import productRouter from './routes/products.routes'
import imageRouter from './routes/images.routes'
import orderRouter from './routes/orders.routes'
import paymentRouter from './routes/payments.routes'
import testRouter from './routes/test.routes'
import visualTryonRoute from './routes/visualTryon.routes'
import proxyRouter from './routes/proxy.routes'
import swaggerUi from 'swagger-ui-express'
import { specs, swaggerUiOptions } from './config/swagger'

config()

databaseService.connect()

const app = express()

const port = process.env.PORT || 4000

app.use(cors())

app.use(express.json())

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions))

// Export OpenAPI specification as JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(specs)
})

// API Routes
app.use('/api/users', userRouter)
app.use('/api/products', productRouter)
app.use('/api/images', imageRouter)
app.use('/api/orders', orderRouter)
app.use('/api/payments', paymentRouter)
app.use('/api/visual-tryon', visualTryonRoute)
app.use('/api/proxy', proxyRouter)
app.use('/api/test', testRouter)

// Root endpoint for API info
app.get('/', (req, res) => {
  res.json({
    message: '🎉 Visual Try-On API is running!',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    swagger_json: '/api-docs.json',
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      images: '/api/images',
      orders: '/api/orders',
      payments: '/api/payments',
      'visual-tryon': '/api/visual-tryon',
      testing: '/api/test'
    },
    testing_guide: {
      quick_start: [
        '1. Visit /api-docs for Swagger UI',
        '2. Try /api/test/health for basic test',
        '3. Register user via /api/users/register',
        '4. Login via /api/users/login to get token',
        '5. Use "Authorize" button in Swagger to set Bearer token'
      ]
    }
  })
})

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
