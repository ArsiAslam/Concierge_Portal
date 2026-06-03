-- supabase/migrations/005_profile_role_column.sql
-- Add denormalized role column to profiles for quick lookups

alter table public.profiles add column if not exists role text;

-- Backfill from existing user_roles assignments
update public.profiles p
set role = r.name
from public.user_roles ur
join public.roles r on ur.role_id = r.id
where ur.user_id = p.id;

-- Allow all authenticated users to view all profiles (needed for team member lists)
create policy "Authenticated users can view all profiles"
  on public.profiles for select using (auth.role() = 'authenticated');
