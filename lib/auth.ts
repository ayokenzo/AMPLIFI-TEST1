import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getSessionUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')
  return user
}

export async function getIsAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  // Check the role stored in user metadata (set at sign-up or via Supabase dashboard)
  const role = user.user_metadata?.role as string | undefined
  if (role === 'admin') return true
  // Also support a Supabase RPC if the project has one
  try {
    const { data, error } = await supabase.rpc('is_admin')
    if (!error) return Boolean(data)
  } catch {
    // RPC may not exist in all environments
  }
  return false
}

export async function requireAdmin() {
  const user = await requireUser()
  const isAdmin = await getIsAdmin()
  if (!isAdmin) redirect('/auth/admin-login')
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
}
