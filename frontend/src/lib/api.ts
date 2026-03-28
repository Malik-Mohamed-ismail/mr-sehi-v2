import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL:         '/api/v1',
  withCredentials: true,   // required for HttpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — inject access token + CSRF header ──────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`

  // CSRF double-submit: read the `csrf-token` cookie set by the server on login
  if (['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
    const csrf = document.cookie
      .split('; ')
      .find(c => c.startsWith('csrf-token='))
      ?.split('=')[1]
    if (csrf) config.headers['X-CSRFToken'] = csrf
  }
  return config
})

// ── Response interceptor — auto-refresh on 401 ────────────────────────────
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: any) => void }> = []

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token!))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry  = true
      isRefreshing     = true
      try {
        const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
        const newToken  = data.data.accessToken
        useAuthStore.getState().setAccessToken(newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (err) {
        processQueue(err)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)
