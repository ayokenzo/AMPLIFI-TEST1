'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, ImageIcon } from 'lucide-react'
import { createRelease } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GENRES, RELEASE_TYPES, formatNaira } from '@/lib/constants'
import { FileUpload } from '@/components/dashboard/file-upload'
import type { UploadResult } from '@/lib/supabase/storage'
import { toast } from 'sonner'

export function UploadForm({ releaseFee }: { releaseFee: number }) {
  const [releaseType, setReleaseType] = useState('single')
  const [genre, setGenre] = useState('Afrobeats')
  const [explicit, setExplicit] = useState(false)
  const [tracks, setTracks] = useState<string[]>([''])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isSingle = releaseType === 'single'

  function updateTrack(i: number, value: string) {
    setTracks((prev) => prev.map((t, idx) => (idx === i ? value : t)))
  }

  function handleSubmit(formData: FormData) {
    formData.set('release_type', releaseType)
    formData.set('genre', genre)
    if (audioUrl) formData.set('audio_url', audioUrl)
    if (coverUrl) formData.set('cover_url', coverUrl)
    const titles = isSingle
      ? [String(formData.get('title') ?? '')]
      : tracks.filter(Boolean)
    formData.delete('track_title')
    titles.forEach((t) => formData.append('track_title', t))
    startTransition(async () => {
      try {
        await createRelease(formData)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Submission failed')
      }
    })
  }

  return (
    <form action={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card className="flex flex-col gap-5 p-6">
          <h2 className="font-semibold">Release details</h2>
          <div className="grid gap-2">
            <Label htmlFor="title">Release title</Label>
            <Input id="title" name="title" required placeholder="e.g. Night Drive" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="primary_artist">Primary artist</Label>
              <Input
                id="primary_artist"
                name="primary_artist"
                required
                placeholder="Artist name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="label">Record label (optional)</Label>
              <Input id="label" name="label" placeholder="Self-released" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Release type</Label>
              <Select value={releaseType} onValueChange={(v) => setReleaseType(v ?? 'single')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELEASE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Genre</Label>
              <Select value={genre} onValueChange={(v) => setGenre(v ?? 'Afrobeats')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="release_date">Release date</Label>
            <Input id="release_date" name="release_date" type="date" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Explicit content</p>
              <p className="text-xs text-muted-foreground">
                Mark if any track contains explicit lyrics.
              </p>
            </div>
            <Switch name="explicit" checked={explicit} onCheckedChange={setExplicit} />
          </div>
        </Card>

        {!isSingle && (
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Tracklist</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTracks((p) => [...p, ''])}
              >
                <Plus className="size-4" />
                Add track
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {tracks.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    {i + 1}
                  </span>
                  <Input
                    value={t}
                    onChange={(e) => updateTrack(i, e.target.value)}
                    placeholder={`Track ${i + 1} title`}
                  />
                  {tracks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setTracks((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="font-semibold">Cover art</h2>
          {/* Preview */}
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="Cover preview"
                className="size-full object-cover"
              />
            ) : (
              <ImageIcon className="size-10" />
            )}
          </div>
          {/* Local file picker for cover art (JPEG/PNG) */}
          <div className="grid gap-2">
            <Label>Upload cover image</Label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                // Show local preview immediately
                const objectUrl = URL.createObjectURL(file)
                setCoverPreview(objectUrl)
                // Upload and store the public URL
                import('@/lib/supabase/storage').then(({ uploadMediaFile }) => {
                  // Cover art goes into the audio bucket under covers/
                  // We use a direct supabase upload via a small wrapper
                  const supabase = (window as unknown as { __supabase?: unknown }).__supabase
                  void import('@/lib/supabase/client').then(async ({ createClient }) => {
                    const sb = createClient()
                    const path = `covers/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
                    const { error } = await sb.storage.from('covers').upload(path, file, {
                      cacheControl: '3600',
                      upsert: false,
                    })
                    if (!error) {
                      const { data } = sb.storage.from('covers').getPublicUrl(path)
                      setCoverUrl(data.publicUrl)
                    }
                  })
                })
              }}
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG or WebP &middot; 3000×3000 recommended.
            </p>
          </div>
        </Card>

        {/* Audio files */}
        <Card className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="font-semibold">Audio files</h2>
            <p className="text-xs text-muted-foreground">
              MP3, WAV or FLAC &middot; up to 500 MB each.
            </p>
          </div>
          <FileUpload
            accept="audio"
            folder={`releases/${Date.now()}`}
            onUpload={(result) => setAudioUrl(result.publicUrl)}
          />
          {audioUrl && (
            <p className="truncate text-xs text-primary">
              Audio ready: {audioUrl}
            </p>
          )}
        </Card>

        <Card className="flex flex-col gap-3 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Release fee</span>
            <span className="font-semibold">
              {releaseFee === 0 ? 'Included' : formatNaira(releaseFee)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-pretty">
            {releaseFee === 0
              ? 'Your plan includes unlimited releases. Submit for review at no extra cost.'
              : 'You will be taken to secure Paystack checkout to pay this fee before review.'}
          </p>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Submitting...' : 'Continue to payment'}
          </Button>
        </Card>
      </div>
    </form>
  )
}
