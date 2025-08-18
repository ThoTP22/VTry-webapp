/**
 * @swagger
 * components:
 *   schemas:
 *     # Product Schemas
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7b1b3b3f3b3b3b3b3b3b3"
 *         name:
 *           type: string
 *           example: "Áo thun nam basic"
 *         description:
 *           type: string
 *           example: "Áo thun nam cơ bản, chất liệu cotton 100%"
 *         price:
 *           type: number
 *           example: 299000
 *         category:
 *           type: string
 *           example: "shirts"
 *         brand:
 *           type: string
 *           example: "Local Brand"
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["S", "M", "L", "XL"]
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           example: ["white", "black", "blue"]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         stock:
 *           type: number
 *           example: 100
 *         status:
 *           type: string
 *           enum: ["active", "inactive", "out_of_stock"]
 *           example: "active"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *           example: "Áo thun nam basic"
 *         description:
 *           type: string
 *           description: Product description
 *           example: "Áo thun nam cơ bản, chất liệu cotton 100%"
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Product price in VND
 *           example: 299000
 *         category:
 *           type: string
 *           description: Product category
 *           example: "shirts"
 *         brand:
 *           type: string
 *           description: Product brand
 *           example: "Local Brand"
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *           description: Available sizes
 *           example: ["S", "M", "L", "XL"]
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           description: Available colors
 *           example: ["white", "black", "blue"]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Product image URLs
 *           example: ["https://example.com/image1.jpg"]
 *         stock:
 *           type: number
 *           minimum: 0
 *           description: Available stock quantity
 *           example: 100
 *
 *     UpdateProductRequest:
 *       type: object
 *       required:
 *         - product_id
 *       properties:
 *         product_id:
 *           type: string
 *           description: Product ID to update
 *           example: "60f7b1b3b3f3b3b3b3b3b3b3"
 *         name:
 *           type: string
 *           example: "Áo thun nam basic - Updated"
 *         description:
 *           type: string
 *           example: "Updated description"
 *         price:
 *           type: number
 *           example: 350000
 *         category:
 *           type: string
 *           example: "shirts"
 *         brand:
 *           type: string
 *           example: "Premium Brand"
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["S", "M", "L", "XL", "XXL"]
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           example: ["white", "black", "blue", "red"]
 *         stock:
 *           type: number
 *           example: 150
 *         status:
 *           type: string
 *           enum: ["active", "inactive", "out_of_stock"]
 *           example: "active"
 *
 * # Products API Endpoints
 * /api/products/all:
 *   get:
 *     summary: Get all products
 *     description: Retrieve all products with optional filtering and pagination
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *         example: "shirts"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name
 *         example: "áo thun"
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get all products successful"
 *                 result:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 *
 * /api/products/create:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product (requires authentication)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *           example:
 *             name: "Áo thun nam basic"
 *             description: "Áo thun nam cơ bản, chất liệu cotton 100%"
 *             price: 299000
 *             category: "shirts"
 *             brand: "Local Brand"
 *             sizes: ["S", "M", "L", "XL"]
 *             colors: ["white", "black", "blue"]
 *             stock: 100
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Create product successful"
 *                 result:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a specific product by its ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "60f7b1b3b3f3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get product successful"
 *                 result:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 *
 *   delete:
 *     summary: Delete product
 *     description: Delete a product by ID (requires authentication)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to delete
 *         example: "60f7b1b3b3f3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Delete product successful"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 *
 * /api/products/update:
 *   post:
 *     summary: Update product
 *     description: Update an existing product (requires authentication)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *           example:
 *             product_id: "60f7b1b3b3f3b3b3b3b3b3b3"
 *             name: "Áo thun nam basic - Updated"
 *             price: 350000
 *             stock: 150
 *             status: "active"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Update product successful"
 *                 result:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */

export {}
