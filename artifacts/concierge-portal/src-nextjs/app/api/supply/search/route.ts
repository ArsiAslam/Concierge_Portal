import { type NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/helpers'

const BP_BASE    = 'https://biggerpockets.com'
const PARTNER_ID = process.env.BP_PARTNER_ID ?? 'bnbcalc'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const market     = searchParams.get('market')?.trim()
  const vendorType = searchParams.get('vendor_type') ?? 'Agent'
  const page       = searchParams.get('page') ?? '1'
  const perPage    = searchParams.get('per_page') ?? '25'

  if (!market) {
    return NextResponse.json({ error: 'market is required' }, { status: 400 })
  }

  try {
    const url = new URL('/api/v3/pbbp/supply/businesses', BP_BASE)
    url.searchParams.set('market',      market)
    url.searchParams.set('vendor_type', vendorType)
    url.searchParams.set('page',        page)
    url.searchParams.set('per_page',    perPage)

    const response = await fetch(url.toString(), {
      headers: {
        'X-BP-Partner-Id': PARTNER_ID,
        'Accept':          'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return NextResponse.json(
        { error: `Upstream ${response.status}: ${response.statusText}`, detail: text },
        { status: response.status }
      )
    }

    const data: unknown = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to reach BiggerPockets API' }, { status: 502 })
  }
}
