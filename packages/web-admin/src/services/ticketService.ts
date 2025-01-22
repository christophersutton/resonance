import supabase from "../supabase";

/**
 * Admin-facing ticket service. Admin/agent roles can see and update all tickets.
 */

export interface AdminTicket {
  id: string;
  ticket_type_id: number | null;
  title: string;
  description: string | null;
  status: "NEW" | "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  severity: "NONE" | "MINOR" | "MAJOR" | "CRITICAL" | null;
  requester_id: string;
  assigned_agent_id: string | null;
  client_id: string | null;
  tags: string[] | null;
  custom_fields: any;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  attachments: string[] | null;
  created_at: string | null;
}

export interface TicketType {
  id: number;
  name: string;
  description: string | null;
  workflow_metadata: any;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Get all tickets (admin can see all).
 */
export async function getAllTickets() {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}

/**
 * Get a single ticket by ID.
 */
export async function getTicketById(id: string) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

/**
 * Update a ticket's status, priority, severity, or assigned agent
 */
export async function updateTicket(id: string, updates: Partial<AdminTicket>) {
  // First verify the ticket exists and is accessible
  const { data: existingTicket, error: fetchError } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  console.log('Existing ticket:', existingTicket);
  console.log('Fetch error:', fetchError);

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (!existingTicket) {
    return {
      data: null,
      error: new Error("Ticket not found or you don't have permission to update it")
    };
  }

  // Proceed with update - don't use select() to avoid PGRST116
  const { error: updateError, data: updateData } = await supabase
    .from("tickets")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (updateError) {
    return { data: null, error: updateError };
  }

  console.log('Update data:', updateData);
  // Fetch the updated ticket
  const { data: updatedTicket, error: refetchError } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (refetchError) {
    return { 
      data: null, 
      error: new Error("Update succeeded but failed to fetch updated ticket")
    };
  }

  return { data: updatedTicket, error: null };
}

/**
 * Fetch messages for a specific ticket
 */
export async function getMessages(ticketId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return { data, error };
}

/**
 * Create a new message (admin side).
 */
export async function createMessage(ticketId: string, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      ticket_id: ticketId,
      content,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Optional: fetch ticket types
 */
export async function getTicketTypes() {
  const { data, error } = await supabase
    .from("ticket_types")
    .select("*")
    .order("id");

  return { data, error };
}

/**
 * Get tickets for a specific client
 */
export async function getClientTickets(clientId: string) {
  // Debug: Get current user and role
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user:', user);
  console.log('User metadata:', user?.user_metadata);
  console.log('App metadata:', user?.app_metadata);

  const { data, error } = await supabase
    .from("tickets")
    .select("*, ticket_types(name)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  // Debug: Log query results
  console.log('Query results:', { data, error });
  
  return { data, error };
}