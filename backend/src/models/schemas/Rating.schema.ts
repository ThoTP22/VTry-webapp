import { ObjectId } from 'mongodb'  

export type RatingType = {
  _id?: ObjectId
  userId: ObjectId
  rating: number
  comment?: string
  created_at?: Date
  updated_at?: Date
}

export default class Rating {
  _id?: ObjectId
  userId: ObjectId
  rating: number
  comment?: string
  created_at?: Date
  updated_at?: Date

  constructor(rating: RatingType) {
    const date = new Date()
    this._id = rating._id || new ObjectId()
    this.userId = rating.userId
    this.rating = rating.rating || 0
    this.comment = rating.comment || ''
    this.created_at = rating.created_at || date
    this.updated_at = rating.updated_at || date
  }
}

