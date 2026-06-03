import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Signed Out' }

export default function SignedOutPage() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900">You&apos;re signed out</h2>
      <p className="mt-2 text-sm text-slate-500">
        Your session has ended. Come back any time.
      </p>

      <Link
        href="/login"
        className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
      >
        Sign back in
      </Link>
    </div>
  )
}
