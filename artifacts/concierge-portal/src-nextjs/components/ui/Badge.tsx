import { cn } from '@/lib/utils/cn'

const variants = {
  default:   'bg-slate-100 text-slate-700',
  primary:   'bg-brand-100 text-brand-800',
  success:   'bg-emerald-100 text-emerald-800',
  warning:   'bg-amber-100 text-amber-800',
  danger:    'bg-red-100 text-red-800',
  admin:     'bg-purple-100 text-purple-800',
  manager:   'bg-blue-100 text-blue-800',
  staff:     'bg-slate-100 text-slate-700',
  concierge: 'bg-teal-100 text-teal-800',
  user:      'bg-sky-100 text-sky-800',
  partner:   'bg-violet-100 text-violet-800',
}

interface BadgeProps {
  children:  React.ReactNode
  variant?:  keyof typeof variants
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
