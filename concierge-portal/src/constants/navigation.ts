import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Home,
} from 'lucide-react'
import type { NavSection } from '@/types/navigation'
import { ROUTES } from './routes'

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href:  ROUTES.DASHBOARD,
        icon:  LayoutDashboard,
      },
      {
        label: 'Supply Market',
        href:  ROUTES.SUPPLY_MARKET,
        icon:  ShoppingCart,
      },
      {
        label: 'STR Friendly Markets',
        href:  '/str-markets',
        icon:  Home,
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        label:              'Reports',
        href:               '/reports',
        icon:               BarChart3,
        requiredPermission: 'reports:read',
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        label:              'User Management',
        href:               ROUTES.ADMIN.USERS,
        icon:               Users,
        requiredPermission: 'admin:access',
      },
      {
        label: 'Settings',
        href:  '/settings',
        icon:  Settings,
      },
    ],
  },
]
