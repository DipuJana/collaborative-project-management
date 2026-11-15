type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type AvatarProps = {
  name?: string
  src?: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-9 w-9 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-14 w-14 text-lg',
}

// Deterministic colour from name so the same person always gets the same colour
const BG_COLOURS = [
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-rose-500',
]

function colourFor(name = ''): string {
  const index = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % BG_COLOURS.length
  return BG_COLOURS[index]
}

function initials(name = ''): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-full flex-shrink-0',
        'font-semibold text-white select-none overflow-hidden',
        src ? 'bg-transparent' : colourFor(name),
        sizeClasses[size],
        className,
      ].join(' ')}
      title={name}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name ?? 'avatar'} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  )
}

// Avatar stack — overlapping row
type AvatarGroupProps = {
  names: string[]
  max?: number
  size?: AvatarSize
  srcs?: string[]
}

export function AvatarGroup({ names, srcs = [], max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = names.slice(0, max)
  const overflow = names.length - max

  return (
    <div className="flex items-center">
      {visible.map((name, i) => (
        <Avatar
          key={i}
          name={name}
          src={srcs[i]}
          size={size}
          className="-ml-2 first:ml-0 ring-2 ring-white"
        />
      ))}
      {overflow > 0 && (
        <span
          className={[
            '-ml-2 inline-flex items-center justify-center rounded-full',
            'bg-slate-200 text-slate-600 font-semibold ring-2 ring-white',
            sizeClasses[size],
            'text-xs',
          ].join(' ')}
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}
