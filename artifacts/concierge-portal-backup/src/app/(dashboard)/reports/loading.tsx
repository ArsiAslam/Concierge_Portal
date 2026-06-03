import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      <SkeletonCard className="flex flex-col items-center justify-center py-16 gap-4">
        <Skeleton className="h-14 w-14" rounded="full" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-72" />
      </SkeletonCard>
    </div>
  )
}
