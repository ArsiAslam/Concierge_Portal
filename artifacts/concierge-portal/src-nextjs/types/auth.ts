export interface AuthUser {
  id: string
  email: string
  full_name: string | null
  roles: string[]
  permissions: Record<string, string[]>
}

export interface LoginSchema {
  email: string
  password: string
}

export interface SignupSchema {
  full_name: string
  email: string
  password: string
  confirm_password: string
}

export type RoleName = 'admin' | 'manager' | 'staff' | 'concierge' | 'user' | 'partner'
