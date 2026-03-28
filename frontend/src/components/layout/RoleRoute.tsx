import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

type Role = 'admin' | 'accountant' | 'cashier'

interface RoleRouteProps {
  children: React.ReactNode
  allowedRoles: Role[]
}

/**
 * Route guard that checks both authentication AND role.
 * If the user is not authenticated → redirect to /login.
 * If the user is authenticated but lacks the role → redirect to /dashboard.
 */
export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user || !allowedRoles.includes(user.role as Role)) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
