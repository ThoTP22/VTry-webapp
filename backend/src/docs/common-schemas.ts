/**
 * @swagger
 * components:
 *   schemas:
 *     # Common Response Schemas
 *     ApiResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *         result:
 *           type: object
 *           description: Response data
 *       example:
 *         message: "Success"
 *         result: {}
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         errors:
 *           type: object
 *           description: Validation errors details
 *       example:
 *         message: "Validation failed"
 *         errors:
 *           field: "Field is required"
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *               param:
 *                 type: string
 *               location:
 *                 type: string
 *       example:
 *         message: "Validation failed"
 *         errors:
 *           - msg: "Email is required"
 *             param: "email"
 *             location: "body"
 *
 *     # Pagination Schema
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *         total:
 *           type: integer
 *           description: Total number of items
 *         total_pages:
 *           type: integer
 *           description: Total number of pages
 *       example:
 *         page: 1
 *         limit: 10
 *         total: 50
 *         total_pages: 5
 *
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         result:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *             meta:
 *               $ref: '#/components/schemas/PaginationMeta'
 *
 *     # HTTP Status Response Templates
 *     UnauthorizedResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Unauthorized"
 *
 *     ForbiddenResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Forbidden"
 *
 *     NotFoundResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Resource not found"
 *
 *     ServerErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Internal server error"
 *
 *   # Security Schemes
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: "Enter JWT token in the format: Bearer <token>"
 *
 *   # Common Parameters
 *   parameters:
 *     PageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Page number for pagination
 *
 *     LimitParam:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       description: Number of items per page
 *
 *     SortParam:
 *       in: query
 *       name: sort
 *       schema:
 *         type: string
 *         enum: [asc, desc]
 *         default: desc
 *       description: Sort order
 *
 *     SearchParam:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search query string
 *
 *   # Common Response Templates
 *   responses:
 *     UnauthorizedError:
 *       description: Unauthorized - Invalid or missing token
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnauthorizedResponse'
 *
 *     ForbiddenError:
 *       description: Forbidden - Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForbiddenResponse'
 *
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotFoundResponse'
 *
 *     ValidationError:
 *       description: Validation error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidationErrorResponse'
 *
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServerErrorResponse'
 */

// This file is used to define common Swagger schemas and components
// It will be automatically scanned by swagger-jsdoc
export {}
