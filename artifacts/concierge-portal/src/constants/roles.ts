export const ROLES = {
  ADMIN:     'admin',
  MANAGER:   'manager',
  STAFF:     'staff',
  CONCIERGE: 'concierge',
  USER:      'user',
  PARTNER:   'partner',
} as const

export const PERMISSIONS = {
  SUPPLY_MARKET_CREATE: 'supply_market:create',
  SUPPLY_MARKET_READ:   'supply_market:read',
  SUPPLY_MARKET_UPDATE: 'supply_market:update',
  SUPPLY_MARKET_DELETE: 'supply_market:delete',
  USERS_CREATE:         'users:create',
  USERS_READ:           'users:read',
  USERS_UPDATE:         'users:update',
  USERS_DELETE:         'users:delete',
  ADMIN_ACCESS:         'admin:access',
  REPORTS_READ:         'reports:read',
} as const

export const ROLE_OPTIONS = [
  { value: 'admin',     label: 'Admin' },
  { value: 'concierge', label: 'Concierge' },
  { value: 'user',      label: 'User' },
  { value: 'partner',   label: 'Partner' },
] as const

export const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  admin:     { supply_market: ['create','read','update','delete'], users: ['create','read','update','delete'], reports: ['read'], admin: ['access'] },
  concierge: { supply_market: ['create','read','update'], reports: ['read'], users: ['read'] },
  user:      { supply_market: ['read'] },
  partner:   { supply_market: ['read'] },
  manager:   { supply_market: ['create','read','update'], reports: ['read'] },
  staff:     { supply_market: ['read'] },
}
