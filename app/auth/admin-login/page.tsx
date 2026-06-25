'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { AdminAuthShell } from '@/components/auth/admin-auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

/**
 * Admin Login Page — /auth/admin-login
 *
 * This is a secondary, isolated authentication route that forces an 'admin'
 * role context. After a successful sign-in the client verifies the user has
 * the 'admin' role in their metadata. Non-admin credentials are rejected
 * immediately without redirecting to any artist-facing route.
 *
 * The route is intentionally not linked from the public landing page or the
 * artist dashboard to keep the admin portal separate.
 */
export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleAdminLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Step 1: Authenticate with Supabase
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password })

      if (signInError) throw signInError

      const user = signInData.user

      // Step 2: Enforce admin role — check user_metadata first (fastest, no extra round-trip)
      const metaRole = user?.user_metadata?.role as string | undefined
      let isAdmin = metaRole === 'admin'

      // Step 3: Fall back to the is_admin RPC if metadata check failed
      if (!isAdmin) {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin')
        if (!rpcError) isAdmin = Boolean(rpcResult)
      }

      if (!isAdmin) {
        // Sign the non-admin user back out immediately so no session persists
        await supabase.auth.signOut()
        throw new Error(
          'Access denied. This portal is for administrators only.',
        )
      }

      // Step 4: Admin confirmed — navigate to the admin dashboard
      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminAuthShell
      title="Administrator sign in"
      subtitle="Enter your admin credentials to access the moderation dashboard."
    >
      <form onSubmit={handleAdminLogin} className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@amplifi.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="mt-1 w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Verifying credentials…' : 'Sign in to Admin'}
        </Button>
      </form>
    </AdminAuthShell>
  )
}
