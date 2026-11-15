// ProjectFlow logo — icon + wordmark

type ProjectFlowLogoProps = {
  /** Show icon only (no wordmark text) */
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const iconSize: Record<string, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

const textSize: Record<string, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

export function ProjectFlowLogo({
  iconOnly = false,
  size = 'md',
  className = '',
}: ProjectFlowLogoProps) {
  return (
    <span className={['inline-flex items-center gap-2.5 select-none', className].join(' ')}>
      {/* Square icon with layered chevrons */}
      <span
        className={[
          'inline-flex items-center justify-center rounded-xl',
          'bg-indigo-600 flex-shrink-0',
          iconSize[size],
        ].join(' ')}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[55%] h-[55%]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Three stacked horizontal bars representing project layers */}
          <rect x="2" y="4" width="20" height="3" rx="1.5" fill="white" opacity="0.4" />
          <rect x="2" y="10.5" width="14" height="3" rx="1.5" fill="white" opacity="0.7" />
          <rect x="2" y="17" width="8" height="3" rx="1.5" fill="white" />
        </svg>
      </span>

      {!iconOnly && (
        <span
          className={[
            'font-bold text-slate-900 tracking-tight',
            textSize[size],
          ].join(' ')}
        >
          ProjectFlow
        </span>
      )}
    </span>
  )
}
