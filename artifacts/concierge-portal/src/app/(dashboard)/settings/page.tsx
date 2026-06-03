import { getAuthUser } from '@/lib/auth/helpers'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { User, Shield, Bell } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await getAuthUser()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="mt-0.5 text-sm text-slate-500">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand-600" />
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-xl font-bold text-white uppercase">
              {(user?.full_name ?? user?.email ?? 'U')[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user?.full_name ?? 'User'}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <div className="mt-1 flex gap-1">
                {user?.roles.map((r) => (
                  <Badge key={r} variant={r as any}>{r}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Access */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-600" />
              <CardTitle>Your Permissions</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-2">
            {Object.entries(user?.permissions ?? {}).map(([resource, actions]) => (
              <div key={resource} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700 capitalize">{resource.replace('_', ' ')}</span>
                <div className="flex gap-1">
                  {(actions as string[]).map((a) => (
                    <span key={a} className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-700">{a}</span>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(user?.permissions ?? {}).length === 0 && (
              <p className="text-sm text-slate-500">No explicit permissions assigned.</p>
            )}
          </div>
        </Card>

        {/* Notifications placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand-600" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <p className="text-sm text-slate-500">Notification preferences coming soon.</p>
        </Card>
      </div>

    </div>
  )
}
