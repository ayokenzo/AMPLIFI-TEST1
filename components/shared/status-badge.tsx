import { Badge } from '@/components/ui/badge'
import { STATUS_META } from '@/lib/constants'
import { cn } from '@/lib/utils'

const TONE_CLASSES: Record<string, string> = {
  muted: 'bg-muted text-muted-foreground border-transparent',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  info: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  success: 'bg-primary/15 text-primary border-primary/25',
  destructive: 'bg-destructive/15 text-destructive border-destructive/25',
}

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, tone: 'muted' as const }
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', TONE_CLASSES[meta.tone])}
    >
      {meta.label}
    </Badge>
  )
}
