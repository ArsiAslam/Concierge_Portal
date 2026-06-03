'use client'

import { useState, useTransition, useRef, useMemo } from 'react'
import { PlusCircle, Trash2, MapPin, Search, Home } from 'lucide-react'
import { addSTRMarketAction, removeSTRMarketAction } from '@/lib/str-markets/actions'
import { MARKETS } from '@/constants/markets'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export type STRMarket = {
  id: number
  market: string
  notes: string | null
  added_by_name: string | null
  created_at: string
}

interface Props {
  initialMarkets: STRMarket[]
  isAdmin: boolean
}

export function STRMarketsClient({ initialMarkets, isAdmin }: Props) {
  const [markets, setMarkets]        = useState<STRMarket[]>(initialMarkets)
  const [query, setQuery]            = useState('')
  const [selected, setSelected]      = useState('')
  const [notes, setNotes]            = useState('')
  const [showDropdown, setDropdown]  = useState(false)
  const [formError, setFormError]    = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [search, setSearch]          = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    const added = new Set(markets.map((m) => m.market))
    return MARKETS.filter((m) => m.toLowerCase().includes(q) && !added.has(m)).slice(0, 8)
  }, [query, markets])

  const filtered = useMemo(() => {
    if (!search) return markets
    const q = search.toLowerCase()
    return markets.filter((m) => m.market.toLowerCase().includes(q))
  }, [markets, search])

  function pickSuggestion(market: string) {
    setSelected(market)
    setQuery(market)
    setDropdown(false)
  }

  function handleAdd() {
    if (!selected) return
    setFormError('')
    setFormSuccess('')
    startTransition(async () => {
      const fd = new FormData()
      fd.set('market', selected)
      fd.set('notes', notes)
      const result = await addSTRMarketAction({}, fd)
      if (result.error) {
        setFormError(result.error)
      } else {
        setFormSuccess(result.success ?? 'Market added.')
        setQuery('')
        setSelected('')
        setNotes('')
      }
    })
  }

  function handleRemove(id: number) {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', String(id))
      await removeSTRMarketAction({}, fd)
      setMarkets((prev) => prev.filter((m) => m.id !== id))
    })
  }

  return (
    <div className="space-y-5">
      {/* ── Add market form ── */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-slate-800">Add a Market</h3>
        </div>

        <div className="space-y-3">
          {/* Autocomplete input */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Market name
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelected('')
                  setDropdown(true)
                  setFormSuccess('')
                }}
                onFocus={() => query && setDropdown(true)}
                onBlur={() => setTimeout(() => setDropdown(false), 150)}
                placeholder="Type to search markets…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                autoComplete="off"
              />
              {showDropdown && suggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  {suggestions.map((s) => (
                    <li
                      key={s}
                      onMouseDown={() => pickSuggestion(s)}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Notes <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Strong STR demand, low regulation…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{formError}</p>
          )}
          {formSuccess && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{formSuccess}</p>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!selected || isPending}
            loading={isPending}
          >
            <PlusCircle className="h-4 w-4" />
            Add to List
          </Button>
        </div>
      </Card>

      {/* ── Market list ── */}
      <Card padding="none">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter list…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <span className="shrink-0 text-xs text-slate-400">
            {filtered.length} market{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Home className="h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-600">
              {markets.length === 0 ? 'No markets added yet' : 'No markets match your search'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {markets.length === 0 ? 'Use the form above to add the first one.' : 'Try a different keyword.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((m) => (
              <li key={m.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <Home className="h-4 w-4 text-brand-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{m.market}</p>
                  {m.notes && (
                    <p className="mt-0.5 text-xs text-slate-500">{m.notes}</p>
                  )}
                  <p className="mt-1 text-[10px] text-slate-400">
                    Added by {m.added_by_name ?? 'unknown'} ·{' '}
                    {new Date(m.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
                    })}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleRemove(m.id)}
                    disabled={isPending}
                    className="shrink-0 rounded-md p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                    title="Remove market"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
