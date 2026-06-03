'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { loginAction, type ActionState } from '@/lib/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const initial: ActionState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} className="w-full mt-2">
      Sign in
    </Button>
  )
}

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, initial)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue</p>
      </div>

      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-brand-600 hover:text-brand-800 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-800 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
