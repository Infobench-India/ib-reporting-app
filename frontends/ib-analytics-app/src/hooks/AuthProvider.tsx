import React, { createContext, ReactNode } from 'react';
import { getSession, isAuth, logout } from '../services/AuthService';

type AuthContextType = {
  getSession: () => Promise<any>;
  isAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const auth = {
    getSession,
    isAuth,
    logout,
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
