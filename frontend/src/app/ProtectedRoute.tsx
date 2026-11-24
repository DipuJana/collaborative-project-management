import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { LoadingState } from '../components/ui'

/**
 * Wraps any route that requires authentication.
 * - While the auth state is being determined → show a full-screen spinner.
 * - Unauthenticated → redirect to /login, preserving the intended destination.
 * - Authenticated → render the child route via <Outlet />.
 */
export function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Loading your workspace…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
