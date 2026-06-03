import { getAuthUser } from '@/lib/auth/helpers'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ShoppingCart, Package, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user    = await getAuthUser()
  const hour    = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {greeting}, {user?.full_name?.split(' ')[0] ?? 'there'} 👋
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Welcome to your concierge portal. More features are on the way.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: 'Supply Market', href: '/supply-market', icon: ShoppingCart, desc: 'Manage inventory' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100">
                <action.icon className="h-4 w-4 text-brand-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                <p className="text-xs text-slate-500">{action.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* Placeholder for future widgets */}
      <Card className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-8 w-8 text-slate-300" />
        <p className="mt-2 text-sm font-medium text-slate-600">Supply Market</p>
        <p className="mt-0.5 text-xs text-slate-400">Stats will appear here once set up</p>
      </Card>
    </div>
  )
}
