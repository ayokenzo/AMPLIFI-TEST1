import Link from 'next/link'
import { AudioLines, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaFooter() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card px-6 py-16 text-center">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
            <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              Your next release is waiting
            </h2>
            <p className="text-muted-foreground text-pretty">
              Join thousands of independent artists distributing worldwide with
              Amplifi. Set up your account in minutes.
            </p>
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Create your account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <AudioLines className="size-4" />
            </span>
            <span className="font-semibold tracking-tight">Amplifi</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Amplifi Music Distribution. All
            rights reserved.{' '}
            {/* Hidden admin entry point — visually invisible but navigable */}
            <Link
              href="/auth/admin-login"
              aria-label="Admin"
              className="pointer-events-auto select-none opacity-0"
              tabIndex={-1}
            >
              &middot;
            </Link>
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/auth/login" className="hover:text-foreground">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
