type ProgressBarProps = {
  value: number          // 0–100
  max?: number
  size?: 'sm' | 'md'
  colour?: 'indigo' | 'green' | 'orange' | 'purple'
  showLabel?: boolean
  className?: string
}

const colourClasses: Record<string, string> = {
  indigo: 'bg-indigo-600',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-600',
}

const heightClasses: Record<string, string> = {
  sm: 'h-1',
  md: 'h-1.5',
}

function colourFromValue(value: number): string {
  if (value >= 80) return 'green'
  if (value >= 50) return 'indigo'
  if (value >= 25) return 'orange'
  return 'orange'
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  colour,
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const resolvedColour = colour ?? colourFromValue(pct)

  return (
    <div className={['flex items-center gap-2', className].join(' ')}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={['flex-1 bg-slate-200 rounded-full overflow-hidden', heightClasses[size]].join(' ')}
      >
        <div
          className={['h-full rounded-full transition-all duration-500', colourClasses[resolvedColour]].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 w-9 text-right flex-shrink-0">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}
