type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: boolean
}

export function Card({ padding = true, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        padding ? 'p-5' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['px-5 pt-5 pb-4 border-b border-slate-100', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['px-5 py-4', className].join(' ')} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['px-5 pb-5 pt-4 border-t border-slate-100', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
