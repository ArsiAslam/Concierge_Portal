export const ROUTES = {
  HOME:          '/',
  LOGIN:         '/login',
  SIGNUP:        '/signup',
  AUTH_CALLBACK: '/auth/callback',
  DASHBOARD:     '/dashboard',
  SUPPLY_MARKET: '/supply-market',
  ADMIN: {
    ROOT:  '/admin',
    USERS: '/admin/users',
    ROLES: '/admin/roles',
  },
} as const
