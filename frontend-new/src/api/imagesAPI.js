import axiosInstance from "./axios";
import API_ENDPOINTS from "../services/apiEndpoints";

class ImagesAPI {
  /**
   * Upload single image
   * @param {File} file - Image file
   * @returns {Promise} API response
   */
  static async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Check token and log detailed debug info
      const token = localStorage.getItem('access_token');
      console.log('Upload Image Debug:', {
        endpoint: API_ENDPOINTS.IMAGES.UPLOAD_SINGLE,
        hasToken: !!token,
        tokenFirstChars: token ? `${token.substring(0, 15)}...` : 'NO TOKEN',
        envValue: process.env.REACT_APP_API_BASE_URL,
        finalUrl: API_ENDPOINTS.IMAGES.UPLOAD_SINGLE
      });

      // Use explicit Authorization header to ensure token is sent
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axiosInstance.post(
        API_ENDPOINTS.IMAGES.UPLOAD_SINGLE,
        formData,
        { headers }
      );
      console.log('Upload Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Upload Image Error:', error);
      console.error('Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw this.handleError(error);
    }
  }

  /**
   * Upload multiple images
   * @param {File[]} files - Array of image files
   * @returns {Promise} API response
   */
  static async uploadMultipleImages(files) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      // Check token and log detailed debug info
      const token = localStorage.getItem('access_token');
      console.log('Upload Multiple Images Debug:', {
        endpoint: API_ENDPOINTS.IMAGES.UPLOAD_MULTIPLE,
        hasToken: !!token,
        fileCount: files.length,
        finalUrl: API_ENDPOINTS.IMAGES.UPLOAD_MULTIPLE
      });

      // Use explicit Authorization header to ensure token is sent
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axiosInstance.post(
        API_ENDPOINTS.IMAGES.UPLOAD_MULTIPLE,
        formData,
        { headers }
      );
      console.log('Upload Multiple Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Upload Multiple Images Error:', error);
      console.error('Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw this.handleError(error);
    }
  }

  /**
   * Delete image by key
   * @param {string} key - Image key/path
   * @returns {Promise} API response
   */
  static async deleteImage(key) {
    try {
      const encodedKey = encodeURIComponent(key);
      const response = await axiosInstance.delete(
        API_ENDPOINTS.IMAGES.DELETE_BY_KEY(encodedKey)
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete image by URL
   * @param {string} imageUrl - Full image URL
   * @returns {Promise} API response
   */
  static async deleteImageByUrl(imageUrl) {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.IMAGES.DELETE_BY_URL,
        {
          data: { imageUrl },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate image file
   * @param {File} file - Image file
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateImageFile(file, options = {}) {
    const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
    const allowedTypes = options.allowedTypes || [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const errors = [];

    if (file.size > maxSize) {
      errors.push(
        `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      );
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create image preview URL
   * @param {File} file - Image file
   * @returns {string} Preview URL
   */
  static createPreviewUrl(file) {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke image preview URL
   * @param {string} previewUrl - Preview URL to revoke
   */
  static revokePreviewUrl(previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  /**
   * Get optimized image URL
   * @param {string} imageUrl - Original image URL
   * @param {Object} options - Optimization options
   * @returns {string} Optimized image URL
   */
  static getOptimizedImageUrl(imageUrl, options = {}) {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    const params = new URLSearchParams();
    if (options.width) params.append("w", options.width);
    if (options.height) params.append("h", options.height);
    if (options.quality) params.append("q", options.quality);

    const queryString = params.toString();
    const separator = imageUrl.includes("?") ? "&" : "?";

    return queryString ? `${imageUrl}${separator}${queryString}` : imageUrl;
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
      return new Error("Network error: No response from server");
    } else {
      return new Error(error.message || "Unknown error occurred");
    }
  }

  /**
   * Get presigned URL for an existing image
   * @param {string} key - Image key/path
   * @returns {Promise} API response with presigned URL
   */
  static async getPresignedUrl(key) {
    try {
      const encodedKey = encodeURIComponent(key);
      const response = await axiosInstance.get(
        API_ENDPOINTS.IMAGES.PRESIGNED_URL(encodedKey)
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get bucket policy for public access setup
   * @returns {Promise} API response with bucket policy
   */
  static async getBucketPolicy() {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.IMAGES.BUCKET_POLICY
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check URL accessibility
   * @param {string} url - URL to check
   * @returns {Promise} API response with accessibility status
   */
  static async checkUrlAccessibility(url) {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.IMAGES.CHECK_URL,
        { url }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Initialize static properties for debugging
ImagesAPI.debugLogged = false;

export default ImagesAPI;
