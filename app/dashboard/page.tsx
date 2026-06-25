import Link from 'next/link'
import { Disc3, Wallet, PlayCircle, Clock, UploadCloud } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getProfile } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatNaira, getPlan } from '@/lib/constants'

export default async function OverviewPage() {
  const user = await requireUser()
  const supabase = await createClient()
  const profile = await getProfile()

  const [{ data: releases }, { data: earnings }] = await Promise.all([
    supabase
      .from('releases')
      .select('*')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('earnings').select('amount, streams').eq('artist_id', user.id),
  ])

  const releaseList = releases ?? []
  const liveCount = releaseList.filter((r) => r.status === 'live').length
  const pendingCount = releaseList.filter((r) =>
    ['in_review', 'awaiting_payment'].includes(r.status),
  ).length
  const totalEarnings = (earnings ?? []).reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  )
  const totalStreams = (earnings ?? []).reduce(
    (sum, e) => sum + Number(e.streams),
    0,
  )
  const plan = getPlan(profile?.plan)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {profile?.artist_name ?? 'artist'}
          </h1>
          <p className="text-sm text-muted-foreground">
            You&apos;re on the{' '}
            <span className="text-foreground">{plan.name}</span> plan.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            <UploadCloud className="size-4" />
            New release
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total releases" value={String(releaseList.length)} icon={Disc3} />
        <StatCard label="Live on stores" value={String(liveCount)} icon={PlayCircle} />
        <StatCard label="In review" value={String(pendingCount)} icon={Clock} />
        <StatCard
          label="Total earnings"
          value={formatNaira(totalEarnings)}
          icon={Wallet}
          hint={`${totalStreams.toLocaleString()} streams`}
        />
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Recent releases</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/releases">View all</Link>
          </Button>
        </div>
        {releaseList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Disc3 className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t uploaded any releases yet.
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/upload">Upload your first release</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {releaseList.slice(0, 5).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-11 shrink-0 rounded-md bg-cover bg-center bg-muted"
                    style={
                      r.cover_url ? { backgroundImage: `url(${r.cover_url})` } : undefined
                    }
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.primary_artist} &middot; {r.release_type}
                    </p>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
