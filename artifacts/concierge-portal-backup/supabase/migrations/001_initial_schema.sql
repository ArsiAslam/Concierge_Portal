-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text,
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Roles table
create table public.roles (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null unique,
  description text,
  permissions jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- User roles junction table
create table public.user_roles (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role_id     uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz not null default now(),
  unique(user_id, role_id)
);

-- Supply market table
create table public.supply_items (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  category    text not null,
  quantity    integer not null default 0,
  unit        text not null default 'pcs',
  unit_price  numeric(10,2) not null default 0,
  supplier    text,
  status      text not null default 'available' check (status in ('available','low_stock','out_of_stock')),
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Seed default roles
insert into public.roles (name, description, permissions) values
  ('admin',   'Full system access',  '{"users":["create","read","update","delete"],"supply_market":["create","read","update","delete"],"reports":["read"],"admin":["access"]}'),
  ('manager', 'Manager-level access','{"supply_market":["create","read","update"],"reports":["read"]}'),
  ('staff',   'Standard staff access','{"supply_market":["read"]}');

-- Row-Level Security
alter table public.profiles    enable row level security;
alter table public.roles       enable row level security;
alter table public.user_roles  enable row level security;
alter table public.supply_items enable row level security;

-- RLS Policies: profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

create policy "Admins can insert profiles"
  on public.profiles for insert with check (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

create policy "Admins can update profiles"
  on public.profiles for update using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- RLS Policies: roles (read-only for all authenticated)
create policy "Authenticated users can view roles"
  on public.roles for select using (auth.role() = 'authenticated');

-- RLS Policies: user_roles
create policy "Users can view own roles"
  on public.user_roles for select using (user_id = auth.uid());

create policy "Admins can manage user_roles"
  on public.user_roles for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- RLS Policies: supply_items
create policy "Authenticated users can view supply items"
  on public.supply_items for select using (auth.role() = 'authenticated');

create policy "Managers and admins can insert supply items"
  on public.supply_items for insert with check (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid() and r.name in ('admin','manager')
    )
  );

create policy "Managers and admins can update supply items"
  on public.supply_items for update using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid() and r.name in ('admin','manager')
    )
  );

create policy "Admins can delete supply items"
  on public.supply_items for delete using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger supply_items_updated_at before update on public.supply_items
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
