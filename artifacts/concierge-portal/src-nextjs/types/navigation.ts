import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string | number
  requiredPermission?: string
  children?: Omit<NavItem, 'children'>[]
}

export interface NavSection {
  title?: string
  items: NavItem[]
}
