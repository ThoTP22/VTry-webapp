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
      console.log('🔄 LOGIN_SUCCESS action:', {
        payload: action.payload,
        newUser: action.payload.user,
        newIsAuthenticated: true
      });
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
      console.log('🔄 LOGOUT action: clearing user state');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AuthActions.SET_USER:
      console.log('🔄 SET_USER action:', {
        payload: action.payload,
        newUser: action.payload.user,
        newIsAuthenticated: !!action.payload.user
      });
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };
    case AuthActions.SET_LOADING:
      console.log('🔄 SET_LOADING action:', {
        payload: action.payload,
        newIsLoading: action.payload.isLoading
      });
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

  // Check token expiration periodically
  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = setInterval(() => {
        if (!checkTokenExpiration()) {
          // Token expired, try to refresh
          AuthAPI.refreshToken().catch(() => {
            dispatch({ type: AuthActions.LOGOUT });
          });
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated]);

  const initializeAuth = async () => {
    try {
      console.log('🔐 Initializing authentication...');
      dispatch({ type: AuthActions.SET_LOADING, payload: { isLoading: true } });
      
      // First try to get user info from localStorage
      const storedUserInfo = AuthAPI.getUserInfo();
      console.log('📦 Stored user info:', storedUserInfo);
      if (storedUserInfo) {
        console.log('✅ Found stored user info, setting user state');
        dispatch({
          type: AuthActions.SET_USER,
          payload: { user: storedUserInfo },
        });
      }
      
      // Then try to validate token and get fresh user data
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      console.log('🎫 Access token exists:', !!token);
      if (token) {
        const isTokenValid = checkTokenExpiration();
        console.log('⏰ Token expiration check:', isTokenValid ? 'valid' : 'expired');
        
        if (isTokenValid) {
          // Token is valid, try to get user data
          console.log('✅ Token is valid, calling getMe...');
          try {
            const response = await AuthAPI.getMe();
            const user = response.result;
            console.log('👤 Fresh user data from API:', user);
            dispatch({
              type: AuthActions.SET_USER,
              payload: { user },
            });
          } catch (error) {
            console.error('❌ Token validation failed:', error);
            // Try to refresh token
            console.log('🔄 Attempting token refresh...');
            try {
              await AuthAPI.refreshToken();
              const response = await AuthAPI.getMe();
              const user = response.result;
              console.log('✅ Token refresh successful, user data:', user);
              dispatch({
                type: AuthActions.SET_USER,
                payload: { user },
              });
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
              AuthAPI.clearAuthData();
              dispatch({ type: AuthActions.LOGOUT });
            }
          }
        } else {
          // Token exists but expired, try to refresh
          console.log('⏰ Token expired, attempting refresh...');
          try {
            await AuthAPI.refreshToken();
            const response = await AuthAPI.getMe();
            const user = response.result;
            console.log('✅ Token refresh successful, user data:', user);
            dispatch({
              type: AuthActions.SET_USER,
              payload: { user },
            });
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            AuthAPI.clearAuthData();
            dispatch({ type: AuthActions.LOGOUT });
          }
        }
      } else {
        console.log('❌ No access token found');
        dispatch({ type: AuthActions.SET_LOADING, payload: { isLoading: false } });
      }
    } catch (error) {
      console.error('❌ Initialize auth error:', error);
      AuthAPI.clearAuthData();
      dispatch({ type: AuthActions.SET_LOADING, payload: { isLoading: false } });
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Login attempt with credentials:', { email: credentials.email });
      dispatch({ type: AuthActions.LOGIN_START });
      
      const response = await AuthAPI.login(credentials);
      const user = response.result;
      console.log('✅ Login successful, user data:', user);
      
      // Store user info in localStorage for persistence
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
        console.log('💾 User info stored in localStorage');
      }
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { user },
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login failed:', error);
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
    const result = state.user?.role === 'admin';
    console.log('👑 isAdmin check:', {
      user: state.user,
      userRole: state.user?.role,
      isAdmin: result
    });
    return result;
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      console.log('❌ No token found in checkTokenExpiration');
      return false;
    }
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      console.log('⏰ Token expiration check:', {
        currentTime: new Date(currentTime * 1000).toISOString(),
        expiryTime: new Date(payload.exp * 1000).toISOString(),
        timeUntilExpiry: Math.round(timeUntilExpiry / 60) + ' minutes',
        isExpired: payload.exp < currentTime
      });
      
      if (payload.exp < currentTime) {
        // Token expired, try to refresh
        console.log('❌ Token is expired');
        return false;
      }
      console.log('✅ Token is valid');
      return true;
    } catch (error) {
      console.error('❌ Error checking token expiration:', error);
      return false;
    }
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
    checkTokenExpiration,
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
