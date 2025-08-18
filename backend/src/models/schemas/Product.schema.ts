import { ObjectId } from 'mongodb'

export type ProductType = {
  _id?: ObjectId
  name: string
  description: string
  price: number
  category: string
  image: string
  created_at?: Date
  updated_at?: Date
}

export default class Product {
  _id?: ObjectId
  name: string
  description: string
  price: number
  category: string
  image: string
  created_at?: Date
  updated_at?: Date

  constructor(product: ProductType) {
    const date = new Date()
    this._id = product._id || new ObjectId()
    this.name = product.name || ''
    this.description = product.description || ''
    this.price = product.price || 0
    this.category = product.category || ''
    this.image = product.image || ''
    this.created_at = product.created_at || date
    this.updated_at = product.updated_at || date
  }
}


