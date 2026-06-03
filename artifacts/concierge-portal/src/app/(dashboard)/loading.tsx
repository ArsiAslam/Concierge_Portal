import { Skeleton } from '@/components/ui/Skeleton'

// Shown while the (dashboard) layout resolves getAuthUser()
export default function DashboardLayoutLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar skeleton */}
      <aside className="flex h-screen w-64 flex-col bg-navy-800">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <Skeleton className="h-8 w-8 bg-white/10" rounded="lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20 bg-white/10" />
            <Skeleton className="h-2.5 w-14 bg-white/10" />
          </div>
        </div>
        <div className="flex-1 px-2 py-4 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <Skeleton className="h-4 w-4 bg-white/10 flex-shrink-0" />
              <Skeleton className="h-3 bg-white/10" style={{ width: `${60 + (i % 3) * 20}px` }} />
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 p-3 flex items-center gap-3">
          <Skeleton className="h-8 w-8 bg-white/10 flex-shrink-0" rounded="full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-24 bg-white/10" />
            <Skeleton className="h-2.5 w-32 bg-white/10" />
          </div>
        </div>
      </aside>

      {/* Main area skeleton */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar skeleton */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-9 w-9" rounded="lg" />
            <Skeleton className="h-8 w-8" rounded="full" />
          </div>
        </header>
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 flex items-center gap-4 shadow-card">
                <Skeleton className="h-12 w-12" rounded="xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-12" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
