-- supabase/migrations/003_new_roles.sql
-- Add concierge, user, and partner roles

insert into public.roles (name, description, permissions)
values
  (
    'concierge',
    'Concierge staff with supply market management and reporting access',
    '{"supply_market": ["create", "read", "update"], "reports": ["read"], "users": ["read"]}'::jsonb
  ),
  (
    'user',
    'Standard user with read-only supply market access',
    '{"supply_market": ["read"]}'::jsonb
  ),
  (
    'partner',
    'External partner with read-only access',
    '{"supply_market": ["read"]}'::jsonb
  )
on conflict (name) do nothing;
