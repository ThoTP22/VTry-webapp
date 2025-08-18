import swaggerJSDoc from 'swagger-jsdoc'
import { SwaggerUiOptions } from 'swagger-ui-express'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Visual Try-On API',
      version: '1.0.0',
      description: 'API documentation for Visual Try-On Web Application',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://your-production-url.com'
            : `http://localhost:${process.env.PORT || 4000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/models/schemas/*.ts', './src/models/requests/*.ts', './src/docs/*.ts']
}

export const specs = swaggerJSDoc(options)

export const swaggerUiOptions: SwaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .scheme-container { background: #fafafa; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 15px 0; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #3b4151; font-size: 28px; }
  `,
  customSiteTitle: 'Visual Try-On API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    showResponseHeaders: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Log requests for debugging
      console.log('Swagger Request:', req.method, req.url)
      return req
    },
    responseInterceptor: (res: any) => {
      // Log responses for debugging
      console.log('Swagger Response:', res.status, res.url)
      return res
    }
  },
  explorer: true
}
