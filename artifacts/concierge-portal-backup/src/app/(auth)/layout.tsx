import type { Metadata } from 'next'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = { title: 'Sign In' }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-navy-800 p-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white">Concierge Portal</h1>
          <p className="text-white/60 text-base leading-relaxed">
            Streamline operations, manage your team, and keep everything running smoothly — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'Supply Management', desc: 'Track inventory in real time' },
              { label: 'Role-based Access', desc: 'Granular permission control' },
              { label: 'Team Management', desc: 'Onboard and manage users' },
              { label: 'Analytics', desc: 'Data-driven insights' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="mt-0.5 text-xs text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Concierge Portal</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
