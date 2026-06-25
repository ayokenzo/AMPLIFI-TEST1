import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, BadgeCheck } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <BadgeCheck className="size-3.5 text-primary" />
            Trusted by 12,000+ independent artists
          </span>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-6xl">
            Get your music on every platform.{' '}
            <span className="text-primary">Keep your royalties.</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground text-pretty">
            Amplifi distributes your tracks to Spotify, Apple Music, and 150+
            stores worldwide. Upload, get approved, and start earning — no label
            required.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Start distributing
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#pricing">View pricing</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            <div>
              <span className="block text-2xl font-semibold text-foreground">150+</span>
              Stores & platforms
            </div>
            <div>
              <span className="block text-2xl font-semibold text-foreground">100%</span>
              Royalties on Pro
            </div>
            <div>
              <span className="block text-2xl font-semibold text-foreground">48h</span>
              Avg. review time
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
            <Image
              src="/images/hero-artist.png"
              alt="Independent artist in a recording studio"
              width={720}
              height={720}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
