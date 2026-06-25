import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Check your email"
      subtitle="We sent you a confirmation link. Click it to verify your email, then log in to start uploading."
    >
      <Button asChild className="w-full">
        <Link href="/auth/login">Go to login</Link>
      </Button>
    </AuthShell>
  )
}
