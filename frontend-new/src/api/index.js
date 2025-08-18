import AuthAPI from './authAPI';
import ProductsAPI from './productsAPI';
import ImagesAPI from './imagesAPI';

// Export all API services
export {
  AuthAPI,
  ProductsAPI,
  ImagesAPI,
};

// Default export with all services
const API = {
  auth: AuthAPI,
  products: ProductsAPI,
  images: ImagesAPI,
};

export default API;
