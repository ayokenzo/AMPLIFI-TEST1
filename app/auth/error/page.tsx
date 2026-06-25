import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <AuthShell
      title="Authentication error"
      subtitle="Something went wrong while verifying your account. Please try logging in again."
    >
      <Button asChild className="w-full">
        <Link href="/auth/login">Back to login</Link>
      </Button>
    </AuthShell>
  )
}
