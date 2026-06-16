'use server'

import { createClient } from '@/lib/supabase/server'

export async function changePassword(password: string) {
  const supabase = await createClient()

  const { data: userData, error: userError } =
    await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: 'Session expired. Please login again.' }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}