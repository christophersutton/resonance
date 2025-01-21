import supabase from '../supabase';
// import { Client } from 'packages/shared/types/client';

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface CreateClientData {
  name: string;
  contact_info: ContactInfo;
  notes?: string;
}

interface Client extends CreateClientData {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Creates a new client in Supabase.
 * Note: This only creates the client record. To give the contact access,
 * you'll need to separately create an invite using the invite system.
 */
export async function createClient(clientData: CreateClientData) {
  // Debug: Get the current user and their metadata
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user:', user);
  console.log('User metadata:', user?.user_metadata);
  console.log('User role:', user?.user_metadata?.role);

  const response = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single();

  return response;
}

/**
 * Creates a client and sends an invite to the primary contact.
 * This is a convenience method that handles both operations.
 */
export async function createClientWithInvite(clientData: CreateClientData) {
  // First create the client
  const { data: client, error: clientError } = await createClient(clientData);
  if (clientError) {
    return { data: null, error: clientError };
  }

  // Then create an invite for the primary contact
  const { error: inviteError } = await supabase
    .from('invites')
    .insert({
      client_id: client.id,
      email: clientData.contact_info.email,
      role: 'CLIENT_CONTACT'
    });

  if (inviteError) {
    // Note: Client was created but invite failed
    return { 
      data: client, 
      error: inviteError,
      warning: 'Client created but invite failed to send'
    };
  }

  return { data: client, error: null };
}