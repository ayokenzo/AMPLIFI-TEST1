import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { requireAdmin, getProfile } from '@/lib/auth'
import { AdminNav } from '@/components/admin/admin-nav'
import { UserMenu } from '@/components/dashboard/user-menu'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()
  const profile = await getProfile()
  const name = profile?.artist_name ?? user.email?.split('@')[0] ?? 'Admin'

  return (
    <div className="min-h-svh">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col gap-6 border-b border-border p-4 lg:h-svh lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Amplifi Admin
            </span>
          </Link>
          <AdminNav />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border px-4 lg:px-8">
            <span className="text-sm text-muted-foreground">
              Review &amp; moderation
            </span>
            <UserMenu name={name} email={user.email ?? ''} />
          </header>
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
