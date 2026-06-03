import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Quick actions */}
      <SkeletonCard>
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3">
              <Skeleton className="h-8 w-8" rounded="lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Bottom cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCard key={i} className="flex flex-col items-center justify-center py-12 gap-3">
            <Skeleton className="h-8 w-8" rounded="full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}
