import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  /** When true the input renders as a password field with show/hide toggle */
  passwordToggle?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      passwordToggle = false,
      type = 'text',
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)

    const resolvedType =
      passwordToggle ? (showPassword ? 'text' : 'password') : type

    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={[
              'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
              'placeholder:text-slate-400 transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              error
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                : 'border-slate-300',
              leftIcon ? 'pl-9' : '',
              passwordToggle ? 'pr-10' : '',
              className,
            ].join(' ')}
            {...props}
          />
          {passwordToggle && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {hint && !error && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
