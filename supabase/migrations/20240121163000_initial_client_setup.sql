-- Migration: Initial Client Setup and User Management
-- Description: Creates the foundational schema for client organizations and user management
-- Author: Resonance Team

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create clients table
create table public.clients (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    contact_info jsonb,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.clients is 'Client organizations using the platform';

-- Create profiles table to extend auth.users
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    client_id uuid references public.clients(id),
    full_name text,
    role text not null check (role in ('CLIENT_CONTACT', 'AGENT', 'ADMIN', 'DEVELOPER')),
    skills text[] default array[]::text[],
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Extended user profile information and client associations';

-- Create invites table for managing user invitations
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

-- Create audit log table
create table public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    entity_type text not null,
    entity_id uuid not null,
    change_description text not null,
    performed_by uuid references auth.users(id),
    created_at timestamptz not null default now()
);

comment on table public.audit_logs is 'Audit trail for important system events and changes';

-- Enable Row Level Security
alter table public.clients enable row level security;
alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.audit_logs enable row level security;

-- Clients table policies
create policy "Admins can create clients"
    on public.clients
    for insert
    to authenticated
    with check (auth.jwt() ->> 'role' = 'ADMIN');

create policy "Admins can update clients"
    on public.clients
    for update
    to authenticated
    using (auth.jwt() ->> 'role' = 'ADMIN')
    with check (auth.jwt() ->> 'role' = 'ADMIN');

create policy "Users can view their own client"
    on public.clients
    for select
    to authenticated
    using (
        id in (
            select client_id 
            from public.profiles 
            where id = auth.uid()
        )
        or
        auth.jwt() ->> 'role' = 'ADMIN'
    );

-- Profiles table policies
create policy "Users can view profiles in their client"
    on public.profiles
    for select
    to authenticated
    using (
        client_id in (
            select client_id 
            from public.profiles 
            where id = auth.uid()
        )
        or
        auth.jwt() ->> 'role' in ('ADMIN', 'AGENT')
    );

create policy "Users can update their own profile"
    on public.profiles
    for update
    to authenticated
    using (id = auth.uid())
    with check (id = auth.uid());

create policy "System can create profiles"
    on public.profiles
    for insert
    to authenticated
    with check (true);

-- Invites table policies
create policy "Admins can create invites"
    on public.invites
    for insert
    to authenticated
    with check (
        auth.jwt() ->> 'role' = 'ADMIN'
        or
        client_id in (
            select client_id 
            from public.profiles 
            where id = auth.uid()
            and role in ('ADMIN', 'CLIENT_CONTACT')
        )
    );

create policy "Users can view invites for their client"
    on public.invites
    for select
    to authenticated
    using (
        client_id in (
            select client_id 
            from public.profiles 
            where id = auth.uid()
        )
        or
        auth.jwt() ->> 'role' = 'ADMIN'
    );

-- Audit logs policies
create policy "Users can view audit logs for their client"
    on public.audit_logs
    for select
    to authenticated
    using (
        entity_id in (
            select id 
            from public.clients 
            where id in (
                select client_id 
                from public.profiles 
                where id = auth.uid()
            )
        )
        or
        auth.jwt() ->> 'role' = 'ADMIN'
    );

create policy "System can create audit logs"
    on public.audit_logs
    for insert
    to authenticated
    with check (true);

-- Create indexes for performance
create index idx_profiles_client_id on public.profiles(client_id);
create index idx_invites_client_id on public.invites(client_id);
create index idx_invites_email on public.invites(email);
create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);

-- Create updated_at triggers
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

-- Create a function to set up the default admin user
create or replace function create_default_admin()
returns void as $$
declare
    admin_id uuid;
begin
    -- Create the admin user in auth.users
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
        '4d675c45-4294-4190-b71f-778faea7b049',  -- Fixed ID for default admin
        '00000000-0000-0000-0000-000000000000',
        'admin@resonance.dev',
        crypt('admin123', gen_salt('bf')), -- Default password: admin123
        now(),
        '{"provider": "email", "role": "ADMIN"}',
        '{"full_name": "Admin User"}',
        now(),
        now(),
        'authenticated'
    ) on conflict (id) do nothing
    returning id into admin_id;

    -- Create the admin profile
    insert into public.profiles (id, client_id, full_name, role)
    values (
        admin_id,
        null,
        'Admin User',
        'ADMIN'
    ) on conflict (id) do update
        set role = 'ADMIN',
            full_name = 'Admin User';
end;
$$ language plpgsql;

-- Execute the function to create the admin user
select create_default_admin(); 