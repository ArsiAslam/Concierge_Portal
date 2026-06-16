import { type NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/helpers'

const BP_BASE = 'https://biggerpockets.com'
const PARTNER_ID = process.env.BP_PARTNER_ID ?? 'bnbcalc'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const market = searchParams.get('market')?.trim()
  const vendorType = searchParams.get('vendor_type') ?? 'Agent'

  if (!market) {
    return NextResponse.json({ error: 'market is required' }, { status: 400 })
  }

  const perPage = 25
  let page = 1

  let allBusinesses: any[] = []

  try {
    while (true) {
      const url = new URL('/api/v3/pbbp/supply/businesses', BP_BASE)

      url.searchParams.set('market', market)
      url.searchParams.set('vendor_type', vendorType)
      url.searchParams.set('page', String(page))
      url.searchParams.set('per_page', String(perPage))

      const response = await fetch(url.toString(), {
        headers: {
          'X-BP-Partner-Id': PARTNER_ID,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        return NextResponse.json(
          {
            error: `Upstream ${response.status}: ${response.statusText}`,
            detail: text,
          },
          { status: response.status }
        )
      }

      const data: any = await response.json()

      // ✅ extract current page data
      const businesses = Array.isArray(data?.data) ? data.data : []

      if (businesses.length === 0) {
        break
      }

      allBusinesses = allBusinesses.concat(businesses)

      // ✅ pagination stop condition
      const totalPages = data?.total_pages ?? page

      if (page >= totalPages) {
        break
      }

      page++
    }

    // 🔥 FILTER PAUSED ON FULL DATASET
    const activeBusinesses = allBusinesses.filter((biz) => {
      const paused = biz?.business_paused

      const isPaused =
        paused === true ||
        paused === 'true' ||
        paused === 1

      return !isPaused
    })

    return NextResponse.json({
      market,
      vendor_type: vendorType,
      total_fetched: allBusinesses.length,
      active_count: activeBusinesses.length,
      data: activeBusinesses,
    })

  } catch (err) {
    console.error('Pagination error:', err)

    return NextResponse.json(
      { error: 'Failed to fetch all pages' },
      { status: 502 }
    )
  }
}