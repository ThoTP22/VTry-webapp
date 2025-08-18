import { Request, Response } from 'express';
import { CreateRatingReqBody } from "~/models/requests/Rating.requests";
import * as ratingsService from "~/services/rating.services";

export const createRating = async (req: Request, res: Response) => {
      const ratingData: CreateRatingReqBody = req.body;
      try {
            const result = await ratingsService.createRating(ratingData);
            return res.status(201).json({
                  message: 'Rating created successfully',
                  createRating: result
            });
      } catch (error) {
            console.error('Error creating rating:', error);
            return res.status(500).json({
                  message: 'Failed to create rating',
                  error: error instanceof Error ? error.message : 'Unknown error'
            });
      }
}


export const getAllRatings = async (req: Request, res: Response) => {
      try {
            const ratings = await ratingsService.getAllRatings();
            return res.status(200).json({
                  message: 'Ratings fetched successfully',
                  ratings: ratings
            });
      } catch (error) {
            console.error('Error fetching ratings:', error);
            return res.status(500).json({
                  message: 'Failed to fetch ratings',
                  error: error instanceof Error ? error.message : 'Unknown error'
            });
      }
}


export const deleteRatingById = async (req: Request, res: Response) => {
      const ratingId = req.params.id;
      try {
            const result = await ratingsService.deleteRatingById(ratingId);
            if (result) {
                  return res.status(200).json({
                        message: 'Rating deleted successfully',
                        result: result
                  });
            } else {
                  return res.status(404).json({
                        message: 'Rating not found'
                  });
            }
      } catch (error) { 
            console.error('Error deleting rating:', error);
            return res.status(500).json({
                  message: 'Failed to delete rating',
                  error: error instanceof Error ? error.message : 'Unknown error'
            });
      }
}