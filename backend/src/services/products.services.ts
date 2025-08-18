import databaseService from './database.services'
import { ObjectId } from 'mongodb'

class ProductServices {
  async getAllProducts() {
    const productsCollection = databaseService.products
    const products = await productsCollection.find({}).toArray()
    return products
  }

  async createProduct(productData: any) {
    const productsCollection = databaseService.products
    const newProduct = {
      ...productData,
      created_at: new Date(),
      updated_at: new Date()
    }
    const result = await productsCollection.insertOne(newProduct)
    const insertedProduct = await productsCollection.findOne({ _id: result.insertedId })
    return insertedProduct
  }

  async getProductById(productId: string) {
    const productsCollection = databaseService.products
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) })
    return product
  }

  async updateProductById(productId: string, productData: any) {
    const productsCollection = databaseService.products
    // Remove _id from productData to avoid MongoDB immutable field error
    const { _id, ...dataWithoutId } = productData
    const updatedProduct = {
      ...dataWithoutId,
      updated_at: new Date()
    }
    const result = await productsCollection.updateOne({ _id: new ObjectId(productId) }, { $set: updatedProduct })
    if (result.modifiedCount === 0) {
      return null
    }
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) })
    return product
  }
  async deleteProductById(productId: string) {
    const productsCollection = databaseService.products
    const result = await productsCollection.deleteOne({ _id: new ObjectId(productId) })
    return result.deletedCount > 0
  }
}

const productsService = new ProductServices()
export default productsService
