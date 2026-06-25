import { Wallet, TrendingUp, BarChart2, ArrowDownCircle, Music2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { StatCard } from '@/components/dashboard/stat-card'
import { formatNaira } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLATFORMS = [
  { name: 'Spotify', color: 'bg-[#1DB954]', share: 38 },
  { name: 'Apple Music', color: 'bg-pink-500', share: 27 },
  { name: 'YouTube Music', color: 'bg-red-500', share: 14 },
  { name: 'Boomplay', color: 'bg-orange-500', share: 12 },
  { name: 'Audiomack', color: 'bg-amber-500', share: 9 },
]

function formatStreamCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function getMonthLabel(monthsAgo: number) {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  return d.toLocaleString('default', { month: 'short', year: '2-digit' })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function EarningsPage() {
  const user = await requireUser()
  const supabase = await createClient()

  // Fetch all earnings rows for this artist
  const { data: earningsRows } = await supabase
    .from('earnings')
    .select('amount, streams, created_at, release_id')
    .eq('artist_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch payout history
  const { data: payouts } = await supabase
    .from('payouts')
    .select('*')
    .eq('artist_id', user.id)
    .order('requested_at', { ascending: false })

  // Fetch live releases (only live ones earn)
  const { data: releases } = await supabase
    .from('releases')
    .select('id, title, primary_artist, cover_url, streams, revenue')
    .eq('artist_id', user.id)
    .eq('status', 'live')
    .order('revenue', { ascending: false })

  const rows = earningsRows ?? []
  const payoutList = payouts ?? []
  const liveReleases = releases ?? []

  // Aggregate totals
  const totalEarnings = rows.reduce((s, r) => s + Number(r.amount), 0)
  const totalStreams = rows.reduce((s, r) => s + Number(r.streams), 0)
  const totalPaidOut = payoutList
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + Number(p.amount), 0)
  const pendingPayout = payoutList
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + Number(p.amount), 0)
  const availableBalance = totalEarnings - totalPaidOut - pendingPayout

  // Build a 6-month rolling summary from earnings rows
  const monthlyMap: Record<string, { amount: number; streams: number }> = {}
  for (let i = 5; i >= 0; i--) {
    monthlyMap[getMonthLabel(i)] = { amount: 0, streams: 0 }
  }
  rows.forEach((r) => {
    const label = new Date(r.created_at).toLocaleString('default', {
      month: 'short',
      year: '2-digit',
    })
    if (monthlyMap[label]) {
      monthlyMap[label].amount += Number(r.amount)
      monthlyMap[label].streams += Number(r.streams)
    }
  })
  const monthlyData = Object.entries(monthlyMap)
  const maxMonthlyAmount = Math.max(...monthlyData.map(([, v]) => v.amount), 1)

  // Threshold for requesting a payout (₦5,000 minimum)
  const PAYOUT_THRESHOLD = 5000
  const canRequestPayout = availableBalance >= PAYOUT_THRESHOLD

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Earnings</h1>
        <p className="text-sm text-muted-foreground">
          Your royalties, streams, and payout history.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total royalties"
          value={formatNaira(totalEarnings)}
          icon={Wallet}
          hint={`${formatStreamCount(totalStreams)} total streams`}
        />
        <StatCard
          label="Available balance"
          value={formatNaira(availableBalance)}
          icon={TrendingUp}
          hint={canRequestPayout ? 'Ready to withdraw' : `Min ${formatNaira(PAYOUT_THRESHOLD)}`}
        />
        <StatCard
          label="Paid out"
          value={formatNaira(totalPaidOut)}
          icon={ArrowDownCircle}
          hint={`${payoutList.filter((p) => p.status === 'paid').length} payouts completed`}
        />
        <StatCard
          label="Live releases"
          value={String(liveReleases.length)}
          icon={Music2}
          hint="Currently earning on stores"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Monthly royalties</h2>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <BarChart2 className="size-5 text-muted-foreground" />
          </div>
          {totalEarnings === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm text-muted-foreground">No earnings yet.</p>
              <p className="text-xs text-muted-foreground">
                Royalties appear here once your releases go live on stores.
              </p>
            </div>
          ) : (
            <div className="flex h-40 items-end gap-2">
              {monthlyData.map(([label, { amount }]) => {
                const pct = Math.round((amount / maxMonthlyAmount) * 100)
                return (
                  <div key={label} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="relative w-full">
                      {amount > 0 && (
                        <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1 py-0.5 text-[10px] text-background group-hover:block">
                          {formatNaira(amount)}
                        </span>
                      )}
                      <div
                        className="w-full rounded-t-sm bg-primary/80 transition-all"
                        style={{ height: `${Math.max(pct, amount > 0 ? 4 : 2)}%`, minHeight: 2 }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Platform breakdown */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Platform split</h2>
          {totalEarnings === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {PLATFORMS.map((p) => (
                <div key={p.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{p.share}%</span>
                  </div>
                  <Progress value={p.share} className="h-1.5" />
                </div>
              ))}
              <p className="mt-2 text-[11px] text-muted-foreground">
                Estimated split based on global streaming averages.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Top releases */}
      {liveReleases.length > 0 && (
        <Card className="p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">Top earning releases</h2>
          </div>
          <ul className="divide-y divide-border">
            {liveReleases.slice(0, 6).map((r, i) => (
              <li key={r.id} className="flex items-center gap-4 px-5 py-4">
                <span className="w-5 text-center text-sm font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <div
                  className="size-10 shrink-0 rounded-md bg-muted bg-cover bg-center"
                  style={r.cover_url ? { backgroundImage: `url(${r.cover_url})` } : undefined}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.primary_artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatNaira(Number(r.revenue ?? 0))}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatStreamCount(Number(r.streams ?? 0))} streams
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Payout section */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Payout request</h2>
            <p className="text-xs text-muted-foreground">
              Minimum withdrawal is {formatNaira(PAYOUT_THRESHOLD)}.
            </p>
          </div>
          <Badge
            variant={canRequestPayout ? 'default' : 'secondary'}
            className="text-xs"
          >
            {canRequestPayout ? 'Eligible' : 'Not yet eligible'}
          </Badge>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
          <span className="text-sm text-muted-foreground">Available to withdraw</span>
          <span className="text-lg font-semibold">{formatNaira(availableBalance)}</span>
        </div>

        {payoutList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payout history yet.</p>
        ) : (
          <div className="flex flex-col gap-0">
            {payoutList.slice(0, 5).map((p, i) => (
              <div key={p.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{formatNaira(Number(p.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.requested_at).toLocaleDateString()} &middot;{' '}
                      {p.method ?? 'Bank transfer'}
                    </p>
                  </div>
                  <Badge
                    variant={
                      p.status === 'paid'
                        ? 'default'
                        : p.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="text-xs capitalize"
                  >
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
