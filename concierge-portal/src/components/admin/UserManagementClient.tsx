'use client'

import { useState, useTransition, useMemo } from 'react'
import { UserPlus, Search, UserCheck, UserX, Shield } from 'lucide-react'
import { createUserAction, assignRoleAction, type ActionState } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { ROLE_OPTIONS } from '@/constants/roles'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import type { UserRow } from '@/types/database'

interface Props {
  initialUsers: UserRow[]
  isAdmin:      boolean
}

const roleFilterOpts = [
  { value: '', label: 'All roles' },
  ...ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label })),
]

const roleSelectOpts = ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))

export function UserManagementClient({ initialUsers, isAdmin }: Props) {
  const [users, setUsers]               = useState<UserRow[]>(initialUsers)
  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState('')
  const [createOpen, setCreateOpen]     = useState(false)
  const [editOpen, setEditOpen]         = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [state, setState]               = useState<ActionState>({})
  const [newRole, setNewRole]           = useState('')
  const [isPending, startTransition]    = useTransition()
  const supabase                        = createClient()

  const filtered = useMemo(() => users.filter((u) => {
    const matchSearch = !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  }), [users, search, roleFilter])

  async function refreshUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active, created_at')
      .order('created_at', { ascending: false })
    if (data) setUsers(data as UserRow[])
  }

  async function handleCreateSubmit(formData: FormData) {
    setState({})
    startTransition(async () => {
      const result = await createUserAction({}, formData)
      setState(result)
      if (result.success) {
        setCreateOpen(false)
        await refreshUsers()
      }
    })
  }

  function openEditRole(user: UserRow) {
    setSelectedUser(user)
    setNewRole(user.role ?? '')
    setState({})
    setEditOpen(true)
  }

  async function handleRoleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser || !newRole) return
    const formData = new FormData()
    formData.set('user_id', selectedUser.id)
    formData.set('role', newRole)
    startTransition(async () => {
      const result = await assignRoleAction({}, formData)
      setState(result)
      if (!result.error) {
        await refreshUsers()
        setEditOpen(false)
      }
    })
  }

  async function toggleUserActive(user: UserRow) {
    startTransition(async () => {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id)
      if (!error) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      }
    })
  }

  return (
    <>
      <Card padding="none">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {roleFilterOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {isAdmin && (
            <Button size="sm" onClick={() => { setState({}); setCreateOpen(true) }}>
              <UserPlus className="h-4 w-4" /> Create User
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200">
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Active',      value: users.filter((u) => u.is_active).length },
            { label: 'Inactive',    value: users.filter((u) => !u.is_active).length },
          ].map((s) => (
            <div key={s.label} className="py-3 text-center">
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['User', 'Role', 'Status', 'Joined', ...(isAdmin ? ['Actions'] : [])].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="py-12 text-center text-sm text-slate-500">No users found</td>
                </tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white uppercase">
                        {(user.full_name ?? user.email)[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.full_name ?? '—'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.role ? (
                      <Badge variant={user.role as any}>{user.role}</Badge>
                    ) : (
                      <span className="text-xs text-slate-400">No role</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500" suppressHydrationWarning>
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditRole(user)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-blue-50 hover:text-brand-600 transition-colors"
                          title="Edit role"
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleUserActive(user)}
                          className={`rounded-md p-1.5 transition-colors ${user.is_active ? 'text-slate-400 hover:bg-red-50 hover:text-red-600' : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isAdmin && (
        <>
          <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New User" size="md">
            <form action={handleCreateSubmit} className="space-y-4">
              {state.error   && <div className="rounded-lg bg-red-50   px-3 py-2 text-sm text-red-700">{state.error}</div>}
              {state.success && <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</div>}
              <Input name="full_name" label="Full Name" required placeholder="Jane Smith" />
              <Input name="email"     label="Email Address" type="email" required placeholder="jane@example.com" />
              <Input name="password"  label="Temporary Password" type="password" required placeholder="Min 8 characters" helpText="User will be able to change this after first login" />
              <Select name="role" label="Assign Role" options={roleSelectOpts} placeholder="Select a role..." required />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" loading={isPending}><UserPlus className="h-4 w-4" /> Create User</Button>
              </div>
            </form>
          </Modal>

          <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit User Role" size="sm">
            <form onSubmit={handleRoleUpdate} className="space-y-4">
              {state.error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
              {selectedUser && (
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white uppercase">
                    {(selectedUser.full_name ?? selectedUser.email)[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{selectedUser.full_name}</p>
                    <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
              )}
              <Select
                label="New Role"
                options={roleSelectOpts}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Select role..."
                required
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" loading={isPending}>Update Role</Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </>
  )
}
