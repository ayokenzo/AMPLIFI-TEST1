import Link from 'next/link'
import { Check, CreditCard, Receipt, Sparkles, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getProfile } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StatCard } from '@/components/dashboard/stat-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { PLANS, getPlan, formatNaira } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default async function BillingPage() {
  const user = await requireUser()
  const supabase = await createClient()
  const profile = await getProfile()

  // Releases double as the invoice/payment history for per-release billing.
  const { data: releases } = await supabase
    .from('releases')
    .select('id, title, primary_artist, plan, price, payment_status, payment_ref, status, cover_url, created_at')
    .eq('artist_id', user.id)
    .order('created_at', { ascending: false })

  const releaseList = releases ?? []
  const currentPlan = getPlan(profile?.plan)

  const paidReleases = releaseList.filter((r) => r.payment_status === 'paid')
  const totalSpent = paidReleases.reduce((s, r) => s + Number(r.price ?? 0), 0)
  const outstanding = releaseList
    .filter((r) => r.payment_status !== 'paid' && r.status === 'awaiting_payment')
    .reduce((s, r) => s + Number(r.price ?? 0), 0)

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your plan, payment method, and invoice history.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Current plan"
          value={currentPlan.name}
          icon={Sparkles}
          hint={
            currentPlan.releaseFee > 0
              ? `${formatNaira(currentPlan.releaseFee)} per release`
              : 'Unlimited releases'
          }
        />
        <StatCard
          label="Total spent"
          value={formatNaira(totalSpent)}
          icon={Wallet}
          hint={`${paidReleases.length} paid invoice${paidReleases.length === 1 ? '' : 's'}`}
        />
        <StatCard
          label="Outstanding"
          value={formatNaira(outstanding)}
          icon={Receipt}
          hint={outstanding > 0 ? 'Awaiting payment' : 'All settled'}
        />
      </div>

      {/* Current plan summary */}
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{currentPlan.name} plan</h2>
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            </div>
            <p className="max-w-md text-sm text-muted-foreground text-pretty">
              {currentPlan.tagline}
            </p>
            <div className="mt-1 flex items-end gap-1">
              <span className="text-3xl font-semibold tracking-tight">
                {currentPlan.price === 0 ? 'Free' : formatNaira(currentPlan.price)}
              </span>
              {currentPlan.price > 0 && (
                <span className="pb-1 text-sm text-muted-foreground">/year</span>
              )}
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/#pricing">Compare plans</Link>
          </Button>
        </div>

        <Separator className="my-6" />

        <ul className="grid gap-3 sm:grid-cols-2">
          {currentPlan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Upgrade options */}
      <div>
        <h2 className="mb-4 font-semibold">Available plans</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan.id
            return (
              <Card
                key={plan.id}
                className={cn(
                  'flex flex-col p-6',
                  plan.highlighted && !isCurrent && 'border-primary',
                  isCurrent && 'border-primary bg-primary/5',
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {isCurrent ? (
                    <Badge className="text-xs">Current</Badge>
                  ) : plan.highlighted ? (
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-2xl font-semibold tracking-tight">
                    {plan.price === 0 ? 'Free' : formatNaira(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="pb-1 text-xs text-muted-foreground">/year</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.releaseFee > 0
                    ? `${formatNaira(plan.releaseFee)} per release`
                    : 'Unlimited releases included'}
                </p>
                {isCurrent ? (
                  <Button variant="outline" className="mt-5 w-full" disabled>
                    Your plan
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant={plan.highlighted ? 'default' : 'outline'}
                    className="mt-5 w-full"
                  >
                    <Link href="/#pricing">
                      {plan.price > currentPlan.price ? 'Upgrade' : 'Switch'}
                    </Link>
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Invoice history */}
      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold">Invoice history</h2>
            <p className="text-xs text-muted-foreground">
              Per-release distribution payments.
            </p>
          </div>
          <CreditCard className="size-5 text-muted-foreground" />
        </div>

        {releaseList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Receipt className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
            <Button asChild size="sm">
              <Link href="/dashboard/upload">Create your first release</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {releaseList.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="size-10 shrink-0 rounded-md bg-muted bg-cover bg-center"
                    style={
                      r.cover_url ? { backgroundImage: `url(${r.cover_url})` } : undefined
                    }
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                      {r.payment_ref ? ` \u00b7 ${r.payment_ref}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">
                    {formatNaira(Number(r.price ?? 0))}
                  </span>
                  {r.payment_status === 'paid' ? (
                    <Badge variant="default" className="text-xs">
                      Paid
                    </Badge>
                  ) : r.status === 'awaiting_payment' ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/releases/${r.id}/pay`}>Pay now</Link>
                    </Button>
                  ) : (
                    <StatusBadge status={r.status} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
