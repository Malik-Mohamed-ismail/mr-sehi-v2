import { useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000 // 1 hour

/**
 * Called once at app mount.
 * 1. Silently refreshes the access token using the HttpOnly refresh-token cookie.
 * 2. Tracks user activity and logs out after INACTIVITY_TIMEOUT_MS of no interaction.
 */
export function useAppBootstrap() {
  const { isAuthenticated, setAccessToken, logout } = useAuthStore()
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── 1. Silent token refresh on mount ───────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return

    const silentRefresh = async () => {
      try {
        const { data } = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        )
        const token = data?.data?.accessToken
        if (token) setAccessToken(token)
      } catch {
        // Refresh token is invalid/expired — log the user out cleanly
        logout()
        window.location.href = '/login'
      }
    }

    silentRefresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Inactivity logout ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return

    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      inactivityTimer.current = setTimeout(() => {
        logout()
        window.location.href = '/login'
      }, INACTIVITY_TIMEOUT_MS)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))

    // Start the timer immediately
    resetTimer()

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps
}
