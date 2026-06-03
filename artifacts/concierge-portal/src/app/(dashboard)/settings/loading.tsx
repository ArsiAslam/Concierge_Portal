import { Skeleton, SkeletonCard, SkeletonAvatar, SkeletonBadge } from '@/components/ui/Skeleton'

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Profile card */}
      <SkeletonCard className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4" rounded="sm" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-1.5 mt-1">
              <SkeletonBadge />
            </div>
          </div>
        </div>
      </SkeletonCard>

      {/* Permissions card */}
      <SkeletonCard>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4" rounded="sm" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-14" rounded="full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Notifications card */}
      <SkeletonCard>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4" rounded="sm" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-4 w-56" />
      </SkeletonCard>
    </div>
  )
}
