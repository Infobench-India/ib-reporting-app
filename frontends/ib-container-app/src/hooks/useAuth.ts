import { useContext } from 'react';
import { AuthContext, User as AuthUser } from '../auth/AuthProvider';

export type User = AuthUser;

export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    ...context,
    isAuthenticated: !!context.user,
    isFeatureEnabled: context.isFeatureEnabled,
    license: context.license
  };
}
