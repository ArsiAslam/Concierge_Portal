'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { Search, MapPin, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MARKETS } from '@/constants/markets'
import { cn } from '@/lib/utils/cn'

interface SearchResult {
  market: string
  count:  number
}

function extractRecords(data: unknown): unknown[] {
  if (!data || typeof data !== 'object') return []
  if (Array.isArray(data)) return data
  const d = data as Record<string, unknown>
  for (const key of ['businesses', 'data', 'results', 'items', 'records']) {
    if (Array.isArray(d[key])) return d[key] as unknown[]
  }
  return []
}

async function countAll(market: string): Promise<number> {
  let total = 0
  let page  = 1

  while (true) {
    const params = new URLSearchParams({
      market,
      vendor_type: 'Agent',
      page:        String(page),
      per_page:    '100',
    })
    const res  = await fetch(`/api/supply/search?${params}`)
    if (!res.ok) {
      const json = await res.json().catch(() => ({})) as Record<string, string>
      throw new Error(json.error ?? `API error ${res.status}`)
    }
    const records = extractRecords(await res.json())
    total += records.length
    if (records.length < 100) break
    page++
  }

  return total
}

export function MarketSearchClient() {
  const allMarkets = MARKETS

  const [query, setQuery]                     = useState('')
  const [selectedMarket, setSelectedMarket]   = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isPending, startTransition]          = useTransition()
  const [result, setResult]                   = useState<SearchResult | null>(null)
  const [error, setError]                     = useState('')

  const inputRef     = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = query.trim().length >= 1
    ? allMarkets.filter((m) => m.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function selectMarket(market: string) {
    setSelectedMarket(market)
    setQuery(market)
    setShowSuggestions(false)
  }

  function handleSearch() {
    const market = selectedMarket || query.trim()
    if (!market) return
    setResult(null)
    setError('')

    startTransition(async () => {
      try {
        const count = await countAll(market)
        setResult({ market, count })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      }
    })
  }

  function handleClear() {
    setQuery('')
    setSelectedMarket('')
    setResult(null)
    setError('')
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-4">

      {/* ── Search bar ── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <Search className="h-4 w-4 text-brand-600" />
          <h3 className="text-base font-semibold text-slate-900">Search Market</h3>
          <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
            {allMarkets.length} markets
          </span>
        </div>

        <div className="px-5 py-4">
          <div className="flex flex-wrap gap-3">

            {/* Input + autocomplete */}
            <div className="relative min-w-0 flex-1" ref={containerRef}>
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedMarket(''); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter')  { setShowSuggestions(false); handleSearch() }
                  if (e.key === 'Escape') setShowSuggestions(false)
                }}
                placeholder="City, State — e.g. Denver, CO"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {query && (
                <button onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600" aria-label="Clear">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  {suggestions.map((market) => (
                    <li key={market}>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); selectMarket(market) }}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-50',
                          selectedMarket === market && 'bg-brand-50 text-brand-700'
                        )}
                      >
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        <span>{market}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button variant="primary" loading={isPending} disabled={!query.trim()} onClick={() => { setShowSuggestions(false); handleSearch() }}>
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Result table ── */}
      {result && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Market</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Agents
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr className="bg-brand-50/40">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-500" />
                    <span className="font-semibold text-slate-900">{result.market}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="text-2xl font-bold tabular-nums text-brand-700">{result.count}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button onClick={() => setResult(null)} className="rounded p-1 text-slate-400 hover:text-slate-600" aria-label="Close">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
