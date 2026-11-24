import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ProjectFlowLogo } from '../components/logo'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../features/auth/useAuth'
import { ApiError } from '../services/apiClient'

// ─── Mini Kanban preview (matches the login screenshot) ──────────────────────
function KanbanPreview() {
  const columns = [
    {
      label: 'TODO',
      count: '2',
      dotColour: 'bg-slate-400',
      tasks: ['Draft marketing email copy', 'Update pricing page'],
      priorities: ['bg-rose-300', 'bg-rose-300'],
    },
    {
      label: 'IN PROGRESS',
      count: '1',
      dotColour: 'bg-indigo-500',
      tasks: ['Implement new authentication flow'],
      priorities: ['bg-rose-300'],
      hasSubtask: true,
    },
    {
      label: 'DONE',
      count: '1',
      dotColour: 'bg-green-500',
      tasks: ['Design system audit'],
      priorities: ['bg-slate-300'],
      done: true,
    },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-4 w-full max-w-sm">
      {/* Project header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="text-sm font-semibold text-slate-800">Q4 Product Launch</span>
        </div>
        {/* Member avatars */}
        <div className="flex -space-x-2">
          {['bg-indigo-400', 'bg-teal-400', 'bg-rose-400'].map((c, i) => (
            <span
              key={i}
              className={`h-7 w-7 rounded-full ${c} ring-2 ring-white inline-block`}
            />
          ))}
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-2">
        {columns.map((col) => (
          <div key={col.label} className="flex flex-col gap-1.5">
            {/* Column header */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${col.dotColour}`} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate">
                {col.label}
              </span>
              <span className="text-[9px] text-slate-400 ml-auto">{col.count}</span>
            </div>

            {/* Task cards */}
            {col.tasks.map((task, ti) => (
              <div
                key={ti}
                className={`rounded-lg border p-2 ${
                  col.done
                    ? 'border-slate-100 bg-slate-50 opacity-70'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div
                  className={`h-1 w-8 rounded-full mb-1.5 ${col.priorities[ti] ?? 'bg-slate-200'}`}
                />
                <p
                  className={`text-[10px] leading-tight font-medium ${
                    col.done ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}
                >
                  {task}
                </p>
                {col.hasSubtask && ti === 0 && (
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[9px] text-slate-400">2/5</span>
                    <span className="h-4 w-4 rounded-full bg-teal-200" />
                  </div>
                )}
                {col.done && (
                  <div className="flex justify-end mt-1">
                    <span className="text-green-500 text-[10px]">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Redirect to where the user was trying to go, or dashboard
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
  // Show a success banner if the user just registered
  const justRegistered = !!(location.state as { registered?: boolean })?.registered

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }

    setLoading(true)
    try {
      await login({ email: email.trim(), password })
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left panel ────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col px-14 py-10 bg-slate-50">
        {/* Logo */}
        <Link to="/">
          <ProjectFlowLogo size="md" />
        </Link>

        {/* Hero copy */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
            Keep your team<br />moving forward.
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mb-10">
            Manage projects, organize tasks, collaborate with your team, and
            keep progress visible — all in one workspace.
          </p>

          {/* Kanban preview card */}
          <KanbanPreview />
        </div>
      </div>

      {/* ── Right panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo + back link */}
        <div className="flex items-center justify-between px-6 py-5 lg:px-10 lg:justify-end">
          <Link to="/" className="lg:hidden">
            <ProjectFlowLogo size="sm" />
          </Link>
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Log in to continue to your projects and team workspace.
                </p>
              </div>

              {/* Registration success message */}
              {justRegistered && !error && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                  Account created successfully! Please log in with your credentials.
                </div>
              )}

              {/* Global error */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {/* Email */}
                <Input
                  label="Email address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <span className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">
                      Forgot password?
                    </span>
                  </div>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    passwordToggle
                    autoComplete="current-password"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full mt-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Log In
                </Button>
              </form>

              {/* Register link */}
              <p className="mt-5 text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
