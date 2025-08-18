import axiosInstance from './axios';
import API_ENDPOINTS from '../services/apiEndpoints';

class RatingsAPI {
  static async createRating(payload) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.RATINGS.CREATE, payload);
      return response.data;
    } catch (error) {
      throw RatingsAPI.handleError(error);
    }
  }

  static async getAllRatings() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.RATINGS.GET_ALL);
      return response.data;
    } catch (error) {
      throw RatingsAPI.handleError(error);
    }
  }

  static async deleteRating(id) {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.RATINGS.DELETE(id));
      return response.data;
    } catch (error) {
      throw RatingsAPI.handleError(error);
    }
  }

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

export default RatingsAPI; 