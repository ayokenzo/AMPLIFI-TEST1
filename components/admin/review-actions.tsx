'use client'

import { useState, useTransition } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { approveRelease, rejectRelease } from '@/app/admin/actions'
import { toast } from 'sonner'

export function ReviewActions({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  function onApprove() {
    startTransition(async () => {
      try {
        await approveRelease(id)
        toast.success(`"${title}" approved and sent to stores`)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to approve')
      }
    })
  }

  function onReject() {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    startTransition(async () => {
      try {
        await rejectRelease(id, reason.trim())
        toast.success(`"${title}" rejected`)
        setOpen(false)
        setReason('')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to reject')
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={onApprove} disabled={isPending}>
        <Check className="size-4" />
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} disabled={isPending}>
        <X className="size-4" />
        Reject
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject release</DialogTitle>
            <DialogDescription>
              Let the artist know why &ldquo;{title}&rdquo; can&apos;t be
              approved. This will be shown on their dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="reason">Rejection reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Cover art resolution is too low (min 3000x3000px)."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onReject} disabled={isPending}>
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
