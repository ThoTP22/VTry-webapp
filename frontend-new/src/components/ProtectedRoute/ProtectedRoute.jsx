import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute render:', {
    requireAdmin,
    user,
    isLoading,
    userRole: user?.role,
    isAdmin: user?.role === 'admin',
    pathname: location.pathname
  });

  if (isLoading) {
    console.log('⏳ ProtectedRoute: Loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProtectedRoute: No user, redirecting to login');
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    console.log('❌ ProtectedRoute: User not admin, redirecting to home');
    // Redirect to home if user is not admin
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;
