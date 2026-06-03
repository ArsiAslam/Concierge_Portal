import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  style?: React.CSSProperties
}

export function Skeleton({ className, rounded = 'md', style }: SkeletonProps) {
  const radii = { sm: 'rounded', md: 'rounded-lg', lg: 'rounded-xl', xl: 'rounded-2xl', full: 'rounded-full' }
  return (
    <div className={cn('skeleton-shimmer', radii[rounded], className)} style={style} />
  )
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-6 shadow-card', className)}>
      {children}
    </div>
  )
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' }
  return <Skeleton className={sizes[size]} rounded="full" />
}

export function SkeletonBadge() {
  return <Skeleton className="h-5 w-16" rounded="full" />
}

export function SkeletonButton({ wide }: { wide?: boolean }) {
  return <Skeleton className={cn('h-10', wide ? 'w-32' : 'w-24')} />
}

export function SkeletonTableRow({ cols }: { cols: number }) {
  const widths = ['w-48', 'w-32', 'w-24', 'w-28', 'w-36', 'w-20', 'w-16']
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={cn('h-4', widths[i % widths.length])} />
        </td>
      ))}
    </tr>
  )
}
