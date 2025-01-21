-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ======================================================================================
-- TABLE: clients
-- ======================================================================================
create table public.clients (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    contact_info jsonb,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
comment on table public.clients is 'Client organizations using the platform';

-- ======================================================================================
-- TABLE: profiles (NO ROLE COLUMN)
-- ======================================================================================
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    client_id uuid references public.clients(id),
    full_name text,
    skills text[] default array[]::text[],
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Extended user profile (no separate role)';

-- ======================================================================================
-- TABLE: invites
-- ======================================================================================
create table public.invites (
    id uuid primary key default uuid_generate_v4(),
    client_id uuid references public.clients(id),
    email text not null,
    role text not null check (role in ('CLIENT_CONTACT', 'AGENT', 'ADMIN', 'DEVELOPER')),
    invited_by uuid references auth.users(id),
    expires_at timestamptz not null default (now() + interval '7 days'),
    created_at timestamptz not null default now(),
    used_at timestamptz,
    unique(email, client_id)
);
comment on table public.invites is 'Pending invitations for users to join the platform';

-- ======================================================================================
-- TABLE: audit_logs
-- ======================================================================================
create table public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    entity_type text not null,
    entity_id uuid not null,
    change_description text not null,
    performed_by uuid references auth.users(id),
    created_at timestamptz not null default now()
);
comment on table public.audit_logs is 'Audit trail for important system events and changes';

-- ======================================================================================
-- REMOVE role-sync function & triggers (not needed anymore)
-- ======================================================================================
-- (Nothing here - simply not creating them)

-- ======================================================================================
-- Enable RLS
-- ======================================================================================
alter table public.clients enable row level security;
alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.audit_logs enable row level security;

-- ======================================================================================
-- RLS POLICIES
-- ======================================================================================
-- We rely on JWT role in auth.users -> app_metadata->role

-------------------------------------------------------------------------------
-- CLIENTS: Only 'ADMIN' can insert/update; 'ADMIN' or matching client_id can view
-------------------------------------------------------------------------------
drop policy if exists "admins_can_create_clients" on public.clients;
drop policy if exists "admins_can_update_clients" on public.clients;
drop policy if exists "users_can_view_their_own_client" on public.clients;

create policy "admins_can_create_clients"
    on public.clients
    for insert
    to authenticated
    with check (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    );

create policy "admins_can_update_clients"
    on public.clients
    for update
    to authenticated
    with check (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    );

create policy "users_can_view_their_own_client"
    on public.clients
    for select
    to authenticated
    using (
      -- Admin can view all; or user's profile has matching client_id
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
      or
      (
        id in (
          select client_id from public.profiles
          where id = auth.uid()
        )
      )
    );

-------------------------------------------------------------------------------
-- PROFILES: Only the user can view/update their own profile
-------------------------------------------------------------------------------
drop policy if exists "users_can_view_their_profile" on public.profiles;
drop policy if exists "users_can_update_their_profile" on public.profiles;
drop policy if exists "system_can_create_profiles" on public.profiles;

create policy "users_can_view_their_profile"
    on public.profiles
    for select
    to authenticated
    using (
      id = auth.uid()
    );

create policy "users_can_update_their_profile"
    on public.profiles
    for update
    to authenticated
    with check (id = auth.uid());

create policy "system_can_create_profiles"
    on public.profiles
    for insert
    to authenticated
    with check (true);

-------------------------------------------------------------------------------
-- INVITES
-------------------------------------------------------------------------------
drop policy if exists "admins_or_client_contact_can_create_invites" on public.invites;
drop policy if exists "users_can_view_invites" on public.invites;

create policy "admins_or_client_contact_can_create_invites"
    on public.invites
    for insert
    to authenticated
    with check (
      -- Admin can insert invites for any client
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
      -- or user is a client_contact for that client. If you prefer
      -- to check specifically for "CLIENT_CONTACT", do so. For now
      -- we only check that the user's profile belongs to the same client.
      or (
        client_id in (
          select client_id from public.profiles
          where id = auth.uid()
        )
      )
    );

create policy "users_can_view_invites"
    on public.invites
    for select
    to authenticated
    using (
      -- Admin sees all invites, or same client_id as user's profile
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
      or (
        client_id in (
          select client_id from public.profiles
          where id = auth.uid()
        )
      )
    );

-------------------------------------------------------------------------------
-- AUDIT LOGS
-------------------------------------------------------------------------------
drop policy if exists "users_can_view_audit_logs_for_their_client" on public.audit_logs;
drop policy if exists "system_can_create_audit_logs" on public.audit_logs;

create policy "users_can_view_audit_logs_for_their_client"
    on public.audit_logs
    for select
    to authenticated
    using (
      -- Admin sees all logs. Or user's client_id matches log's entity_id if entity_type='clients'
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
      or (
        entity_id in (
          select client_id from public.profiles 
          where id = auth.uid()
        )
      )
    );

create policy "system_can_create_audit_logs"
    on public.audit_logs
    for insert
    to authenticated
    with check (true);

-- ======================================================================================
-- INDEXES
-- ======================================================================================
create index if not exists idx_profiles_client_id on public.profiles(client_id);
create index if not exists idx_invites_client_id on public.invites(client_id);
create index if not exists idx_invites_email on public.invites(email);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);

-- ======================================================================================
-- Handle updated_at triggers
-- ======================================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_clients_updated_at
    before update on public.clients
    for each row
    execute function public.handle_updated_at();

create trigger handle_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

-- ======================================================================================
-- Default Admin for convenience
-- ======================================================================================
insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role
) values (
    '4d675c45-4294-4190-b71f-778faea7b049',  
    '00000000-0000-0000-0000-000000000000',
    'admin@resonance.dev',
    crypt('admin123', gen_salt('bf')),
    now(),
    jsonb_build_object('role', 'ADMIN'),
    jsonb_build_object('full_name', 'Admin User'),
    now(),
    now(),
    'authenticated'
)
on conflict (id) do update
    set raw_app_meta_data = jsonb_build_object('role', 'ADMIN'),
        raw_user_meta_data = jsonb_build_object('full_name', 'Admin User');

-- Create an admin profile with minimal info (no role column now).
insert into public.profiles (id, client_id, full_name)
values (
    '4d675c45-4294-4190-b71f-778faea7b049',
    null,
    'Admin User'
)
on conflict (id) do update
    set full_name = 'Admin User';