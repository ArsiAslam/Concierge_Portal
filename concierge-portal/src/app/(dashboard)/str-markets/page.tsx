import { createClient } from '@/lib/supabase/server'
import { getAuthUser, isAdmin } from '@/lib/auth/helpers'
import { STRMarketsClient, type STRMarket } from '@/components/str-markets/STRMarketsClient'
import { Home, Terminal } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'STR Friendly Markets' }
export const dynamic = 'force-dynamic'

const SETUP_SQL = `-- Run this once in your Supabase SQL editor
create table if not exists str_friendly_markets (
  id            bigint generated always as identity primary key,
  market        text not null unique,
  notes         text,
  added_by      uuid references auth.users(id) on delete set null,
  added_by_name text,
  created_at    timestamptz default now() not null
);

alter table str_friendly_markets enable row level security;

create policy "Authenticated users can read"
  on str_friendly_markets for select to authenticated using (true);

create policy "Authenticated users can insert"
  on str_friendly_markets for insert to authenticated with check (true);

create policy "Authenticated users can delete"
  on str_friendly_markets for delete to authenticated using (true);`

async function getSTRMarkets(): Promise<{ data: STRMarket[] | null; needsSetup: boolean }> {
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase as any)
      .from('str_friendly_markets')
      .select('id, market, notes, added_by_name, created_at')
      .order('created_at', { ascending: false }) as { data: STRMarket[] | null; error: any }

    if (error) {
      if (error.code === '42P01') return { data: null, needsSetup: true }
      return { data: [], needsSetup: false }
    }
    return { data: data ?? [], needsSetup: false }
  } catch {
    return { data: null, needsSetup: true }
  }
}

export default async function STRMarketsPage() {
  const [{ data, needsSetup }, user] = await Promise.all([
    getSTRMarkets(),
    getAuthUser(),
  ])
  const admin = isAdmin(user)

  if (needsSetup) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">STR Friendly Markets</h2>
          <p className="mt-0.5 text-sm text-slate-500">Short-term rental friendly markets curated by your team</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Terminal className="h-5 w-5 text-amber-700" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-amber-900">One-time database setup required</h3>
              <p className="mt-1 text-xs text-amber-700">
                Run the following SQL in your{' '}
                <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline">
                  Supabase SQL Editor
                </a>{' '}
                to create the table, then refresh this page.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-amber-900/10 p-4 text-[11px] leading-relaxed text-amber-900 font-mono whitespace-pre">
                {SETUP_SQL}
              </pre>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">STR Friendly Markets</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Short-term rental friendly markets curated by your team
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5">
          <Home className="h-3.5 w-3.5 text-brand-600" />
          <span className="text-xs font-semibold text-brand-700">{data?.length ?? 0} markets</span>
        </div>
      </div>

      <STRMarketsClient initialMarkets={data ?? []} isAdmin={admin} />
    </div>
  )
}
