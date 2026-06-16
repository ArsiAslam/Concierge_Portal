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
