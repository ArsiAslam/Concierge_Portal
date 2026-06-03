import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-center p-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 mb-6">
        <Building2 className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-6xl font-bold text-navy-800">404</h1>
      <p className="mt-3 text-lg font-medium text-slate-700">Page not found</p>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard" className="mt-8">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  )
}
