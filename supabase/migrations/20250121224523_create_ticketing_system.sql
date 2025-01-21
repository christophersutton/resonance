-- Migration: Create Ticketing System
-- Description: Implements core ticketing functionality including ticket types, tickets, messages, and audit logs
-- with proper RLS policies and relationships

-- Create ticket_types table
create table public.ticket_types (
    id bigint generated always as identity primary key,
    name text not null,
    description text,
    workflow_metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.ticket_types is 'Defines different types of tickets (e.g., BUG, MAINTENANCE, CONSULTATION) and their workflows';

-- Enable RLS
alter table public.ticket_types enable row level security;

-- RLS Policies for ticket_types
create policy "Authenticated users can view ticket types"
    on public.ticket_types for select
    to authenticated
    using (true);

create policy "Only admins can modify ticket types"
    on public.ticket_types for all
    to authenticated
    using (auth.jwt() ->> 'role' = 'ADMIN')
    with check (auth.jwt() ->> 'role' = 'ADMIN');

-- Create tickets table
create table public.tickets (
    id uuid primary key default uuid_generate_v4(),
    ticket_type_id bigint references public.ticket_types(id),
    title text not null,
    description text,
    status text not null check (status in ('NEW', 'OPEN', 'PENDING', 'RESOLVED', 'CLOSED')),
    priority text not null check (priority in ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    severity text check (severity in ('NONE', 'MINOR', 'MAJOR', 'CRITICAL')),
    requester_id uuid references auth.users(id) not null,
    assigned_agent_id uuid references auth.users(id),
    client_id uuid references public.clients(id),
    tags text[] default array[]::text[],
    custom_fields jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.tickets is 'Core ticket entities tracking support requests, bugs, and other client needs';

-- Enable RLS
alter table public.tickets enable row level security;

-- Create index for common queries
create index tickets_client_id_idx on public.tickets(client_id);
create index tickets_requester_id_idx on public.tickets(requester_id);
create index tickets_assigned_agent_id_idx on public.tickets(assigned_agent_id);
create index tickets_status_idx on public.tickets(status);

-- RLS Policies for tickets
create policy "Users can view tickets they created or are assigned to"
    on public.tickets for select
    to authenticated
    using (
        requester_id = auth.uid() or
        assigned_agent_id = auth.uid() or
        (auth.jwt() -> 'user_metadata' ->> 'role') in ('ADMIN', 'AGENT')
    );

create policy "Users can create tickets"
    on public.tickets for insert
    to authenticated
    with check (true);

create policy "Users can update tickets they created or are assigned to"
    on public.tickets for update
    to authenticated
    using (
        requester_id = auth.uid() or
        assigned_agent_id = auth.uid() or
        auth.jwt() ->> 'role' in ('ADMIN', 'AGENT')
    )
    with check (
        requester_id = auth.uid() or
        assigned_agent_id = auth.uid() or
        auth.jwt() ->> 'role' in ('ADMIN', 'AGENT')
    );

-- Create messages table
create table public.messages (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid references public.tickets(id) not null,
    author_id uuid references auth.users(id) not null,
    content text not null,
    attachments text[] default array[]::text[],
    created_at timestamptz default now()
);

comment on table public.messages is 'Messages and updates associated with tickets';

-- Enable RLS
alter table public.messages enable row level security;

-- Create index for common queries
create index messages_ticket_id_idx on public.messages(ticket_id);
create index messages_author_id_idx on public.messages(author_id);

-- RLS Policies for messages
create policy "Users can view messages for tickets they have access to"
    on public.messages for select
    to authenticated
    using (
        ticket_id in (
            select id from public.tickets
            where
                requester_id = auth.uid() or
                assigned_agent_id = auth.uid() or
                (auth.jwt() -> 'user_metadata' ->> 'role') in ('ADMIN', 'AGENT')
        )
    );

create policy "Users can create messages for tickets they have access to"
    on public.messages for insert
    to authenticated
    with check (
        ticket_id in (
            select id from public.tickets
            where
                requester_id = auth.uid() or
                assigned_agent_id = auth.uid() or
                (auth.jwt() -> 'user_metadata' ->> 'role') in ('ADMIN', 'AGENT')
        )
    );

-- Add policy for ticket-related audit logs to existing audit_logs table
create policy "Users can view audit logs for their tickets"
    on public.audit_logs for select
    to authenticated
    using (
        -- Admin check
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
        -- Ticket-related logs
        or (
            entity_type = 'ticket' and
            entity_id in (
                select id from public.tickets
                where
                    requester_id = auth.uid() or
                    assigned_agent_id = auth.uid()
            )
        )
    );

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql security definer;

-- Create triggers for updated_at
create trigger set_timestamp
    before update on public.tickets
    for each row
    execute procedure public.handle_updated_at();

create trigger set_timestamp
    before update on public.ticket_types
    for each row
    execute procedure public.handle_updated_at();

-- Insert default ticket types
insert into public.ticket_types (name, description) values
    ('BUG', 'Software defects and technical issues'),
    ('MAINTENANCE', 'Routine maintenance and updates'),
    ('CONSULTATION', 'Technical consultation and advice requests'),
    ('SUPPORT', 'General support and assistance'); 