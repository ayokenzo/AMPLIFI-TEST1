import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLANS, formatNaira } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Simple pricing for every stage
        </h2>
        <p className="mt-3 text-muted-foreground text-pretty">
          Start free and pay per release, or go unlimited. Cancel anytime.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'relative flex flex-col rounded-2xl border bg-card p-7',
              plan.highlighted
                ? 'border-primary shadow-[0_0_0_1px_var(--primary)]'
                : 'border-border',
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              {plan.tagline}
            </p>
            <div className="mt-5 flex items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight">
                {plan.price === 0 ? 'Free' : formatNaira(plan.price)}
              </span>
              {plan.price > 0 && (
                <span className="pb-1 text-sm text-muted-foreground">/year</span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {plan.releaseFee > 0
                ? `${formatNaira(plan.releaseFee)} per release`
                : 'Unlimited releases included'}
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-7 w-full"
              variant={plan.highlighted ? 'default' : 'outline'}
            >
              <Link href={`/auth/sign-up?plan=${plan.id}`}>
                {plan.price === 0 ? 'Start for free' : `Choose ${plan.name}`}
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
