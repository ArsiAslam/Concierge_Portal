'use client'

import { useState, useMemo } from 'react'
import { Users, Landmark, TrendingUp, MapPin, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { AgentRow, LenderRow } from '@/app/(dashboard)/supply-market/page'

interface Props {
  agentData:  AgentRow[]
  lenderData: LenderRow[]
}

type Tab = 'agent' | 'lender'

const PAGE_SIZE = 15

export function SupplyMarketClient({ agentData, lenderData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('agent')
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [sortDir, setSortDir]     = useState<'desc' | 'asc'>('desc')

  const isAgent  = activeTab === 'agent'
  const allRows  = isAgent ? agentData : lenderData
  const countKey = isAgent ? 'agents' : 'lenders'

  const sortedRows = useMemo(() => {
    const copy = [...allRows]
    copy.sort((a, b) => {
      const diff = ((a as any)[countKey] as number) - ((b as any)[countKey] as number)
      return sortDir === 'desc' ? -diff : diff
    })
    return copy
  }, [allRows, countKey, sortDir])

  // reset page on tab/search/sort change
  const filtered = useMemo(() => {
    setPage(1)
    const q = search.trim().toLowerCase()
    return q
      ? sortedRows.filter((r) => r.market.toLowerCase().includes(q))
      : sortedRows
  }, [sortedRows, search])

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)
  const pageRows    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const maxCount    = Math.max(...allRows.map((r) => (r as any)[countKey] as number), 1)
  const totalCount  = allRows.reduce((sum, r) => sum + ((r as any)[countKey] as number), 0)

  // global rank always by descending count (rank 1 = highest), independent of sortDir
  const rankMap = useMemo(() => {
    const m = new Map<number, number>()
    const desc = [...allRows].sort(
      (a, b) => ((b as any)[countKey] as number) - ((a as any)[countKey] as number)
    )
    desc.forEach((r, i) => m.set(r.id, i + 1))
    return m
  }, [allRows, countKey])

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    setSearch('')
    setPage(1)
    setSortDir('desc')
  }

  return (
    <div className="space-y-4">

      {/* ── Segmented toggle ── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex rounded-xl border border-slate-200 bg-slate-100 p-1 gap-1">
          <span
            aria-hidden
            className={cn(
              'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm border border-slate-200',
              'transition-transform duration-200 ease-out',
              isAgent ? 'translate-x-0' : 'translate-x-[calc(100%+4px)]'
            )}
          />
          {([
            { key: 'agent'  as Tab, label: 'Agent Supply',  Icon: Users    },
            { key: 'lender' as Tab, label: 'Lender Supply', Icon: Landmark },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={cn(
                'relative z-10 flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors duration-150',
                activeTab === key ? 'text-brand-700' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          <span className="font-bold text-slate-800">{totalCount.toLocaleString()}</span>{' '}
          {isAgent ? 'agents' : 'lenders'} across{' '}
          <span className="font-bold text-slate-800">{allRows.length}</span> markets
        </span>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Markets',                              value: allRows.length,                                        Icon: MapPin,                      color: 'text-brand-600',   bg: 'bg-brand-50'   },
          { label: isAgent ? 'Total Agents' : 'Total Lenders',  value: totalCount.toLocaleString(),                           Icon: isAgent ? Users : Landmark,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg per Market',                             value: allRows.length ? (totalCount / allRows.length).toFixed(1) : '0', Icon: TrendingUp,       color: 'text-purple-600',  bg: 'bg-purple-50'  },
        ].map((card) => (
          <div key={card.label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-card">
            <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl', card.bg)}>
              <card.Icon className={cn('h-5 w-5', card.color)} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <p className="mt-0.5 text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">

        {/* Search toolbar */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search markets..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          {search && (
            <span className="text-xs text-slate-500">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-14 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">#</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Market</th>
              <th className="w-36 px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                <button
                  onClick={() => setSortDir((d) => d === 'desc' ? 'asc' : 'desc')}
                  className="inline-flex items-center gap-1 rounded hover:text-slate-700 transition-colors"
                >
                  {isAgent ? 'Agents' : 'Lenders'}
                  {sortDir === 'desc'
                    ? <ChevronDown className="h-3.5 w-3.5" />
                    : <ChevronUp   className="h-3.5 w-3.5" />
                  }
                </button>
              </th>
              <th className="w-64 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Distribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-500">No markets match &ldquo;{search}&rdquo;</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const count  = (row as any)[countKey] as number
                const pct    = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
                const rank   = rankMap.get(row.id) ?? 0
                const isTop  = rank === 1
                const isZero = count === 0

                return (
                  <tr key={row.id} className={cn('transition-colors hover:bg-slate-50/80', isTop && 'bg-brand-50/30')}>
                    {/* Rank */}
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        isTop    ? 'bg-brand-700 text-white'        :
                        rank === 2 ? 'bg-brand-100 text-brand-700'  :
                        rank === 3 ? 'bg-slate-200 text-slate-600'  :
                        isZero   ? 'text-slate-300'                 :
                                   'text-slate-400'
                      )}>
                        {rank}
                      </span>
                    </td>

                    {/* Market */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        <span className={cn('text-sm font-medium', isTop ? 'text-brand-800' : isZero ? 'text-slate-400' : 'text-slate-800')}>
                          {row.market}
                        </span>
                      </div>
                    </td>

                    {/* Count */}
                    <td className="px-5 py-3.5 text-right">
                      <span className={cn(
                        'text-sm font-bold tabular-nums',
                        isTop ? 'text-brand-700' : isZero ? 'text-slate-300' : 'text-slate-700'
                      )}>
                        {count}
                      </span>
                    </td>

                    {/* Bar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          {!isZero && (
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                isTop    ? 'bg-brand-600' :
                                rank <= 3 ? 'bg-brand-400' :
                                pct >= 50 ? 'bg-brand-300' :
                                            'bg-brand-200'
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          )}
                        </div>
                        <span className="w-9 text-right text-xs font-medium text-slate-400">
                          {isZero ? '—' : `${pct}%`}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* ── Pagination footer ── */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
            <p className="text-xs text-slate-500">
              Showing{' '}
              <span className="font-medium text-slate-700">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{' '}
              of <span className="font-medium text-slate-700">{filtered.length}</span> markets
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-md border text-xs font-medium transition-colors',
                        page === p
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Simple footer when no pagination */}
        {filtered.length <= PAGE_SIZE && filtered.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-xs text-slate-400">
              {filtered.length} market{filtered.length !== 1 ? 's' : ''} ·{' '}
              {isAgent ? 'Agent' : 'Lender'} supply data
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
