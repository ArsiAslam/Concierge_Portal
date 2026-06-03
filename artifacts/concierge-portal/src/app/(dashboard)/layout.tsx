import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/helpers'
import { Sidebar } from '@/components/navigation/Sidebar'
import { TopBar } from '@/components/navigation/TopBar'

// Page title map
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':      'Dashboard',
  '/supply-market':  'Supply Market',
  '/admin/users':    'User Management',
  '/admin/roles':    'Roles & Access',
  '/reports':        'Reports',
  '/settings':       'Settings',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBarWrapper user={user} />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// Server component workaround for dynamic title
import { headers } from 'next/headers'
import type { AuthUser } from '@/types/auth'

async function TopBarWrapper({ user }: { user: AuthUser }) {
  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') ?? '/dashboard'
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Portal'
  return <TopBar user={user} title={title} />
}
