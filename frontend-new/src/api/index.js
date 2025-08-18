import AuthAPI from './authAPI';
import ProductsAPI from './productsAPI';
import ImagesAPI from './imagesAPI';
import RatingsAPI from './ratingsAPI';

// Export all API services
export {
  AuthAPI,
  ProductsAPI,
  ImagesAPI,
  RatingsAPI,
};

// Default export with all services
const API = {
  auth: AuthAPI,
  products: ProductsAPI,
  images: ImagesAPI,
  ratings: RatingsAPI,
};

export default API;
