'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getProfile } from '@/lib/auth'
import { getPlan } from '@/lib/constants'

export interface TrackInput {
  title: string
  explicit: boolean
}

export async function createRelease(formData: FormData) {
  const user = await requireUser()
  const supabase = await createClient()

  const title = String(formData.get('title') ?? '').trim()
  const primaryArtist = String(formData.get('primary_artist') ?? '').trim()
  const releaseType = String(formData.get('release_type') ?? 'single')
  const genre = String(formData.get('genre') ?? '')
  const label = String(formData.get('label') ?? '').trim() || null
  const coverUrl = String(formData.get('cover_url') ?? '').trim() || null
  const releaseDate = String(formData.get('release_date') ?? '') || null
  const explicit = formData.get('explicit') === 'on'
  const trackTitles = formData.getAll('track_title').map((t) => String(t).trim())

  if (!title || !primaryArtist) {
    throw new Error('Title and primary artist are required')
  }

  const { data: release, error } = await supabase
    .from('releases')
    .insert({
      artist_id: user.id,
      title,
      primary_artist: primaryArtist,
      release_type: releaseType,
      genre,
      label,
      cover_url: coverUrl,
      release_date: releaseDate,
      explicit,
      status: 'awaiting_payment',
    })
    .select()
    .single()

  if (error || !release) {
    throw new Error(error?.message ?? 'Could not create release')
  }

  const tracks = trackTitles
    .filter(Boolean)
    .map((t, i) => ({
      release_id: release.id,
      artist_id: user.id,
      title: t,
      track_number: i + 1,
      explicit,
    }))

  if (tracks.length > 0) {
    await supabase.from('tracks').insert(tracks)
  }

  revalidatePath('/dashboard/releases')
  redirect(`/dashboard/releases/${release.id}/pay`)
}

export async function deleteRelease(id: string) {
  const user = await requireUser()
  const supabase = await createClient()
  await supabase
    .from('releases')
    .delete()
    .eq('id', id)
    .eq('artist_id', user.id)
  revalidatePath('/dashboard/releases')
}

export async function getReleaseFee() {
  const profile = await getProfile()
  const plan = getPlan(profile?.plan)
  return plan.releaseFee
}
