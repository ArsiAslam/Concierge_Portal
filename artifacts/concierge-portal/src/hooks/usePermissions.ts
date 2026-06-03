'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PermissionsState {
  roles:       string[]
  permissions: Record<string, string[]>
  isAdmin:     boolean
  loading:     boolean
}

export function usePermissions(): PermissionsState {
  const [state, setState] = useState<PermissionsState>({
    roles:       [],
    permissions: {},
    isAdmin:     false,
    loading:     true,
  })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setState({ roles: [], permissions: {}, isAdmin: false, loading: false })
        return
      }

      const { data } = await supabase
        .from('user_roles')
        .select('roles(name, permissions)')
        .eq('user_id', user.id)

      const roles: string[] = []
      const permissions: Record<string, string[]> = {}

      for (const ur of data ?? []) {
        const role = (ur as any).roles
        if (role?.name) roles.push(role.name)
        const perms = role?.permissions as Record<string, string[]> | null
        if (perms) {
          for (const [res, actions] of Object.entries(perms)) {
            permissions[res] = [...(permissions[res] ?? []), ...actions]
          }
        }
      }

      setState({ roles, permissions, isAdmin: roles.includes('admin'), loading: false })
    }
    load()
  }, [])

  return state
}
