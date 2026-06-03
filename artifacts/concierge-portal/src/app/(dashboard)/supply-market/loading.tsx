import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function SupplyMarketLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Toggle + label */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-72" rounded="xl" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-card">
            <Skeleton className="h-10 w-10 flex-shrink-0" rounded="xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        {/* Header row */}
        <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-16" />
          <div className="flex-1" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-24 ml-4" />
        </div>

        {/* Data rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-5 py-4">
            <Skeleton className="h-6 w-6 flex-shrink-0" rounded="full" />
            <div className="flex items-center gap-2 flex-1">
              <Skeleton className="h-3.5 w-3.5" rounded="sm" />
              <Skeleton className="h-4" style={{ width: `${120 + (i % 4) * 30}px` }} />
            </div>
            <Skeleton className="h-4 w-8 ml-auto" />
            <div className="flex items-center gap-3 w-64">
              <Skeleton className="h-2 flex-1" rounded="full" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  )
}
