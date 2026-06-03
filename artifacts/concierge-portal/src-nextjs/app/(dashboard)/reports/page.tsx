import { getAuthUser, hasPermission } from '@/lib/auth/helpers'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { BarChart3 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reports' }

export default async function ReportsPage() {
  const user = await getAuthUser()
  if (!hasPermission(user, 'reports', 'read')) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Reports</h2>
        <p className="mt-0.5 text-sm text-slate-500">Analytics and insights for your portal</p>
      </div>
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
          <BarChart3 className="h-7 w-7 text-brand-600" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Reports Coming Soon</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Analytics and reporting features are being built. Check back in the next update.
        </p>
      </Card>
    </div>
  )
}
