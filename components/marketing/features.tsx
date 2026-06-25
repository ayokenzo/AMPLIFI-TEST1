import {
  Globe,
  LineChart,
  Wallet,
  ShieldCheck,
  Zap,
  Headphones,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Globe,
    title: 'Global distribution',
    desc: 'Reach Spotify, Apple Music, YouTube, Boomplay, Audiomack and 150+ more from one upload.',
  },
  {
    icon: Wallet,
    title: 'Keep your earnings',
    desc: 'Transparent royalties paid out in your currency. Pro and Label keep 100%.',
  },
  {
    icon: LineChart,
    title: 'Real-time analytics',
    desc: 'Track streams, revenue, and audience growth across every platform in one dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Human review',
    desc: 'Every release is checked by our team to ensure your metadata and audio meet store standards.',
  },
  {
    icon: Zap,
    title: 'Fast approvals',
    desc: 'Most releases are reviewed and sent to stores within 48 hours of submission.',
  },
  {
    icon: Headphones,
    title: 'Artist-first support',
    desc: 'Real people who understand the music industry, ready to help you grow.',
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Everything you need to release like a pro
        </h2>
        <p className="mt-3 text-muted-foreground text-pretty">
          From upload to payout, Amplifi handles the heavy lifting so you can
          focus on the music.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <span className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <f.icon className="size-5" />
            </span>
            <h3 className="mb-1.5 font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground text-pretty">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
