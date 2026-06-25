import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ReviewActions } from '@/components/admin/review-actions'
import { Disc3 } from 'lucide-react'

export default async function AdminReleasesPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: releases } = await supabase
    .from('releases')
    .select('id, title, primary_artist, release_type, genre, status, cover_url, created_at, artist_id')
    .order('created_at', { ascending: false })

  const releaseList = releases ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All Releases</h1>
        <p className="text-sm text-muted-foreground">
          Review and moderate artist submissions.
        </p>
      </div>

      {releaseList.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Disc3 className="size-6" />
          </span>
          <p className="text-muted-foreground">No releases submitted yet.</p>
        </Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {releaseList.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-12 shrink-0 rounded-lg bg-muted bg-cover bg-center"
                    style={
                      r.cover_url
                        ? { backgroundImage: `url(${r.cover_url})` }
                        : undefined
                    }
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.primary_artist} &middot; {r.release_type} &middot; {r.genre}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={r.status} />
                  {r.status === 'in_review' && (
                    <ReviewActions id={r.id} title={r.title} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
