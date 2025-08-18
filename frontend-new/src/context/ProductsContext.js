import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { ProductsAPI } from '../api';

// Initial state
const initialState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  filters: {
    category: '',
    search: '',
    sort: 'newest',
    page: 1,
    limit: 12,
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  },
};

// Action types
const ProductActions = {
  FETCH_PRODUCTS_START: 'FETCH_PRODUCTS_START',
  FETCH_PRODUCTS_SUCCESS: 'FETCH_PRODUCTS_SUCCESS',
  FETCH_PRODUCTS_FAILURE: 'FETCH_PRODUCTS_FAILURE',
  FETCH_PRODUCT_START: 'FETCH_PRODUCT_START',
  FETCH_PRODUCT_SUCCESS: 'FETCH_PRODUCT_SUCCESS',
  FETCH_PRODUCT_FAILURE: 'FETCH_PRODUCT_FAILURE',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_CURRENT_PRODUCT: 'SET_CURRENT_PRODUCT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
};

// Reducer
const productsReducer = (state, action) => {
  switch (action.type) {
    case ProductActions.FETCH_PRODUCTS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case ProductActions.FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        products: action.payload.products,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };
    case ProductActions.FETCH_PRODUCTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
    case ProductActions.FETCH_PRODUCT_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case ProductActions.FETCH_PRODUCT_SUCCESS:
      return {
        ...state,
        currentProduct: action.payload.product,
        isLoading: false,
        error: null,
      };
    case ProductActions.FETCH_PRODUCT_FAILURE:
      return {
        ...state,
        currentProduct: null,
        isLoading: false,
        error: action.payload.error,
      };
    case ProductActions.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload.filters,
        },
      };
    case ProductActions.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          category: '',
          search: '',
          sort: 'newest',
          page: 1,
          limit: 12,
        },
      };
    case ProductActions.SET_CURRENT_PRODUCT:
      return {
        ...state,
        currentProduct: action.payload.product,
      };
    case ProductActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case ProductActions.ADD_PRODUCT:
      return {
        ...state,
        products: [action.payload.product, ...state.products],
      };
    case ProductActions.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map(product =>
          product._id === action.payload.product._id
            ? action.payload.product
            : product
        ),
        currentProduct: state.currentProduct?._id === action.payload.product._id
          ? action.payload.product
          : state.currentProduct,
      };
    case ProductActions.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(product => product._id !== action.payload.productId),
        currentProduct: state.currentProduct?._id === action.payload.productId
          ? null
          : state.currentProduct,
      };
    default:
      return state;
  }
};

// Create context
const ProductsContext = createContext();

// Products provider component
export const ProductsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productsReducer, initialState);

  // Internal fetch function that doesn't depend on external state
  const _fetchProductsInternal = async (filters) => {
    try {
      dispatch({ type: ProductActions.FETCH_PRODUCTS_START });
      
      const response = await ProductsAPI.getAllProducts(filters);
      
      const products = response.result || [];
      const pagination = {
        total: products.length,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(products.length / filters.limit),
      };
      
      dispatch({
        type: ProductActions.FETCH_PRODUCTS_SUCCESS,
        payload: { products, pagination },
      });
      
      return { success: true, products };
    } catch (error) {
      dispatch({
        type: ProductActions.FETCH_PRODUCTS_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  // Public fetch function for external use
  const fetchProducts = useCallback(async (customFilters = {}) => {
    const filters = { ...state.filters, ...customFilters };
    return _fetchProductsInternal(filters);
  }, [state.filters]);

  // Fetch products when filters change
  useEffect(() => {
    _fetchProductsInternal(state.filters);
  }, [
    state.filters.category,
    state.filters.search,
    state.filters.sort,
    state.filters.page,
    state.filters.limit
  ]);

  const fetchProductById = async (productId) => {
    try {
      dispatch({ type: ProductActions.FETCH_PRODUCT_START });
      
      const response = await ProductsAPI.getProductById(productId);
      const product = response.result;
      
      dispatch({
        type: ProductActions.FETCH_PRODUCT_SUCCESS,
        payload: { product },
      });
      
      return { success: true, product };
    } catch (error) {
      dispatch({
        type: ProductActions.FETCH_PRODUCT_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  const createProduct = async (productData) => {
    try {
      const response = await ProductsAPI.createProduct(productData);
      const product = response.result;
      
      dispatch({
        type: ProductActions.ADD_PRODUCT,
        payload: { product },
      });
      
      return { success: true, product };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProduct = async (productData) => {
    try {
      const response = await ProductsAPI.updateProduct(productData);
      const product = response.result;
      
      dispatch({
        type: ProductActions.UPDATE_PRODUCT,
        payload: { product },
      });
      
      return { success: true, product };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await ProductsAPI.deleteProduct(productId);
      
      dispatch({
        type: ProductActions.DELETE_PRODUCT,
        payload: { productId },
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const searchProducts = async (query) => {
    try {
      const response = await ProductsAPI.searchProducts(query, state.filters);
      const products = response.result || [];
      
      dispatch({
        type: ProductActions.FETCH_PRODUCTS_SUCCESS,
        payload: { 
          products,
          pagination: {
            total: products.length,
            page: 1,
            limit: state.filters.limit,
            totalPages: Math.ceil(products.length / state.filters.limit),
          },
        },
      });
      
      return { success: true, products };
    } catch (error) {
      dispatch({
        type: ProductActions.FETCH_PRODUCTS_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  const setFilters = (filters) => {
    dispatch({
      type: ProductActions.SET_FILTERS,
      payload: { filters },
    });
  };

  const clearFilters = () => {
    dispatch({ type: ProductActions.CLEAR_FILTERS });
  };

  const setCurrentProduct = (product) => {
    dispatch({
      type: ProductActions.SET_CURRENT_PRODUCT,
      payload: { product },
    });
  };

  const clearError = () => {
    dispatch({ type: ProductActions.CLEAR_ERROR });
  };

  const value = {
    // State
    products: state.products,
    currentProduct: state.currentProduct,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    
    // Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    setFilters,
    clearFilters,
    setCurrentProduct,
    clearError,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

// Hook to use products context
export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export default ProductsContext;
