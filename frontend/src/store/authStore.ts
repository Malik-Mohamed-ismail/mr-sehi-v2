import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  username:  string
  email:     string
  full_name: string
  role:      'admin' | 'accountant' | 'cashier'
}

interface AuthState {
  user:            AuthUser | null
  accessToken:     string | null
  isAuthenticated: boolean
  setAuth:         (user: AuthUser, token: string) => void
  setAccessToken:  (token: string) => void
  logout:          () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({ user, accessToken: token, isAuthenticated: true }),

      setAccessToken: (token) =>
        set({ accessToken: token }),

      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'mr-sehi-auth',
      // Persist both user and isAuthenticated so the session survives refresh
      // accessToken is intentionally NOT persisted (re-fetched silently on mount)
      partialize: (state) => ({
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
