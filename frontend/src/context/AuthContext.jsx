// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'haiq_access_token'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        delete api.defaults.headers.common['Authorization']
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, user } = res.data

    localStorage.setItem(TOKEN_KEY, access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data)
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch (_) {}
    localStorage.removeItem(TOKEN_KEY)
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  const requestPasswordReset = useCallback(async (email) => {
    const res = await api.post('/auth/forgot-password', { email })
    return res.data
  }, [])

  const resetPassword = useCallback(async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', { token, new_password: newPassword })
    return res.data
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
      requestPasswordReset, resetPassword,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
