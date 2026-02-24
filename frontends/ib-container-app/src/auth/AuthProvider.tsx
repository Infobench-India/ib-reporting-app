import React, { createContext, ReactNode, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setAuthData } from '../store/slices/authSlice'

export interface User { id: string; email: string; firstName?: string; lastName?: string; role?: string; permissions?: string[] }

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  isFeatureEnabled: (feature: string) => boolean;
  license: any;
} | null>(null)

const API_BASE = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth'

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })
  const [loading, setLoading] = useState(true)
  const [license, setLicense] = useState<any>(null);
  const dispatch = useDispatch()

  const fetchProfile = useCallback(async (token: string) => {
    try {
      const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLicense = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/activation/status`);
      setLicense(res.data);
    } catch (err) {
      console.error('Failed to fetch license', err);
    }
  }, []);

  useEffect(() => {
    dispatch(setAuthData({
      user,
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    }))
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user, dispatch])

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
    fetchLicense();
  }, [fetchProfile, fetchLicense]);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_BASE}/login`, { email, password });
    if (res.data && res.data.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken || '');
      setUser(res.data.user);
    }
    return res.data;
  }

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }

  const isFeatureEnabled = (feature: string) => {
    if (!license || !license.activated) return false;
    return !!license.payload?.features?.[feature];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isFeatureEnabled, license }}>
      {children}
    </AuthContext.Provider>
  )
}
