import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { LoadingState } from '../components/ui'

/**
 * Wraps public-only routes like /login and /register.
 * - While auth is loading → show a spinner (avoids flash of login page).
 * - Already authenticated → redirect straight to /dashboard.
 * - Not authenticated → render the child route via <Outlet />.
 */
export function PublicOnlyRoute() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Loading…" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
