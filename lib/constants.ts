export type PlanId = 'free' | 'pro' | 'label'

export interface Plan {
  id: PlanId
  name: string
  price: number // annual price in NGN
  tagline: string
  releaseFee: number // per-release fee in NGN (0 = included)
  features: string[]
  highlighted?: boolean
}

export const CURRENCY = 'NGN'

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    tagline: 'Test the waters and release your first single.',
    releaseFee: 5000,
    features: [
      'Distribute to 150+ stores',
      'Pay per release (₦5,000 each)',
      'Keep 85% of royalties',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25000,
    tagline: 'For active artists releasing all year round.',
    releaseFee: 0,
    highlighted: true,
    features: [
      'Unlimited releases included',
      'No per-release fees',
      'Keep 100% of royalties',
      'Advanced analytics & trends',
      'Spotify verified artist help',
      'Priority support',
    ],
  },
  {
    id: 'label',
    name: 'Label',
    price: 90000,
    tagline: 'Manage a roster of artists under one account.',
    releaseFee: 0,
    features: [
      'Everything in Pro',
      'Up to 25 artists',
      'Custom record label name',
      'Dedicated account manager',
      'Royalty splits & payouts',
      'API access',
    ],
  },
]

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

export function getReleaseFeeForPlan(id: string | null | undefined): number {
  return getPlan(id).releaseFee
}

export const GENRES = [
  'Afrobeats',
  'Amapiano',
  'Hip-Hop',
  'R&B',
  'Pop',
  'Gospel',
  'Electronic',
  'Reggae / Dancehall',
  'Rock',
  'Jazz',
  'Classical',
  'Other',
]

export const RELEASE_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'album', label: 'Album' },
]

export const STORES = [
  'Spotify',
  'Apple Music',
  'YouTube Music',
  'Amazon Music',
  'Audiomack',
  'Boomplay',
  'Tidal',
  'Deezer',
  'TikTok',
  'Instagram',
]

export const PLATFORMS = [
  'Spotify',
  'Apple Music',
  'YouTube Music',
  'Boomplay',
  'Audiomack',
]

export const STATUS_META: Record<
  string,
  { label: string; tone: 'muted' | 'warning' | 'success' | 'destructive' | 'info' }
> = {
  draft: { label: 'Draft', tone: 'muted' },
  awaiting_payment: { label: 'Awaiting Payment', tone: 'warning' },
  in_review: { label: 'In Review', tone: 'info' },
  approved: { label: 'Approved', tone: 'success' },
  live: { label: 'Live', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'destructive' },
}

export function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}
