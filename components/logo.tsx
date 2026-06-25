import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  href = '/',
}: {
  className?: string
  href?: string
}) {
  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2 font-heading', className)}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect x="3" y="9" width="2.6" height="6" rx="1.3" fill="currentColor" />
          <rect x="7.5" y="5" width="2.6" height="14" rx="1.3" fill="currentColor" />
          <rect x="12" y="2" width="2.6" height="20" rx="1.3" fill="currentColor" />
          <rect x="16.5" y="7" width="2.6" height="10" rx="1.3" fill="currentColor" />
          <rect x="21" y="10.5" width="2.6" height="3" rx="1.3" fill="currentColor" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Amplify
      </span>
    </Link>
  )
}
