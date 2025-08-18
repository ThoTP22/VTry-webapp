import { config } from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateProductReqBody, UpdateProductReqBody } from '~/models/requests/Products.requests'
import productsService from '~/services/products.services'

export const getAllProductsController = async (req: Request, res: Response) => {
  try {
    const products = await productsService.getAllProducts()
    return res.json({
      message: 'Products retrieved successfully',
      result: products
    })
  } catch (error) {
    console.error('Error retrieving products:', error)
    return res.status(500).json({
      message: 'Failed to retrieve products',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const createProductController = async (
  req: Request<ParamsDictionary, any, CreateProductReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const productData = req.body
    const newProduct = await productsService.createProduct(productData)
    return res.status(201).json({
      message: 'Product created successfully',
      result: newProduct
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return res.status(500).json({
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getProductByIdController = async (req: Request, res: Response) => {
  const productId = req.params.id
  try {
    const product = await productsService.getProductById(productId)
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      })
    }
    return res.json({
      message: 'Product retrieved successfully',
      result: product
    })
  } catch (error) {
    console.error('Error retrieving product:', error)
    return res.status(500).json({
      message: 'Failed to retrieve product',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const deleteProductController = async (req: Request, res: Response) => {
  const productId = req.params.id
  try {
    const result = await productsService.deleteProductById(productId)
    if (!result) {
      return res.status(404).json({
        message: 'Product not found'
      })
    }
    return res.json({
      message: 'Product deleted successfully',
      result
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return res.status(500).json({
      message: 'Failed to delete product',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const updateProductController = async (
  req: Request<ParamsDictionary, any, UpdateProductReqBody>,
  res: Response
) => {
  const productId = req.body._id
  if (!productId) {
    return res.status(400).json({
      message: 'Product ID is required for update'
    })
  }
  // Extract _id from the body to avoid passing it to the update operation
  const { _id, ...productData } = req.body
  try {
    const updatedProduct = await productsService.updateProductById(productId, productData)
    if (!updatedProduct) {
      return res.status(404).json({
        message: 'Product not found'
      })
    }
    return res.json({
      message: 'Product updated successfully',
      result: updatedProduct
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return res.status(500).json({
      message: 'Failed to update product',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
