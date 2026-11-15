// Textarea component — consistent with Input styling

import { forwardRef } from 'react'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
            'placeholder:text-slate-400 transition-colors duration-150 resize-y min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            error
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
              : 'border-slate-300',
            className,
          ].join(' ')}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
