'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { signupAction, type ActionState } from '@/lib/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const initial: ActionState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} className="w-full mt-2">
      Create account
    </Button>
  )
}

export default function SignupPage() {
  const [state, action] = useFormState(signupAction, initial)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
        <p className="mt-1 text-sm text-slate-500">Get started with your concierge portal</p>
      </div>

      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </div>
      )}

      <form action={action} className="space-y-4">
        <Input
          label="Full name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          placeholder="Jane Smith"
        />
        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          helpText="At least 8 characters with one uppercase letter and one number"
        />
        <Input
          label="Confirm password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
        />

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-800 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
