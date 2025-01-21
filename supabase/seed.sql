-- Create a test client
insert into public.clients (id, name, contact_info, notes)
values (
    '00000000-0000-0000-0000-000000000001',
    'Test Client',
    '{"email": "contact@testclient.com", "phone": "555-0123"}',
    'This is a test client created by seed file'
);

-- Create some test invites (using the client ID and admin as inviter)
insert into public.invites (id, client_id, email, role, invited_by)
values (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'test@example.com',
    'CLIENT_CONTACT',
    '4d675c45-4294-4190-b71f-778faea7b049'  -- Default admin user
); 