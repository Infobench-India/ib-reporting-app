import React, { createContext, ReactNode, useEffect, useState } from 'react'
import axios from 'axios'

export interface User { id: string; email: string; firstName?: string; lastName?: string; role?: string; permissions?: string[] }

export const AuthContext = createContext<{ user: User | null; login: (email: string, password: string)=>Promise<void>; logout: ()=>Promise<void> } | null>(null)

const API_BASE = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // try to fetch profile
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/profile`, { withCredentials: true })
        setUser(res.data.user)
      } catch (e) {
        setUser(null)
      }
    })()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_BASE}/login`, { email, password }, { withCredentials: true })
    if (res.data && res.data.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken)
      setUser(res.data.user)
    }
  }

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } })
    } finally {
      localStorage.removeItem('accessToken')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
