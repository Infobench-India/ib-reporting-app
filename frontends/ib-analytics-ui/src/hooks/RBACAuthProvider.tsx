import React, { createContext, ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { AuthService, User } from '../services/RBACAuthService';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  isFeatureEnabled: (feature: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(AuthService.getUser());
  const [isLoading, setIsLoading] = useState(false);
  const [license, setLicense] = useState<any>(null);

  const fetchLicense = useCallback(async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_REACT_APP_AUTH_API_URL || 'http://localhost:3051/api/auth';
      const res = await fetch(`${API_BASE_URL}/activation/status`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLicense(data);
      }
    } catch (err) {
      console.error('Failed to fetch license', err);
    }
  }, []);

  useEffect(() => {
    const storedUser = AuthService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    fetchLicense();
  }, [fetchLicense]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(email, password);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      setIsLoading(true);
      try {
        await AuthService.register(email, password, firstName, lastName);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refreshToken = useCallback(async () => {
    try {
      await AuthService.refreshAccessToken();
      const updatedUser = AuthService.getUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  const isFeatureEnabled = useCallback((feature: string) => {
    if (!license || !license.activated) return false;
    return !!license.payload?.features?.[feature];
  }, [license]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: AuthService.isAuthenticated(),
    isLoading,
    login,
    logout,
    register,
    refreshToken,
    hasPermission: (permission: string) => AuthService.hasPermission(permission),
    hasRole: (role: string) => AuthService.hasRole(role),
    hasAnyRole: (roles: string[]) => AuthService.hasAnyRole(roles),
    hasAnyPermission: (permissions: string[]) => AuthService.hasAnyPermission(permissions),
    isFeatureEnabled
  }), [user, isLoading, login, logout, register, refreshToken, isFeatureEnabled]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
