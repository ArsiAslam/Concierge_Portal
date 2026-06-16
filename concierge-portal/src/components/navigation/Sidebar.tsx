'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { NAV_SECTIONS } from '@/constants/navigation'
import { logoutAction } from '@/lib/auth/actions'
import type { AuthUser } from '@/types/auth'

interface SidebarProps {
  user: AuthUser
}

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const canSee = (requiredPermission?: string) => {
    if (!requiredPermission) return true
    if (user.roles.includes('admin')) return true
    const [resource, action] = requiredPermission.split(':')
    return user.permissions[resource]?.includes(action) ?? false
  }

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col bg-navy-800 transition-all duration-300',
        'border-r border-navy-950/30 shadow-sidebar',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-white/10',
          collapsed ? 'justify-center px-2' : 'px-5 gap-3'
        )}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
          <Image
            src="/logo.png"
            alt="Concierge Logo"
            width={28}
            height={28}
            className="object-contain"
          />
        </div>

        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-none">
              Concierge
            </p>
            <p className="text-[10px] text-brand-300 uppercase tracking-wider">
              Portal
            </p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-[72px] z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-white shadow-md hover:bg-brand-800 transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_SECTIONS.map((section, si) => {
          const visibleItems = section.items.filter((item) =>
            canSee(item.requiredPermission)
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={si} className="mb-2">
              {section.title && !collapsed && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  {section.title}
                </p>
              )}

              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}

                    {!collapsed && item.badge && (
                      <span className="ml-auto rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div
        className={cn(
          'border-t border-white/10 p-3',
          collapsed ? 'flex justify-center' : ''
        )}
      >
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white uppercase">
              {(user.full_name ?? user.email)[0]}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user.full_name ?? 'User'}
              </p>
              <p className="truncate text-[10px] text-white/50">
                {user.email}
              </p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="text-white/50 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-white/50 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </aside>
  )
}