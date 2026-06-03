import { redirect } from 'next/navigation'
import { getAuthUser, isAdmin } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Shield } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Roles & Access' }
export const dynamic = 'force-dynamic'

export default async function RolesPage() {
  const user = await getAuthUser()
  if (!isAdmin(user)) redirect('/dashboard')

  type RoleRow = { id: string; name: string; description: string | null; permissions: Record<string, string[]> }
  const supabase = await createClient()
  const { data: roles } = await (supabase as any)
    .from('roles')
    .select('id, name, description, permissions')
    .order('name') as { data: RoleRow[] | null }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Roles & Access</h2>
        <p className="mt-0.5 text-sm text-slate-500">Overview of system roles and their permissions</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(roles ?? []).map((role) => {
          const perms = role.permissions as Record<string, string[]>
          return (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100">
                    <Shield className="h-4 w-4 text-brand-700" />
                  </div>
                  <CardTitle>{role.name.charAt(0).toUpperCase() + role.name.slice(1)}</CardTitle>
                </div>
                <Badge variant={role.name as any}>{role.name}</Badge>
              </CardHeader>
              <p className="mb-4 text-sm text-slate-500">{role.description}</p>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Permissions</p>
                {Object.entries(perms).map(([resource, actions]) => (
                  <div key={resource} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="mb-1.5 text-xs font-medium text-slate-700 capitalize">{resource.replace('_', ' ')}</p>
                    <div className="flex flex-wrap gap-1">
                      {(actions as string[]).map((action) => (
                        <span key={action} className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
