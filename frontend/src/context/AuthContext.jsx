import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

/**
 * AuthProvider manages:
 * - access_token stored in a module-level window variable (memory only — cleared on tab close)
 * - user object in React state for reactive UI updates
 * - login / logout / register actions that call the API
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      window.__haiq_access_token = data.access_token
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (fields) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/register', fields)
      return { success: true, message: data.message }
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (_) {
      // Silently ignore logout API errors
    } finally {
      window.__haiq_access_token = null
      setUser(null)
    }
  }, [])

  const fetchMe = useCallback(async () => {
    if (!window.__haiq_access_token) return
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch (_) {
      window.__haiq_access_token = null
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register, fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
