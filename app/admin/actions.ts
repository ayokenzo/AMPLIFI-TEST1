'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function approveRelease(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('releases')
    .update({
      status: 'live',
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/admin/releases')
}

export async function rejectRelease(id: string, reason: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('releases')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/admin/releases')
}
