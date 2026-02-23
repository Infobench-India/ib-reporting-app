import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRBACAuth } from '../hooks/useRBACAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallbackPath?: string;
}

/**
 * Protected Route Component
 * Redirects to login if not authenticated
 * Redirects to unauthorized if user lacks required permissions/roles
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, hasAnyPermission, hasAnyRole } = useRBACAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredPermissions = requiredPermissions.length === 0 || hasAnyPermission(requiredPermissions);
  const hasRequiredRoles = requiredRoles.length === 0 || hasAnyRole(requiredRoles);

  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

/**
 * Public Route Component
 * Redirects authenticated users to home
 */
interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/home',
}) => {
  const { isAuthenticated } = useRBACAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
