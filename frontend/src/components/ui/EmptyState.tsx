import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { Button } from './Button'

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-100">
        <Icon size={26} className="text-slate-400" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        {description && (
          <p className="text-sm text-slate-500 max-w-xs">{description}</p>
        )}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
