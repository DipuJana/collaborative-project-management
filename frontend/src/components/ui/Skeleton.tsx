// Skeleton — shimmer placeholder for loading states

type SkeletonProps = {
  className?: string
  rounded?: boolean
}

export function Skeleton({ className = '', rounded = false }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={[
        'animate-pulse bg-slate-200',
        rounded ? 'rounded-full' : 'rounded-md',
        className,
      ].join(' ')}
    />
  )
}

// Pre-built skeleton shapes
export function SkeletonText({ lines = 2, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={['flex flex-col gap-2', className].join(' ')}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={i === lines - 1 && lines > 1 ? 'h-3 w-3/4' : 'h-3 w-full'}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={[
        'bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4',
        className,
      ].join(' ')}
    >
      <Skeleton className="h-5 w-2/3" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-6" rounded />
        <Skeleton className="h-6 w-6" rounded />
        <Skeleton className="h-6 w-6" rounded />
      </div>
      <Skeleton className="h-1.5 w-full" />
    </div>
  )
}
