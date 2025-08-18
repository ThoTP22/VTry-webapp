import axiosInstance from './axios';
import API_ENDPOINTS from '../services/apiEndpoints';

class ProductsAPI {
  /**
   * Get all products
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  static async getAllProducts(params = {}) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.GET_ALL, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise} API response
   */
  static async getProductById(productId) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(productId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new product
   * @param {Object} productData - Product data
   * @returns {Promise} API response
   */
  static async createProduct(productData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update product
   * @param {Object} productData - Product data with ID
   * @returns {Promise} API response
   */
  static async updateProduct(productData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.UPDATE, productData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete product
   * @param {string} productId - Product ID
   * @returns {Promise} API response
   */
  static async deleteProduct(productId) {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DELETE(productId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload single product image
   * @param {FormData} formData - Form data with image
   * @returns {Promise} API response
   */
  static async uploadProductImage(formData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.UPLOAD_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload multiple product images
   * @param {FormData} formData - Form data with images
   * @returns {Promise} API response
   */
  static async uploadProductImages(formData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.UPLOAD_IMAGES, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get products by category
   * @param {string} category - Product category
   * @param {number} limit - Limit number of products
   * @returns {Promise} API response
   */
  static async getProductsByCategory(category, limit = 10) {
    try {
      return await this.getAllProducts({ category, limit });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get newest products
   * @param {number} limit - Limit number of products
   * @returns {Promise} API response
   */
  static async getNewestProducts(limit = 8) {
    try {
      return await this.getAllProducts({ sort: 'newest', limit });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} API response
   */
  static async searchProducts(query, filters = {}) {
    try {
      const params = { search: query, ...filters };
      return await this.getAllProducts(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - API error
   * @returns {Error} Formatted error
   */
  static handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || error.message;
      const status = error.response.status;
      return new Error(`${status}: ${message}`);
    } else if (error.request) {
      return new Error('Network error: No response from server');
    } else {
      return new Error(error.message || 'Unknown error occurred');
    }
  }
}

export default ProductsAPI;
