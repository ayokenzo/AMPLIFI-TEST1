'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Music2,
  BarChart2,
  CreditCard,
  Upload,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/releases', label: 'Releases', icon: Music2, exact: false },
  { href: '/dashboard/upload', label: 'Upload', icon: Upload, exact: false },
  { href: '/dashboard/earnings', label: 'Earnings', icon: BarChart2, exact: false },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard, exact: false },
]

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary/15 font-medium text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        )
      })}

      {isAdmin && (
        <>
          <div className="my-2 border-t border-border" />
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-primary/15 font-medium text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <ShieldCheck className="size-4 shrink-0" />
            Admin Panel
          </Link>
        </>
      )}
    </nav>
  )
}
