'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sanitizeEmail, sanitizeString } from '@/lib/utils/sanitize'
import { getAuthUser, isAdmin } from '@/lib/auth/helpers'
import { ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const signupSchema = z.object({
  full_name:        z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:            z.string().email('Invalid email address'),
  password:         z.string().min(8, 'Password must be at least 8 characters')
                     .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
                     .regex(/[0-9]/, 'Must contain at least one number'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

const createUserSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:     z.string().email('Invalid email address'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  role:      z.string().refine((r) => Object.values(ROLES).includes(r as any), 'Invalid role.'),
})

const assignRoleSchema = z.object({
  user_id: z.string().uuid('Invalid user ID.'),
  role:    z.string().refine((r) => Object.values(ROLES).includes(r as any), 'Invalid role.'),
})

export type ActionState = {
  error?: string
  success?: string
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email:    sanitizeEmail(formData.get('email')),
    password: String(formData.get('password') ?? ''),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: 'Invalid email or password' }

  redirect(ROUTES.DASHBOARD)
}

export async function signupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    full_name:        sanitizeString(formData.get('full_name')),
    email:            sanitizeEmail(formData.get('email')),
    password:         String(formData.get('password') ?? ''),
    confirm_password: String(formData.get('confirm_password') ?? ''),
  }

  const parsed = signupSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password: parsed.data.password,
    options:  { data: { full_name: parsed.data.full_name } },
  })

  if (error) return { error: error.message }
  return { success: 'Account created! Check your email to confirm.' }
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/signed-out')
}

export async function createUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const caller = await getAuthUser()
  if (!caller) return { error: 'Not authenticated.' }
  if (!isAdmin(caller)) return { error: 'Only admins can create users.' }

  const raw = {
    full_name: sanitizeString(formData.get('full_name')),
    email:     sanitizeEmail(formData.get('email')),
    password:  String(formData.get('password') ?? ''),
    role:      sanitizeString(formData.get('role')),
  }

  const parsed = createUserSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const service = await createServiceClient()

  const { data: newUser, error: createErr } = await service.auth.admin.createUser({
    email:         parsed.data.email,
    password:      parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  })

  if (createErr || !newUser.user) {
    return { error: createErr?.message ?? 'Failed to create user.' }
  }

  // Upsert profile with role (handle_new_user trigger may have already created it)
  const { error: profileErr } = await (service as any)
    .from('profiles')
    .upsert({
      id:        newUser.user.id,
      email:     parsed.data.email,
      full_name: parsed.data.full_name,
      role:      parsed.data.role,
    })

  if (profileErr) return { error: 'User created but profile update failed.' }

  return { success: `User ${parsed.data.email} created successfully.` }
}

export async function assignRoleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    user_id: sanitizeString(formData.get('user_id')),
    role:    sanitizeString(formData.get('role')),
  }

  const parsed = assignRoleSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const caller = await getAuthUser()
  if (!caller) return { error: 'Not authenticated.' }
  if (!isAdmin(caller)) return { error: 'Only admins can assign roles.' }

  const service = await createServiceClient()

  const { error } = await (service as any)
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.user_id)

  if (error) return { error: 'Failed to assign role.' }

  return { success: 'Role updated successfully.' }
}
