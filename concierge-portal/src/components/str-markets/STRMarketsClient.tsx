'use client'

import { useState, useMemo, useTransition, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { MARKETS } from '@/constants/markets'

export type STRMarket = {
  id: number
  market: string
  agents: number
  added_by_name: string | null
  created_at: string
}

interface Props {
  initialMarkets: STRMarket[]
  isAdmin: boolean
}

export function STRMarketsClient({ initialMarkets, isAdmin }: Props) {
  const supabase = createClient()

  const [markets, setMarkets] = useState<STRMarket[]>(initialMarkets)
  const [liveMarkets, setLiveMarkets] = useState<STRMarket[]>([])

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // ─────────────────────────────
  // FETCH LIVE TABLE DATA
  // ─────────────────────────────
  async function fetchAllMarkets() {
    const { data, error } = await supabase
      .from('str_markets')
      .select('id, market, agents')
      .order('agents', { ascending: false })

    if (!error && data) {
      setLiveMarkets(data)
    }
  }

  useEffect(() => {
    fetchAllMarkets()
  }, [])

  // ─────────────────────────────
  // Suggestions
  // ─────────────────────────────
  const suggestions = useMemo(() => {
    if (!query) return []

    const q = query.toLowerCase()
    const existing = new Set(markets.map(m => m.market))

    return MARKETS
      .filter(m => m.toLowerCase().includes(q) && !existing.has(m))
      .slice(0, 8)
  }, [query, markets])

  // ─────────────────────────────
  // Filtered list
  // ─────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return markets

    return markets.filter(m =>
      m.market.toLowerCase().includes(search.toLowerCase())
    )
  }, [markets, search])

  function pickSuggestion(value: string) {
    setSelected(value)
    setQuery(value)
    setShowDropdown(false)
  }

  // ─────────────────────────────
  // ADD MARKET
  // ─────────────────────────────
  function handleAdd() {
    if (!selected) return

    setFormError('')
    setFormSuccess('')

    startTransition(async () => {
      const { data, error } = await supabase
        .from('str_markets')
        .insert([
          {
            market: selected,
            agents: 0,
          },
        ] as any)
        .select('*')
        .single()

      if (error) {
        setFormError(error.message)
        return
      }

      if (!data) {
        setFormError('No data returned')
        return
      }

      setMarkets(prev => [data, ...prev])
      setFormSuccess('Market added successfully')

      setQuery('')
      setSelected('')

      await fetchAllMarkets()
    })
  }

  // ─────────────────────────────
  // REMOVE MARKET
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
        <div className="mb-3 text-sm font-semibold">
          Add STR Market
        </div>

        <div className="relative">
          <input
            ref={inputRef}
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
            <div className="absolute z-10 w-full bg-white border mt-1 rounded">
              {suggestions.map(s => (
                <div
                  key={s}
                  onMouseDown={() => pickSuggestion(s)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {formError && (
          <p className="text-red-500 text-sm mt-2">{formError}</p>
        )}

        {formSuccess && (
          <p className="text-green-600 text-sm mt-2">{formSuccess}</p>
        )}

        <Button
          className="mt-3"
          onClick={handleAdd}
          disabled={!selected || isPending}
        >
          Add Market
        </Button>
      </Card>

      {/* LIST */}
      <Card>
        <div className="p-2 border-b">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter markets..."
            className="w-full border p-2 rounded"
          />
        </div>

        <ul>
          {filtered.map(m => (
            <li
              key={m.id}
              className="flex justify-between p-3 border-b"
            >
              <div>
                <p className="font-semibold">{m.market}</p>
                <p className="text-xs text-gray-500">
                  Agents: {m.agents ?? 0}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleRemove(m.id)}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* LIVE TABLE */}
      <Card>
        <div className="p-3 border-b font-semibold">
          Market Performance Table
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Market</th>
                <th className="text-left p-3">Agents</th>
              </tr>
            </thead>

            <tbody>
              {liveMarkets.map(m => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{m.market}</td>
                  <td className="p-3">{m.agents ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}