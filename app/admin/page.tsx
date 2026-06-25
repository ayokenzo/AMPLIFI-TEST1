import {
  Music2,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Wallet,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatNaira } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminOverviewPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [
    { data: releases },
    { data: profiles },
    { data: payouts },
    { data: earnings },
  ] = await Promise.all([
    supabase.from('releases').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('payouts').select('*').order('requested_at', { ascending: false }),
    supabase.from('earnings').select('amount, streams'),
  ])

  const releaseList = releases ?? []
  const profileList = profiles ?? []
  const payoutList = payouts ?? []
  const earningsList = earnings ?? []

  // Release counts
  const counts = {
    total: releaseList.length,
    in_review: releaseList.filter((r) => r.status === 'in_review').length,
    live: releaseList.filter((r) => r.status === 'live').length,
    rejected: releaseList.filter((r) => r.status === 'rejected').length,
  }

  // Financial totals
  const totalRevenue = earningsList.reduce((s, e) => s + Number(e.amount), 0)
  const totalStreams = earningsList.reduce((s, e) => s + Number(e.streams), 0)
  const pendingPayouts = payoutList
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + Number(p.amount), 0)

  // Recent sign-ups (last 5)
  const recentUsers = profileList.slice(0, 5)

  // Recent releases needing review
  const needsReview = releaseList.filter((r) => r.status === 'in_review').slice(0, 5)

  // Recent payout requests
  const pendingPayoutRows = payoutList.filter((p) => p.status === 'pending').slice(0, 5)

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">
          Live summary of all platform activity.
        </p>
      </div>

      {/* Release KPIs */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Releases
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total releases" value={counts.total} icon={Music2} />
          <KpiCard label="In review" value={counts.in_review} icon={Clock} />
          <KpiCard label="Live" value={counts.live} icon={CheckCircle2} />
          <KpiCard label="Rejected" value={counts.rejected} icon={XCircle} />
        </div>
      </section>

      {/* Financial KPIs */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Financials
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Total royalties paid"
            value={formatNaira(totalRevenue)}
            sub={`${totalStreams.toLocaleString()} streams`}
            icon={TrendingUp}
          />
          <KpiCard
            label="Total artists"
            value={profileList.length}
            sub="Registered accounts"
            icon={Users}
          />
          <KpiCard
            label="Pending payouts"
            value={formatNaira(pendingPayouts)}
            sub={`${payoutList.filter((p) => p.status === 'pending').length} requests`}
            icon={Wallet}
          />
        </div>
      </section>

      {/* Three-column activity panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Releases needing review */}
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Pending review</h3>
            {counts.in_review > 0 && (
              <Badge variant="secondary" className="text-xs">
                {counts.in_review}
              </Badge>
            )}
          </div>
          {needsReview.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No releases in queue.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {needsReview.map((r) => (
                <li key={r.id} className="px-4 py-3">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.primary_artist} &middot; {r.release_type ?? r.type}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent sign-ups */}
        <Card className="p-0">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Recent sign-ups</h3>
          </div>
          {recentUsers.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No users yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {(u.artist_name ?? u.full_name ?? '?')[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {u.artist_name ?? u.full_name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
                    {u.plan ?? 'free'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Pending payout requests */}
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Payout requests</h3>
            {pendingPayoutRows.length > 0 && (
              <AlertCircle className="size-4 text-amber-400" />
            )}
          </div>
          {pendingPayoutRows.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No pending payouts.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {pendingPayoutRows.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{formatNaira(Number(p.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.method ?? 'Bank transfer'} &middot;{' '}
                      {new Date(p.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    pending
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* All releases table */}
      <Card className="p-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">All releases</h2>
          <p className="text-xs text-muted-foreground">Most recent first.</p>
        </div>
        {releaseList.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No releases submitted yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-5 py-3 text-left font-medium">Title</th>
                  <th className="px-5 py-3 text-left font-medium">Artist</th>
                  <th className="hidden px-5 py-3 text-left font-medium md:table-cell">Type</th>
                  <th className="hidden px-5 py-3 text-left font-medium lg:table-cell">
                    Submitted
                  </th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {releaseList.slice(0, 20).map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="max-w-[180px] truncate px-5 py-3 font-medium">{r.title}</td>
                    <td className="max-w-[140px] truncate px-5 py-3 text-muted-foreground">
                      {r.primary_artist}
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">
                      {r.release_type ?? r.type ?? '—'}
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
