import { Bell, Search } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { AuthUser } from '@/types/auth'

interface TopBarProps {
  user:  AuthUser
  title: string
}

export function TopBar({ user, title }: TopBarProps) {
  const primaryRole = user.roles[0] as string | undefined

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Search trigger */}
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:bg-white">
          <Search className="h-4 w-4" />
          <span className="hidden sm:block">Search...</span>
          <kbd className="hidden rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold sm:block">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-600" />
        </button>

        {/* User pill */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white uppercase">
            {(user.full_name ?? user.email)[0]}
          </div>
          {primaryRole && (
            <Badge variant={primaryRole as any}>{primaryRole}</Badge>
          )}
        </div>
      </div>
    </header>
  )
}
