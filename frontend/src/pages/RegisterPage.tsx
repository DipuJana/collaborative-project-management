import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProjectFlowLogo } from '../components/logo'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../features/auth/useAuth'
import { ApiError } from '../services/apiClient'

// ─── Abstract Kanban preview (matches the register screenshot) ────────────────
function KanbanPreview() {
  const columns = [
    {
      label: 'TODO',
      dotColour: 'bg-slate-400',
      cards: [
        { priority: 'bg-yellow-300' },
        { priority: 'bg-rose-300' },
        { priority: 'bg-rose-200' },
      ],
    },
    {
      label: 'IN PROGRESS',
      dotColour: 'bg-indigo-500',
      cards: [
        { priority: 'bg-rose-300', active: true },
      ],
    },
    {
      label: 'DONE',
      dotColour: 'bg-green-500',
      cards: [
        { priority: 'bg-green-300', done: true },
      ],
    },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-4 w-full max-w-sm">
      {/* Window chrome dots */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        <div className="ml-auto flex items-center gap-1 text-[9px] text-slate-400">
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="2" width="5" height="5" rx="1" />
            <rect x="9" y="2" width="5" height="5" rx="1" />
            <rect x="2" y="9" width="5" height="5" rx="1" />
            <rect x="9" y="9" width="5" height="5" rx="1" />
          </svg>
          Active Sprint Workspace
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-2">
        {columns.map((col) => (
          <div key={col.label} className="flex flex-col gap-1.5">
            {/* Column header */}
            <div className="flex items-center gap-1 mb-1">
              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${col.dotColour}`} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                {col.label}
              </span>
            </div>

            {/* Abstract task cards */}
            {col.cards.map((card, ci) => (
              <div
                key={ci}
                className={`rounded-lg border p-2 ${
                  card.active
                    ? 'border-indigo-200 bg-indigo-50/40'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                {/* Priority stripe */}
                <div className={`h-1 w-6 rounded-full mb-2 ${card.priority}`} />
                {/* Skeleton lines */}
                <div className="h-1.5 w-full rounded-full bg-slate-200 mb-1" />
                <div className="h-1.5 w-3/4 rounded-full bg-slate-200" />
                {/* Assignee dot on active card */}
                {card.active && (
                  <div className="flex justify-end mt-2">
                    <span className="h-4 w-4 rounded-full bg-indigo-200" />
                  </div>
                )}
                {/* Done check */}
                {card.done && (
                  <div className="flex justify-end mt-2">
                    <span className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[9px]">
                      ✓
                    </span>
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
export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const next: Record<string, string> = {}

    if (!name.trim()) next.name = 'Full name is required.'
    if (!email.trim()) next.email = 'Work email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < 8)
      next.password = 'Password must be at least 8 characters.'
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.'
    else if (password !== confirmPassword)
      next.confirmPassword = 'Passwords do not match.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError('')

    if (!validate()) return

    setLoading(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      // Registration doesn't auto-login — redirect to login with success hint
      navigate('/login', {
        state: { registered: true },
        replace: true,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        // Field-level validation errors from backend
        if (err.details && err.details.length > 0) {
          const next: Record<string, string> = {}
          for (const d of err.details) {
            next[d.field] = d.message
          }
          setErrors(next)
        } else {
          setGlobalError(err.message)
        }
      } else {
        setGlobalError('Something went wrong. Please try again.')
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
            Build better projects<br />together.
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mb-10">
            Create a shared workspace, bring your team together, and keep
            every task moving forward.
          </p>

          {/* Abstract Kanban preview */}
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
                <h2 className="text-2xl font-bold text-slate-900">
                  Create your account
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Start organizing your projects and collaborating with your team.
                </p>
              </div>

              {/* Global error */}
              {globalError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {globalError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {/* Full Name */}
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((p) => ({ ...p, name: '' }))
                  }}
                  error={errors.name}
                  autoComplete="name"
                  autoFocus
                />

                {/* Work Email */}
                <Input
                  label="Work Email"
                  type="email"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }))
                  }}
                  error={errors.email}
                  autoComplete="email"
                />

                {/* Password */}
                <Input
                  label="Password"
                  type="password"
                  passwordToggle
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((p) => ({ ...p, password: '' }))
                  }}
                  error={errors.password}
                  hint="Use at least 8 characters."
                  autoComplete="new-password"
                />

                {/* Confirm Password */}
                <Input
                  label="Confirm Password"
                  type="password"
                  passwordToggle
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword)
                      setErrors((p) => ({ ...p, confirmPassword: '' }))
                  }}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full mt-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Account →
                </Button>
              </form>

              {/* Login link */}
              <p className="mt-5 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
