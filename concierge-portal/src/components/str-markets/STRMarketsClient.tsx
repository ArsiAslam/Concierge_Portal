'use client'

import { useState, useMemo, useTransition, useRef, useEffect, useCallback } from 'react'
import { Trash2, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { MARKETS } from '@/constants/markets'
import type { STRMarketRow } from '@/types/database'

export type STRMarket = STRMarketRow

interface Props {
  initialMarkets: STRMarket[]
  isAdmin: boolean
}

export function STRMarketsClient({ initialMarkets, isAdmin }: Props) {
  const supabase = createClient()

  // LOCAL + DB (keep add form separate)
  const [markets, setMarkets] = useState<STRMarket[]>(initialMarkets)

  // 🔥 SINGLE SOURCE OF TRUTH FOR TABLE
  const [liveMarkets, setLiveMarkets] = useState<STRMarket[]>([])

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // ✅ LIVE SEARCH
  const [liveSearchTerm, setLiveSearchTerm] = useState('')

  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ─────────────────────────────
  // 🔥 ALWAYS FETCH FULL DB ON LOAD
  // ─────────────────────────────
  const fetchAllMarkets = useCallback(async () => {
    const { data, error } = await supabase
      .from('str_markets')
      .select('id, market, agents')
      .order('agents', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setLiveMarkets(data as STRMarket[])
    }
  }, [supabase])

  useEffect(() => {
    fetchAllMarkets()
  }, [fetchAllMarkets])

  // ─────────────────────────────
  // CLICK OUTSIDE DROPDOWN
  // ─────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ─────────────────────────────
  // ADD SUGGESTIONS
  // ─────────────────────────────
  const suggestions = useMemo(() => {
    if (!query) return []

    const q = query.toLowerCase()
    const existing = new Set(markets.map(m => m.market.toLowerCase()))

    return MARKETS
      .filter(m => m.toLowerCase().includes(q))
      .slice(0, 10)
      .map(m => ({
        name: m,
        exists: existing.has(m.toLowerCase())
      }))
  }, [query, markets])

  function pickSuggestion(value: string) {
    setSelected(value)
    setQuery(value)
    setShowDropdown(false)
    setFormError('')
    setFormSuccess('')
  }

  // ─────────────────────────────
  // 🔥 FILTER LIVE TABLE (FIXED)
  // ─────────────────────────────
  const filteredLiveMarkets = useMemo(() => {
    if (!liveSearchTerm.trim()) return liveMarkets

    const term = liveSearchTerm.toLowerCase().trim()

    return liveMarkets.filter(m =>
      (m.market || '').toLowerCase().includes(term)
    )
  }, [liveMarkets, liveSearchTerm])

  // ─────────────────────────────
  // ADD MARKET
  // ─────────────────────────────
  function handleAdd() {
    if (!selected) return

    setFormError('')
    setFormSuccess('')

    startTransition(async () => {
      const { data: existing } = await supabase
        .from('str_markets')
        .select('id')
        .eq('market', selected)
        .maybeSingle()

      if (existing) {
        setFormError('Market already exists')
        return
      }

      const { data, error } = await supabase
        .from('str_markets')
        .insert({ market: selected, agents: 0 } as any)
        .select()
        .single()

      if (error) {
        setFormError(error.message)
        return
      }

      setMarkets(prev => [data, ...prev])

      setQuery('')
      setSelected('')

      // 🔥 REFRESH DB AFTER INSERT
      await fetchAllMarkets()
      setFormSuccess('Market added')
    })
  }

  // ─────────────────────────────
  // REMOVE
  // ─────────────────────────────
  function handleRemove(id: number) {
    startTransition(async () => {
      const { error } = await supabase
        .from('str_markets')
        .delete()
        .eq('id', id)

      if (error) {
        setFormError(error.message)
        return
      }

      setMarkets(prev => prev.filter(m => m.id !== id))
      await fetchAllMarkets()
    })
  }

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="space-y-5">

      {/* ADD MARKET */}
      <Card>
        <div className="mb-3 font-semibold">Add STR Market</div>

        <div className="relative" ref={dropdownRef}>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected('')
              setShowDropdown(true)
            }}
            placeholder="Search market..."
            className="w-full border p-2 rounded"
          />

          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border mt-1 rounded shadow max-h-60 overflow-auto">
              {suggestions.map(s => (
                <div
                  key={s.name}
                  onMouseDown={() => pickSuggestion(s.name)}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    s.exists ? 'opacity-50' : ''
                  }`}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <Button className="mt-3" onClick={handleAdd} disabled={!selected || isPending}>
          Add Market
        </Button>

        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        {formSuccess && <p className="text-green-600 text-sm">{formSuccess}</p>}
      </Card>

      {/* LIVE TABLE */}
      <Card>
        <div className="p-3 border-b font-semibold flex justify-between">
          <span>Market Performance Table</span>
          <span className="text-xs text-gray-500">
            {filteredLiveMarkets.length} / {liveMarkets.length}
          </span>
        </div>

        {/* SEARCH */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={liveSearchTerm}
              onChange={(e) => setLiveSearchTerm(e.target.value)}
              placeholder="Search live markets..."
              className="w-full border rounded pl-9 p-2"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3">Market</th>
                <th className="text-left p-3">Agents</th>
              </tr>
            </thead>

            <tbody>
              {filteredLiveMarkets.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={2}>
                    No markets found
                  </td>
                </tr>
              ) : (
                filteredLiveMarkets.map(m => (
                  <tr key={m.id} className="border-b">
                    <td className="p-3">{m.market}</td>
                    <td className="p-3">{m.agents ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}