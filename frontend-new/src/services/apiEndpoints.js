/**
 * API Endpoints Configuration for Frontend-New
 * Centralized location for all API endpoint URLs
 * Based on backend routes analysis
 */

const getBackendUrl = () => {
  const url = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5194/api';
  
  // Log URL for debugging (always log during development)
  console.log('getBackendUrl Debug:', {
    envValue: url,
    isUndefined: url === undefined,
    isNull: url === null,
    isEmpty: url === '',
    finalUrl: url
  });
  
  return url;
};

const API_ENDPOINTS = {
  // Authentication endpoints (Users)
  AUTH: {
    get LOGIN() { return `${getBackendUrl()}/users/login`; },
    get REGISTER() { return `${getBackendUrl()}/users/register`; },
    get LOGOUT() { return `${getBackendUrl()}/users/logout`; },
    get REFRESH_TOKEN() { return `${getBackendUrl()}/users/refresh-token`; },
    get VERIFY_EMAIL() { return `${getBackendUrl()}/users/verify-email`; },
    get RESEND_VERIFY_EMAIL() { return `${getBackendUrl()}/users/resend-verify-email`; },
    get FORGOT_PASSWORD() { return `${getBackendUrl()}/users/forgot-password`; },
    get RESET_PASSWORD() { return `${getBackendUrl()}/users/reset-password`; },
    get GET_ME() { return `${getBackendUrl()}/users/me`; },
    get OAUTH_GOOGLE() { return `${getBackendUrl()}/users/oauth/google`; },
  },

  // Product endpoints
  PRODUCTS: {
    get GET_ALL() { return `${getBackendUrl()}/products/all`; },
    GET_BY_ID: (id) => `${getBackendUrl()}/products/${id}`,
    get CREATE() { return `${getBackendUrl()}/products/create`; },
    DELETE: (id) => `${getBackendUrl()}/products/${id}`,
    get UPDATE() { return `${getBackendUrl()}/products/update`; },
    get UPLOAD_IMAGE() { return `${getBackendUrl()}/products/upload-image`; },
    get UPLOAD_IMAGES() { return `${getBackendUrl()}/products/upload-images`; },
  },

  // Image management endpoints
  IMAGES: {
    // URL đã có /api từ REACT_APP_API_BASE_URL nên không cần thêm tiền tố /api nữa
    get UPLOAD_SINGLE() { return `${getBackendUrl()}/images/upload`; },
    get UPLOAD_MULTIPLE() { return `${getBackendUrl()}/images/upload-multiple`; },
    DELETE_BY_KEY: (key) => `${getBackendUrl()}/images/delete/${key}`,
    get DELETE_BY_URL() { return `${getBackendUrl()}/images/delete-by-url`; },
    PRESIGNED_URL: (key) => `${getBackendUrl()}/images/presigned/${key}`,
    get BUCKET_POLICY() { return `${getBackendUrl()}/images/bucket-policy`; },
    get CHECK_URL() { return `${getBackendUrl()}/images/check-url`; },
  },

  // Cart endpoints (for future implementation)
  CART: {
    // TODO: Implement when backend has cart routes
  },

  // Order endpoints
  ORDERS: {
    get CREATE() { return `${getBackendUrl()}/orders`; },
    get MY_ORDERS() { return `${getBackendUrl()}/orders/my-orders`; },
    get MY_STATS() { return `${getBackendUrl()}/orders/my-stats`; },
    GET_BY_ID: (id) => `${getBackendUrl()}/orders/${id}`,
    GET_BY_ORDER_NUMBER: (orderNumber) => `${getBackendUrl()}/orders/order-number/${orderNumber}`,
    CANCEL_ORDER: (id) => `${getBackendUrl()}/orders/${id}/cancel`,
    get ADMIN_ALL() { return `${getBackendUrl()}/orders/admin/all`; },
    get ADMIN_STATS() { return `${getBackendUrl()}/orders/admin/stats`; },
    UPDATE_STATUS: (id) => `${getBackendUrl()}/orders/admin/${id}/status`,
  },

  // Payment endpoints
  PAYMENT: {
    get CREATE() { return `${getBackendUrl()}/payments`; },
    STATUS: (orderCode) => `${getBackendUrl()}/payments/status/${orderCode}`,
    CANCEL: (orderCode) => `${getBackendUrl()}/payments/cancel/${orderCode}`,
    get WEBHOOK() { return `${getBackendUrl()}/payments/webhook`; },
    get MY_PAYMENTS() { return `${getBackendUrl()}/payments/my-payments`; },
    USER_PAYMENTS: (userId) => `${getBackendUrl()}/payments/admin/user/${userId}/payments`,
  },

  // Virtual Try-on endpoints
  VIRTUAL_TRYON: {
    get TRYON() { return `${getBackendUrl()}/visual-tryon/tryon`; },
    get ANALYSIS() { return `${getBackendUrl()}/visual-tryon/analysis`; }, // Legacy endpoint
  },

  // User profile endpoints (for future implementation)
  USER: {
    // TODO: Implement when backend has user profile routes
  },

  // Admin endpoints (for future implementation)
  ADMIN: {
    // TODO: Implement when backend has admin routes
  },

  // Search endpoints (for future implementation)
  SEARCH: {
    // TODO: Implement when backend has search routes
  },

  // Category endpoints (for future implementation)
  CATEGORIES: {
    // TODO: Implement when backend has category routes
  },

  // Wishlist endpoints (for future implementation)
  WISHLIST: {
    // TODO: Implement when backend has wishlist routes
  },

  // Notification endpoints (for future implementation)
  NOTIFICATIONS: {
    // TODO: Implement when backend has notification routes
  },

  // Feedback/Review endpoints (for future implementation)
  FEEDBACK: {
    // TODO: Implement when backend has feedback routes
  },

  // Analytics endpoints (for future implementation)
  ANALYTICS: {
    // TODO: Implement when backend has analytics routes
  },
};

export default API_ENDPOINTS;

/**
 * Helper functions for building complex URLs
 */
export const buildUrl = {
  // Build product filter URL with multiple parameters
  productFilter: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.size) params.append('size', filters.size);
    if (filters.color) params.append('color', filters.color);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);
    
    return `${getBackendUrl()}/products?${params.toString()}`;
  },

  // Build search URL with filters
  searchWithFilters: (query, filters = {}) => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.limit) params.append('limit', filters.limit);
    
    return `${getBackendUrl()}/search/products?${params.toString()}`;
  },

  // Build image URL
  imageUrl: (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${getBackendUrl()}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  },

  // Build pagination URL
  pagination: (baseUrl, page = 1, limit = 10) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}&limit=${limit}`;
  },
};

/**
 * HTTP Methods constants
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

/**
 * Common headers for API requests
 */
export const getHeaders = (includeAuth = true, isFormData = false) => {
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

/**
 * API Response Status Codes
 */
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not logged in or your session has expired.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The resource you are looking for does not exist.',
  VALIDATION_ERROR: 'Invalid data. Please check again.',
  SERVER_ERROR: 'Server error. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
};
