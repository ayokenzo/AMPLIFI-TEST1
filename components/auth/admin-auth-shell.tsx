import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'

/**
 * AdminAuthShell
 *
 * A dedicated wrapper for the admin login page. Deliberately styled differently
 * from the artist AuthShell to make the separation visually explicit — there
 * is no link back to the public landing page or the artist sign-up flow.
 */
export function AdminAuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      {/* Subtle radial highlight behind the card */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 flex items-center justify-center"
      >
        <div className="h-[520px] w-[520px] rounded-full bg-primary/6 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Admin badge */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/10">
            <ShieldCheck className="size-7" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Amplifi
            </p>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-black/40">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
              {subtitle}
            </p>
          </div>
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          This portal is restricted to authorised administrators only.
        </p>
      </div>
    </div>
  )
}
