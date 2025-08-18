import axiosInstance from './axios';
import API_ENDPOINTS from '../services/apiEndpoints';
import { STORAGE_KEYS } from '../constants';

class AuthAPI {
  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Promise} API response
   */
  static async register(userData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise} API response
   */
  static async login(credentials) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      const { result } = response.data;
      
      // Store tokens
      if (result.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.access_token);
      }
      if (result.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.refresh_token);
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   * @returns {Promise} API response
   */
  static async logout() {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, {
        refresh_token: refreshToken
      });
      
      // Clear storage
      this.clearAuthData();
      
      return response.data;
    } catch (error) {
      // Clear storage even if logout fails
      this.clearAuthData();
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   * @returns {Promise} API response
   */
  static async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refresh_token: refreshToken
      });
      
      const { result } = response.data;
      if (result.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.access_token);
      }
      
      return response.data;
    } catch (error) {
      this.clearAuthData();
      throw this.handleError(error);
    }
  }

  /**
   * Get current user info
   * @returns {Promise} API response
   */
  static async getMe() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.GET_ME);
      const userData = response.data.result;
      
      // Store user info
      if (userData) {
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      // If getMe fails, try to refresh token
      if (error.response?.status === 401) {
        try {
          await this.refreshToken();
          // Retry getMe after token refresh
          const retryResponse = await axiosInstance.get(API_ENDPOINTS.AUTH.GET_ME);
          const retryUserData = retryResponse.data.result;
          
          if (retryUserData) {
            localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(retryUserData));
          }
          
          return retryResponse.data;
        } catch (refreshError) {
          // If refresh also fails, clear auth data
          this.clearAuthData();
          throw this.handleError(refreshError);
        }
      }
      throw this.handleError(error);
    }
  }

  /**
   * Verify email
   * @param {string} emailVerifyToken - Email verification token
   * @returns {Promise} API response
   */
  static async verifyEmail(emailVerifyToken) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        email_verify_token: emailVerifyToken
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend email verification
   * @returns {Promise} API response
   */
  static async resendEmailVerification() {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESEND_VERIFY_EMAIL, {});
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} API response
   */
  static async forgotPassword(email) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password
   * @param {Object} resetData - Password reset data
   * @returns {Promise} API response
   */
  static async resetPassword(resetData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * OAuth Google login
   * @returns {Promise} API response
   */
  static async oauthGoogle() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.OAUTH_GOOGLE);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  static isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get stored user info
   * @returns {Object|null} User info
   */
  static getUserInfo() {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Clear all authentication data
   */
  static clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  }

  /**
   * Handle API errors
   * @param {Error} error - API error
   * @returns {Error} Formatted error
   */
  static handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.message;
      const status = error.response.status;
      return new Error(`${status}: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error: No response from server');
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error occurred');
    }
  }
}

export default AuthAPI;
