import { createClient } from '@/lib/supabase/server'
import { SupplyMarketClient } from '@/components/supply-market/SupplyMarketClient'
import { MarketSearchClient } from '@/components/supply-market/MarketSearchClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Supply Market' }
export const dynamic = 'force-dynamic'

export type AgentRow  = { id: number; market: string; agents: number }
export type LenderRow = { id: number; market: string; lenders: number }

async function getAgentSupply(): Promise<AgentRow[]> {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('agent_supply')
    .select('id, market, agents')
    .order('agents', { ascending: false }) as { data: AgentRow[] | null }
  return data ?? []
}

async function getLenderSupply(): Promise<LenderRow[]> {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('lender_supply')
    .select('id, market, lenders')
    .order('lenders', { ascending: false }) as { data: LenderRow[] | null }
  return data ?? []
}

export default async function SupplyMarketPage() {
  const [agentData, lenderData] = await Promise.all([
    getAgentSupply(),
    getLenderSupply(),
  ])

  const markets = agentData.map((r) => r.market)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Supply Market</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Agent and lender availability across markets
        </p>
      </div>

      <MarketSearchClient markets={markets} />
      <SupplyMarketClient agentData={agentData} lenderData={lenderData} />
    </div>
  )
}
