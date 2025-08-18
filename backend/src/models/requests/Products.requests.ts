export interface CreateProductReqBody {
  name: string
  description: string
  price: number
  imageUrl?: string
  category: string
}

export interface UpdateProductReqBody {
  _id: string
  name?: string
  description?: string
  price?: number
  imageUrl?: string
  category?: string
}
