// Badge — status pills, priority indicators, and role labels

type BadgeVariant =
  // Task status
  | 'todo'
  | 'in-progress'
  | 'done'
  // Task priority
  | 'high'
  | 'medium'
  | 'low'
  // Member role
  | 'owner'
  | 'admin'
  | 'member'
  // Generic
  | 'default'
  | 'purple'
  | 'green'
  | 'red'
  | 'yellow'
  | 'blue'

type BadgeSize = 'sm' | 'md'

type BadgeProps = {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  // Status
  todo: 'bg-slate-100 text-slate-600',
  'in-progress': 'bg-indigo-50 text-indigo-700',
  done: 'bg-green-50 text-green-700',
  // Priority
  high: 'bg-red-50 text-red-700',
  medium: 'bg-orange-50 text-orange-700',
  low: 'bg-slate-100 text-slate-600',
  // Role
  owner: 'bg-purple-50 text-purple-700',
  admin: 'bg-blue-50 text-blue-700',
  member: 'bg-slate-100 text-slate-600',
  // Generic
  default: 'bg-slate-100 text-slate-600',
  purple: 'bg-purple-50 text-purple-700',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  blue: 'bg-blue-50 text-blue-700',
}

const dotColour: Record<BadgeVariant, string> = {
  todo: 'bg-slate-400',
  'in-progress': 'bg-indigo-500',
  done: 'bg-green-500',
  high: 'bg-red-500',
  medium: 'bg-orange-500',
  low: 'bg-slate-400',
  owner: 'bg-purple-500',
  admin: 'bg-blue-500',
  member: 'bg-slate-400',
  default: 'bg-slate-400',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  children,
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={['inline-block h-1.5 w-1.5 rounded-full flex-shrink-0', dotColour[variant]].join(' ')}
        />
      )}
      {children}
    </span>
  )
}

// Convenience helpers
export function StatusBadge({ status }: { status: 'TODO' | 'IN_PROGRESS' | 'DONE' }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    TODO: { variant: 'todo', label: 'Todo' },
    IN_PROGRESS: { variant: 'in-progress', label: 'In Progress' },
    DONE: { variant: 'done', label: 'Done' },
  }
  const { variant, label } = map[status] ?? map.TODO
  return <Badge variant={variant}>{label}</Badge>
}

export function PriorityBadge({ priority }: { priority: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    HIGH: { variant: 'high', label: 'High' },
    MEDIUM: { variant: 'medium', label: 'Medium' },
    LOW: { variant: 'low', label: 'Low' },
  }
  const { variant, label } = map[priority] ?? map.MEDIUM
  return <Badge variant={variant}>{label}</Badge>
}

export function RoleBadge({ role }: { role: 'OWNER' | 'ADMIN' | 'MEMBER' }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    OWNER: { variant: 'owner', label: 'Owner' },
    ADMIN: { variant: 'admin', label: 'Admin' },
    MEMBER: { variant: 'member', label: 'Member' },
  }
  const { variant, label } = map[role] ?? map.MEMBER
  return <Badge variant={variant}>{label}</Badge>
}
