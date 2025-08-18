import { Router } from 'express'
import { createRating, getAllRatings, deleteRatingById } from '~/controllers/rating.controllers'
import { injectUserIdToRating } from '~/middlewares/rating.middlewares'

const ratingRoutes = Router()

/**
 * @swagger
 * /ratings/create:
 *   post:
 *     tags:
 *       - Ratings
 *     summary: Create a new rating
 *     description: Create a new rating
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/RatingResponseData'
 */
ratingRoutes.post('/create', injectUserIdToRating, createRating)

/**
 * @swagger
 * /ratings/all:
 *   get:
 *     tags:
 *       - Ratings
 *     summary: Get all ratings
 *     description: Get all ratings
 *     responses:
 *       200:
 *         description: All ratings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RatingResponseData'
 */
ratingRoutes.get('/all', getAllRatings)

/**
 * @swagger
 * /ratings/delete/{id}:
 *   delete:
 *     tags:
 *       - Ratings
 *     summary: Delete a rating by ID
 *     description: Delete a rating by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rating to delete
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
ratingRoutes.delete('/delete/:id', deleteRatingById)

export default ratingRoutes
