import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function RolesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="space-y-4">
            {/* Card header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" rounded="lg" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-5 w-16" rounded="full" />
            </div>

            {/* Description */}
            <Skeleton className="h-4 w-full" />

            {/* Permissions label */}
            <Skeleton className="h-3 w-24" />

            {/* Permission blocks */}
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <div className="flex gap-1.5">
                    {Array.from({ length: 3 }).map((_, k) => (
                      <Skeleton key={k} className="h-4 w-14" rounded="full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}
