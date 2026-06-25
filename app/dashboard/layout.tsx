import Link from 'next/link'
import { AudioLines } from 'lucide-react'
import { requireUser, getIsAdmin, getProfile } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { UserMenu } from '@/components/dashboard/user-menu'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const [isAdmin, profile] = await Promise.all([getIsAdmin(), getProfile()])
  const name = profile?.artist_name ?? user.email?.split('@')[0] ?? 'Artist'

  return (
    <div className="min-h-svh">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col gap-6 border-b border-border p-4 lg:h-svh lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <AudioLines className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Amplifi</span>
          </Link>
          <DashboardNav isAdmin={isAdmin} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border px-4 lg:px-8">
            <span className="text-sm text-muted-foreground">Artist dashboard</span>
            <UserMenu name={name} email={user.email ?? ''} />
          </header>
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
