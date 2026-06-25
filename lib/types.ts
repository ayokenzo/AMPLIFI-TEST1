export type ReleaseStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'submitted'
  | 'live'

export type PaymentStatus = 'unpaid' | 'paid'

export type Profile = {
  id: string
  full_name: string | null
  stage_name: string | null
  bio: string | null
  country: string | null
  role: 'artist' | 'admin'
  balance: number
  created_at: string
}

export type Release = {
  id: string
  artist_id: string
  title: string
  type: 'single' | 'ep' | 'album' | 'video'
  primary_artist: string | null
  featured_artists: string | null
  genre: string | null
  release_date: string | null
  artwork_url: string | null
  audio_url: string | null
  video_url: string | null
  isrc: string | null
  lyrics: string | null
  copyright: string | null
  plan: string
  price: number
  payment_status: PaymentStatus
  payment_ref: string | null
  status: ReleaseStatus
  review_note: string | null
  streams: number
  revenue: number
  created_at: string
}

export type Payout = {
  id: string
  artist_id: string
  amount: number
  method: string | null
  account_details: string | null
  status: 'pending' | 'paid' | 'rejected'
  requested_at: string
}
