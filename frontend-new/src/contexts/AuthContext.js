import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthAPI } from '../api';
import { STORAGE_KEYS, USER_VERIFICATION_STATUS } from '../constants';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AuthActions = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActions.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AuthActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AuthActions.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };
    case AuthActions.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AuthActions.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };
    case AuthActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    case AuthActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: AuthActions.SET_LOADING, payload: { isLoading: true } });
      
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        const response = await AuthAPI.getMe();
        const user = response.result;
        dispatch({
          type: AuthActions.SET_USER,
          payload: { user },
        });
      } else {
        dispatch({ type: AuthActions.SET_LOADING, payload: { isLoading: false } });
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      AuthAPI.clearAuthData();
      dispatch({ type: AuthActions.SET_LOADING, payload: { isLoading: false } });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActions.LOGIN_START });
      
      const response = await AuthAPI.login(credentials);
      const user = response.result;
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { user },
      });
      
      return { success: true, user };
    } catch (error) {
      dispatch({
        type: AuthActions.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AuthActions.LOGIN_START });
      
      const response = await AuthAPI.register(userData);
      
      // After registration, user might need to verify email
      dispatch({ type: AuthActions.SET_LOADING, payload: { isLoading: false } });
      
      return { success: true, data: response };
    } catch (error) {
      dispatch({
        type: AuthActions.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AuthActions.LOGOUT });
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await AuthAPI.verifyEmail(token);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resendEmailVerification = async () => {
    try {
      const response = await AuthAPI.resendEmailVerification();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await AuthAPI.forgotPassword(email);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (resetData) => {
    try {
      const response = await AuthAPI.resetPassword(resetData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUser = (user) => {
    dispatch({
      type: AuthActions.SET_USER,
      payload: { user },
    });
  };

  const clearError = () => {
    dispatch({ type: AuthActions.CLEAR_ERROR });
  };

  // Helper functions
  const isEmailVerified = () => {
    return state.user?.verify === USER_VERIFICATION_STATUS.VERIFIED;
  };

  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    verifyEmail,
    resendEmailVerification,
    forgotPassword,
    resetPassword,
    updateUser,
    clearError,
    
    // Helpers
    isEmailVerified,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
