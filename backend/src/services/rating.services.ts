import { ObjectId } from "mongodb"
import { CreateRatingReqBody } from "~/models/requests/Rating.requests"
import Rating from "~/models/schemas/Rating.schema"
import { UserType } from "~/models/schemas/User.schema"
import databaseService from "~/services/database.services"

export type RatingResponseData = {
      _id: ObjectId
      rating: number
      comment?: string
      created_at?: Date
      updated_at?: Date
      user: UserType
}

export const getAllRatings = async (): Promise<RatingResponseData[]> => {
      const ratingCollection = databaseService.ratings
      try {
            const ratings = await ratingCollection.find({}).toArray()
            
            // Convert each rating to RatingResponseData format
            const ratingResponseArray: RatingResponseData[] = []
            for (const rating of ratings) {
                  const user = await databaseService.users.findOne({ _id: rating.userId })
                  if (user) {
                        const ratingResponse = await toRatingResponseData(rating as Rating, user as UserType)
                        ratingResponseArray.push(ratingResponse)
                  }
            }
            
            return ratingResponseArray
      } 
      catch (error) {
            console.error('Error fetching ratings:', error)
            throw error instanceof Error ? error : new Error('Unknown error')
      }
}

export const createRating = async (ratingData: CreateRatingReqBody): Promise<RatingResponseData | null> => {
      const ratingCollection = databaseService.ratings
      if (!ratingData.userId) {
            throw new Error('userId is required to create a rating')
      }
      const newRating = new Rating({
            ...ratingData,
            userId: new ObjectId(ratingData.userId),
            created_at: new Date(),
            updated_at: new Date()
      })

      try {
            const result = await ratingCollection.insertOne(newRating)
            const insertedRating = await ratingCollection.findOne({ _id: result.insertedId })
            const user = await databaseService.users.findOne({ _id: new ObjectId(ratingData.userId) })
            return toRatingResponseData(insertedRating as Rating, user as UserType)
      } 
      catch (error) {
            console.error('Error creating rating:', error)
            throw error instanceof Error ? error : new Error('Unknown error')
      }
}


export const deleteRatingById = async (ratingId: string) => {
      const ratingCollection = databaseService.ratings
      try {
            const result = await ratingCollection.deleteOne({ _id: new ObjectId(ratingId) })
            return result.deletedCount > 0
      } 
      catch (error) {
            console.error('Error deleting rating:', error)
            throw error instanceof Error ? error : new Error('Unknown error')
      }
}

const toRatingResponseData = async (rating: Rating, user: UserType): Promise<RatingResponseData> => {
      return {
            _id: rating._id!,
            rating: rating.rating,
            comment: rating.comment,
            created_at: rating.created_at,
            updated_at: rating.updated_at,
            user: {
                  _id: user._id,
                  fullname: user.fullname,
                  email: user.email,
                  avatar: user.avatar,
                  phone: user.phone,
                  date_of_birth: user.date_of_birth,
                  password: user.password,
                  created_at: user.created_at,
                  updated_at: user.updated_at,
                  email_verify_token: user.email_verify_token,
                  forgot_password_token: user.forgot_password_token,
                  verify: user.verify,
                  bio: user.bio,
                  location: user.location,
                  website: user.website,
                  username: user.username,
                  cover_photo: user.cover_photo,
                  role: user.role
            }
      }
}