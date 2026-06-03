'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/helpers'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/lib/auth/actions'

export async function addSTRMarketAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const market = (formData.get('market') as string | null)?.trim()
  const notes  = (formData.get('notes')  as string | null)?.trim() ?? null

  if (!market) return { error: 'Please select a market.' }

  const user     = await getAuthUser()
  if (!user)     return { error: 'You must be signed in.' }

  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('str_friendly_markets')
    .insert({ market, notes, added_by: user.id, added_by_name: user.full_name ?? user.email })

  if (error) {
    if (error.code === '23505') return { error: `"${market}" is already on the list.` }
    return { error: error.message }
  }

  revalidatePath('/str-markets')
  return { success: `"${market}" added to the list.` }
}

export async function removeSTRMarketAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id') as string | null
  if (!id) return { error: 'Missing market ID.' }

  const user     = await getAuthUser()
  if (!user)     return { error: 'You must be signed in.' }

  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('str_friendly_markets')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/str-markets')
  return { success: 'Market removed.' }
}
