// AdminAuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import adminApi from '../services/adminApi'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin,   setAdmin]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('haiq_admin_token')
    const user  = localStorage.getItem('haiq_admin_user')
    if (token && user) {
      try { setAdmin(JSON.parse(user)) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await adminApi.post('/admin/auth/login', { email, password })
    localStorage.setItem('haiq_admin_token', data.access_token)
    localStorage.setItem('haiq_admin_user',  JSON.stringify(data.admin))
    setAdmin(data.admin)
    return data.admin
  }

  const logout = () => {
    localStorage.removeItem('haiq_admin_token')
    localStorage.removeItem('haiq_admin_user')
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
