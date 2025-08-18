// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// User verification status
export const USER_VERIFICATION_STATUS = {
  UNVERIFIED: 0,
  VERIFIED: 1,
  BANNED: 2
};

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Product categories
export const PRODUCT_CATEGORIES = {
  MEN: 'men',
  WOMEN: 'women',
  KIDS: 'kids',
  HOODIES: 'hoodies',
  SHIRTS: 'shirts',
  PANTS: 'pants',
  SHOES: 'shoes',
  ACCESSORIES: 'accessories'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    LOGOUT: '/users/logout',
    REFRESH_TOKEN: '/users/refresh-token',
    VERIFY_EMAIL: '/users/verify-email',
    RESEND_VERIFY_EMAIL: '/users/resend-verify-email',
    FORGOT_PASSWORD: '/users/forgot-password',
    RESET_PASSWORD: '/users/reset-password',
    GET_ME: '/users/me',
    OAUTH_GOOGLE: '/users/oauth/google'
  },
  PRODUCTS: {
    GET_ALL: '/products/all',
    GET_BY_ID: (id) => `/products/${id}`,
    CREATE: '/products/create',
    UPDATE: '/products/update',
    DELETE: (id) => `/products/${id}`,
    UPLOAD_IMAGE: '/products/upload-image',
    UPLOAD_IMAGES: '/products/upload-images'
  },
  IMAGES: {
    UPLOAD: '/images/upload',
    UPLOAD_MULTIPLE: '/images/upload-multiple',
    DELETE: (key) => `/images/delete/${key}`,
    DELETE_BY_URL: '/images/delete-by-url'
  }
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  CART_ITEMS: 'cart_items'
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successfully',
    REGISTER: 'Register successfully',
    LOGOUT: 'Logout successfully',
    EMAIL_SENT: 'Email has been sent',
    PASSWORD_RESET: 'Password has been reset',
    PRODUCT_CREATED: 'Product has been created',
    PRODUCT_UPDATED: 'Product has been updated',
    PRODUCT_DELETED: 'Product has been deleted',
    IMAGE_UPLOADED: 'Image has been uploaded'
  },
  ERROR: {
    NETWORK: 'Network error',
    UNAUTHORIZED: 'You are not authorized',
    INVALID_CREDENTIALS: 'Email or password is incorrect',
    EMAIL_EXISTS: 'Email already exists',
    USER_NOT_FOUND: 'User not found',
    PRODUCT_NOT_FOUND: 'Product not found',
    INVALID_TOKEN: 'Invalid token',
    PASSWORD_MISMATCH: 'Password mismatch',
    REQUIRED_FIELDS: 'Please fill in all fields',
    FILE_TOO_LARGE: 'File is too large',
    INVALID_FILE_TYPE: 'Invalid file type'
  }
};
