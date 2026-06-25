import Image from 'next/image'

const STEPS = [
  {
    n: '01',
    title: 'Upload your release',
    desc: 'Add your audio, cover art, and metadata. Single, EP, or full album.',
  },
  {
    n: '02',
    title: 'Pay & submit',
    desc: 'Choose a plan or pay a per-release fee securely with Paystack.',
  },
  {
    n: '03',
    title: 'Get reviewed',
    desc: 'Our team verifies your release meets store guidelines within 48 hours.',
  },
  {
    n: '04',
    title: 'Go live & earn',
    desc: 'Your music goes live worldwide and your earnings roll into your dashboard.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            From studio to streaming in four steps
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            A simple, transparent workflow built around how artists actually
            release music.
          </p>
          <div className="mt-8 flex flex-col gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4">
                <span className="font-mono text-sm font-semibold text-primary">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
            <Image
              src="/images/artist-female.png"
              alt="Amplifi analytics dashboard preview"
              width={720}
              height={540}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
