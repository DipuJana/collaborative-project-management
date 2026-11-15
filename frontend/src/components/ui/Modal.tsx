import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

type ModalSize = 'sm' | 'md' | 'lg'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: ModalSize
  children: React.ReactNode
  /** When true the user cannot close by clicking the backdrop */
  persistent?: boolean
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  persistent = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Trap focus & close on Escape
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !persistent) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose, persistent])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={persistent ? undefined : onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          'relative z-10 w-full bg-white rounded-2xl shadow-xl',
          'flex flex-col max-h-[90vh]',
          sizeClasses[size],
        ].join(' ')}
      >
        {/* Header */}
        {(title || !persistent) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
            <div className="flex flex-col gap-1">
              {title && (
                <h2 id="modal-title" className="text-base font-semibold text-slate-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-slate-500">{description}</p>
              )}
            </div>
            {!persistent && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors -mt-0.5 flex-shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto px-6 pb-6 flex flex-col gap-4">
          {children}
        </div>
      </div>
    </div>
  )
}
