import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://haiq-api.onrender.com/v1',
  withCredentials: true, // sends the refresh_token HttpOnly cookie automatically
})

// ─── Request interceptor: attach access token from memory ──────
api.interceptors.request.use(config => {
  // Token is stored in module-level memory by AuthContext (never localStorage)
  const token = window.__haiq_access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor: auto-refresh on 401 ─────────────────
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Only retry once, and only on 401 with code TOKEN_EXPIRED
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        // Store new token in memory
        window.__haiq_access_token = data.access_token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed — clear token and send user to login
        window.__haiq_access_token = null
        window.location.href = '/account'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
