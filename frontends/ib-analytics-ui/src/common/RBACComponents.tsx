import React from 'react';
import { useRBACAuth } from '../hooks/useRBACAuth';

interface ProtectedProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

/**
 * Component for role-based access control
 * Renders children only if user has required permissions or roles
 */
export const ProtectedComponent: React.FC<ProtectedProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallback = null,
}) => {
  const { hasAnyPermission, hasAnyRole } = useRBACAuth();

  const hasRequiredPermissions = requiredPermissions.length === 0 || hasAnyPermission(requiredPermissions);
  const hasRequiredRoles = requiredRoles.length === 0 || hasAnyRole(requiredRoles);

  if (hasRequiredPermissions && hasRequiredRoles) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Hook-based component for permission-based rendering
 */
export const CanAccess: React.FC<ProtectedProps> = (props) => {
  return <ProtectedComponent {...props} />;
};

/**
 * Component that renders children conditionally based on role
 */
interface RoleBasedProps {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}

export const RoleBasedComponent: React.FC<RoleBasedProps> = ({
  children,
  roles,
  fallback = null,
}) => {
  const { hasAnyRole } = useRBACAuth();

  if (hasAnyRole(roles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
