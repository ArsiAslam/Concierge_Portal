import { getAuthUser, isAdmin } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { UserManagementClient } from '@/components/admin/UserManagementClient'
import type { Metadata } from 'next'
import type { UserRow } from '@/types/database'

export const metadata: Metadata = { title: 'User Management' }
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const user  = await getAuthUser()
  const admin = isAdmin(user)

  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: false })

  const users: UserRow[] = (data ?? []) as UserRow[]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
        <p className="mt-0.5 text-sm text-slate-500">View team members and their roles</p>
      </div>
      <UserManagementClient initialUsers={users} isAdmin={admin} />
    </div>
  )
}
