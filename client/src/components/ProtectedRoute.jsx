import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-sans text-sm text-on-surface-variant font-medium">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // If attempting to access staff routes, redirect to staff login; else admin login
    const isStaffRoute = location.pathname.startsWith('/staff');
    return <Navigate to={isStaffRoute ? '/staff-login' : '/login'} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles to their respective dashboards
    return <Navigate to={user.role === 'admin' ? '/admin' : '/staff'} replace />;
  }

  return children;
};
