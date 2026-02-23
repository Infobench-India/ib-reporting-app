import { useContext } from 'react';
import { AuthContext, AuthContextType } from './RBACAuthProvider';

export const useRBACAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useRBACAuth must be used within an AuthProvider');
  }

  return context;
};
