'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createUserAction, assignRoleAction } from '@/lib/auth/actions'
import type { ActionState } from '@/lib/auth/actions'
import { ROLE_OPTIONS } from '@/constants/roles'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { UserPlus, Edit2 } from 'lucide-react'
import type { UserRow } from '@/types/database'

interface Props {
  initialUsers: UserRow[]
  isAdmin:      boolean
}

const roleSelectOpts = ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))
const emptyForm      = { full_name: '', email: '', password: '', role: '' }

export function SettingsUserManagementClient({ initialUsers, isAdmin }: Props) {
  const [users, setUsers]             = useState<UserRow[]>(initialUsers)
  const [isPending, startTransition]  = useTransition()
  const [showAddModal, setShowAddModal] = useState(false)
  const [addState, setAddState]         = useState<ActionState>({})
  const [addForm, setAddForm]           = useState(emptyForm)
  const [editingUser, setEditingUser]   = useState<UserRow | null>(null)
  const [assignState, setAssignState]   = useState<ActionState>({})
  const [selectedRole, setSelectedRole] = useState('')

  const refreshUsers = async (): Promise<void> => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active, created_at')
      .order('created_at', { ascending: false })
    if (data) setUsers(data as UserRow[])
  }

  const handleAddUser = (): void => {
    const formData = new FormData()
    formData.set('full_name', addForm.full_name)
    formData.set('email',     addForm.email)
    formData.set('password',  addForm.password)
    formData.set('role',      addForm.role)
    startTransition(async () => {
      const result = await createUserAction({}, formData)
      setAddState(result)
      if (result.success) {
        setShowAddModal(false)
        setAddForm(emptyForm)
        await refreshUsers()
      }
    })
  }

  const handleAssignRole = (): void => {
    if (!editingUser || !selectedRole) return
    const formData = new FormData()
    formData.set('user_id', editingUser.id)
    formData.set('role',    selectedRole)
    startTransition(async () => {
      const result = await assignRoleAction({}, formData)
      setAssignState(result)
      if (result.success) {
        setEditingUser(null)
        await refreshUsers()
      }
    })
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {users.length} user{users.length !== 1 ? 's' : ''}
        </p>
        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setAddState({}); setAddForm(emptyForm); setShowAddModal(true) }}
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              {isAdmin && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="bg-white transition-colors hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  {u.role ? (
                    <Badge variant={u.role as any}>{u.role}</Badge>
                  ) : (
                    <span className="text-xs text-slate-400">No role</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.is_active ? 'success' : 'default'}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setAssignState({}); setSelectedRole(u.role ?? ''); setEditingUser(u) }}
                      className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Change Role
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-sm text-slate-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={isAdmin && showAddModal} onClose={() => setShowAddModal(false)} title="Add New User">
        <div className="space-y-4">
          {addState.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{addState.error}</p>
          )}
          <Input label="Full Name" value={addForm.full_name} onChange={(e) => setAddForm((f) => ({ ...f, full_name: e.target.value }))} required />
          <Input label="Email" type="email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} required />
          <Input label="Temporary Password" type="password" value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} required />
          <Select label="Role" options={roleSelectOpts} placeholder="Select a role" value={addForm.role} onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={isPending}
              disabled={!addForm.full_name || !addForm.email || addForm.password.length < 8 || !addForm.role}
              onClick={handleAddUser}
            >
              Create User
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={isAdmin && !!editingUser} onClose={() => setEditingUser(null)} title="Change Role">
        {editingUser && (
          <div className="space-y-4">
            {assignState.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{assignState.error}</p>
            )}
            <p className="text-sm text-slate-600">
              Updating role for <span className="font-medium text-slate-900">{editingUser.full_name ?? editingUser.email}</span>
            </p>
            <Select label="New Role" options={roleSelectOpts} placeholder="Select a role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} required />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button variant="primary" loading={isPending} disabled={!selectedRole} onClick={handleAssignRole}>Save Role</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
