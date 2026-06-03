import { createClient } from '@/lib/supabase/server'
import { ROLE_PERMISSIONS } from '@/constants/roles'
import type { AuthUser } from '@/types/auth'

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single() as { data: { full_name: string | null; email: string; role: string | null } | null }

  const roleName = profile?.role ?? null
  const permissions = roleName ? (ROLE_PERMISSIONS[roleName] ?? {}) : {}

  return {
    id:          user.id,
    email:       profile?.email ?? user.email ?? '',
    full_name:   profile?.full_name ?? null,
    roles:       roleName ? [roleName] : [],
    permissions,
  }
}

export function hasPermission(
  user: AuthUser | null,
  resource: string,
  action: string
): boolean {
  if (!user) return false
  if (user.roles.includes('admin')) return true
  return user.permissions[resource]?.includes(action) ?? false
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.roles.includes('admin') ?? false
}
