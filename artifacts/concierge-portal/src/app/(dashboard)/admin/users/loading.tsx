import { Skeleton, SkeletonBadge, SkeletonAvatar } from '@/components/ui/Skeleton'

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <Skeleton className="h-10 flex-1 min-w-48" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-3 flex flex-col items-center gap-1.5">
              <Skeleton className="h-7 w-8" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left">
                  <Skeleton className="h-3 w-14" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <SkeletonAvatar />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><SkeletonBadge /></td>
                <td className="px-4 py-3"><SkeletonBadge /></td>
                <td className="px-4 py-3"><Skeleton className="h-3 w-24" /></td>
                <td className="px-4 py-3"><Skeleton className="h-7 w-16" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
