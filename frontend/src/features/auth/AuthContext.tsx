import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  login as loginService,
  register as registerService,
} from './auth.service'
import { clearToken, getToken } from '../../services/apiClient'
import type { LoginCredentials, RegisterCredentials, User } from './auth.types'

// ─── Shape ───────────────────────────────────────────────────────────────────

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' }

type AuthContextValue = {
  /** True while the initial token check is in flight */
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<User>
  logout: () => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  // On mount: if there's a token in sessionStorage we consider the session
  // valid and load the cached user. We don't re-hit /me here because the
  // backend /me only returns userId; the full user is returned on login and
  // stored in sessionStorage alongside the token.
  useEffect(() => {
    const token = getToken()
    const raw = sessionStorage.getItem('projectflow_user')

    if (token && raw) {
      try {
        const user = JSON.parse(raw) as User
        setState({ status: 'authenticated', user })
        return
      } catch {
        // malformed — fall through to unauthenticated
      }
    }

    setState({ status: 'unauthenticated' })
  }, [])

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    // loginService saves the token and returns the User
    const user = await loginService(credentials)
    sessionStorage.setItem('projectflow_user', JSON.stringify(user))
    setState({ status: 'authenticated', user })
  }, [])

  // ── register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (credentials: RegisterCredentials): Promise<User> => {
    // registerService does NOT log the user in automatically — the UI will
    // redirect to /login after success so the user can enter their password.
    const user = await registerService(credentials)
    return user
  }, [])

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearToken()
    sessionStorage.removeItem('projectflow_user')
    setState({ status: 'unauthenticated' })
  }, [])

  // ── derived flags ──────────────────────────────────────────────────────────
  const isLoading = state.status === 'loading'
  const isAuthenticated = state.status === 'authenticated'
  const user = state.status === 'authenticated' ? state.user : null

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
