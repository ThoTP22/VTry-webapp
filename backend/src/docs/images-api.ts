/**
 * @swagger
 * components:
 *   schemas:
 *     # Image Schemas
 *     ImageUploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Image uploaded successfully"
 *         result:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: Uploaded image URL
 *               example: "https://visual-tryon-storage.s3.ap-southeast-1.amazonaws.com/images/image-1642234567890.jpg"
 *             key:
 *               type: string
 *               description: S3 key for the uploaded image
 *               example: "images/image-1642234567890.jpg"
 *             size:
 *               type: number
 *               description: Image size in bytes
 *               example: 1048576
 *             contentType:
 *               type: string
 *               description: Image MIME type
 *               example: "image/jpeg"
 *
 *     MultipleImagesUploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Multiple images uploaded successfully"
 *         result:
 *           type: object
 *           properties:
 *             images:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *                     example: "https://visual-tryon-storage.s3.ap-southeast-1.amazonaws.com/images/image-1.jpg"
 *                   key:
 *                     type: string
 *                     example: "images/image-1.jpg"
 *                   size:
 *                     type: number
 *                     example: 1048576
 *                   contentType:
 *                     type: string
 *                     example: "image/jpeg"
 *             total:
 *               type: number
 *               example: 3
 *
 *     DeleteImageRequest:
 *       type: object
 *       required:
 *         - image_key
 *       properties:
 *         image_key:
 *           type: string
 *           description: S3 key of the image to delete
 *           example: "images/image-1642234567890.jpg"
 *
 *     DeleteImageByUrlRequest:
 *       type: object
 *       required:
 *         - image_url
 *       properties:
 *         image_url:
 *           type: string
 *           description: Full URL of the image to delete
 *           example: "https://visual-tryon-storage.s3.ap-southeast-1.amazonaws.com/images/image-1642234567890.jpg"
 *
 * # Images API Endpoints
 * /api/images/upload:
 *   post:
 *     summary: Upload single image
 *     description: Upload a single image file to S3 storage (requires authentication)
 *     tags:
 *       - Images
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG, PNG, GIF, WebP)
 *           encoding:
 *             image:
 *               contentType: image/*
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageUploadResponse'
 *       400:
 *         description: Bad request (invalid file type, file too large, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       413:
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File too large. Maximum size is 5MB"
 *
 * /api/images/upload-multiple:
 *   post:
 *     summary: Upload multiple images
 *     description: Upload multiple image files to S3 storage (requires authentication)
 *     tags:
 *       - Images
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple image files to upload (max 10 files)
 *                 maxItems: 10
 *           encoding:
 *             images:
 *               contentType: image/*
 *     responses:
 *       200:
 *         description: Multiple images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleImagesUploadResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Too many files. Maximum 10 files allowed"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *
 * /api/images/delete:
 *   delete:
 *     summary: Delete image by key
 *     description: Delete an image from S3 storage using its key (requires authentication)
 *     tags:
 *       - Images
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteImageRequest'
 *           example:
 *             image_key: "images/image-1642234567890.jpg"
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image deleted successfully"
 *       400:
 *         description: Bad request (invalid key)
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
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image not found"
 *
 * /api/images/delete-by-url:
 *   delete:
 *     summary: Delete image by URL
 *     description: Delete an image from S3 storage using its full URL (requires authentication)
 *     tags:
 *       - Images
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteImageByUrlRequest'
 *           example:
 *             image_url: "https://visual-tryon-storage.s3.ap-southeast-1.amazonaws.com/images/image-1642234567890.jpg"
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image deleted successfully"
 *       400:
 *         description: Bad request (invalid URL)
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
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image not found"
 */

export {}
