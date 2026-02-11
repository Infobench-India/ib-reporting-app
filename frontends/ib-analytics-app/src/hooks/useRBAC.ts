import { useRBACAuth } from './useRBACAuth';

export const usePermission = (permission: string | string[]): boolean => {
  const { hasPermission, hasAnyPermission } = useRBACAuth();

  if (Array.isArray(permission)) {
    return hasAnyPermission(permission);
  }

  return hasPermission(permission);
};

export const useRole = (role: string | string[]): boolean => {
  const { hasRole, hasAnyRole } = useRBACAuth();

  if (Array.isArray(role)) {
    return hasAnyRole(role);
  }

  return hasRole(role);
};

export const useCanAccess = (
  requiredPermissions?: string[],
  requiredRoles?: string[]
): boolean => {
  const { hasAnyPermission, hasAnyRole } = useRBACAuth();

  const hasRequiredPermissions = !requiredPermissions || requiredPermissions.length === 0 || hasAnyPermission(requiredPermissions);
  const hasRequiredRoles = !requiredRoles || requiredRoles.length === 0 || hasAnyRole(requiredRoles);

  return hasRequiredPermissions && hasRequiredRoles;
};
