-- supabase/migrations/004_concierge_supply_rls.sql
-- Extend supply_items RLS policies to include the concierge role

drop policy if exists "Managers and admins can insert supply items" on public.supply_items;
drop policy if exists "Managers and admins can update supply items" on public.supply_items;

create policy "Managers, concierge and admins can insert supply items"
  on public.supply_items for insert with check (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid() and r.name in ('admin', 'manager', 'concierge')
    )
  );

create policy "Managers, concierge and admins can update supply items"
  on public.supply_items for update using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid() and r.name in ('admin', 'manager', 'concierge')
    )
  );
