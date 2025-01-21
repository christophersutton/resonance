import supabase from "../supabase";

/**
 * Ticket interface for type checking
 */
export interface Ticket {
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

export interface Message {
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
 * Fetch all ticket types (BUG, MAINTENANCE, etc.)
 */
export async function getTicketTypes() {
  const { data, error } = await supabase
    .from("ticket_types")
    .select("*")
    .order("id");

  return { data, error };
}

/**
 * Fetch the current user's tickets (based on RLS).
 */
export async function getTickets() {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}

/**
 * Fetch a single ticket by ID.
 */
export async function getTicketById(ticketId: string) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  return { data, error };
}

/**
 * Create a new ticket. The user must have RLS permission (i.e., a logged-in client user).
 */
export async function createTicket(params: {
  ticket_type_id: number;
  title: string;
  description: string;
  priority: string;
  severity: string;
  client_id?: string;
}) {
  // Get the current user's ID
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: userError || new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      ticket_type_id: params.ticket_type_id,
      title: params.title,
      description: params.description,
      priority: params.priority,
      severity: params.severity || "NONE",
      status: "NEW",
      requester_id: user.id,
      client_id: params.client_id || user.user_metadata?.client_id
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Fetch messages for a specific ticket.
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
 * Create a new message in a ticket.
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