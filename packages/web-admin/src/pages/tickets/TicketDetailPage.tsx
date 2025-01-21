import { useEffect, useState } from "react";
import {
  getTicketById,
  updateTicket,
  getMessages,
  createMessage,
  type AdminTicket,
  type AdminMessage,
  getTicketTypes,
  type TicketType
} from "../../services/ticketService";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<AdminTicket | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [formValues, setFormValues] = useState<Partial<AdminTicket>>({});

  // Fetch ticket info
  const loadTicketData = async (ticketId: string) => {
    setLoading(true);
    setError(null);

    const ticketResult = await getTicketById(ticketId);
    if (ticketResult.error) {
      setError(ticketResult.error.message);
      setLoading(false);
      return;
    }

    setTicket(ticketResult.data);

    // Load messages
    const msgs = await getMessages(ticketId);
    if (msgs.error) {
      setError(msgs.error.message);
    } else {
      setMessages(msgs.data || []);
    }

    // Load ticket types
    const { data: typesData } = await getTicketTypes();
    setTicketTypes(typesData || []);

    setFormValues({
      status: ticketResult.data?.status,
      priority: ticketResult.data?.priority,
      severity: ticketResult.data?.severity,
      assigned_agent_id: ticketResult.data?.assigned_agent_id || "",
    });

    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      loadTicketData(id);
    }
  }, [id]);

  const handleUpdateTicket = async () => {
    if (!id || !ticket) return;
    setLoading(true);
    setError(null);

    const { data, error } = await updateTicket(id, {
      status: formValues.status,
      priority: formValues.priority,
      severity: formValues.severity,
      assigned_agent_id: formValues.assigned_agent_id
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Refresh ticket data
    await loadTicketData(id);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!id || !newMessage.trim()) return;
    setMsgLoading(true);
    setMsgError(null);

    const { data, error } = await createMessage(id, newMessage.trim());
    setMsgLoading(false);

    if (error) {
      setMsgError(error.message);
      return;
    }

    if (data) {
      // Refresh messages
      const refreshed = await getMessages(id);
      if (refreshed.error) {
        setMsgError(refreshed.error.message);
      } else {
        setMessages(refreshed.data || []);
        setNewMessage("");
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </main>
    );
  }

  if (error || !ticket) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          {error || "Ticket not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Ticket Detail</h1>
      <div className="bg-white shadow rounded p-4 mb-4">
        <h2 className="text-lg font-semibold">{ticket.title}</h2>
        <p className="text-sm text-gray-600 mt-1">Requester: {ticket.requester_id}</p>
        <p className="text-sm text-gray-600">Client: {ticket.client_id}</p>
        <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{ticket.description}</p>
      </div>

      <div className="bg-white shadow rounded p-4 mb-4 space-y-4">
        <h3 className="text-lg font-semibold">Ticket Settings</h3>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              value={formValues.status}
              onChange={(e) => setFormValues({ ...formValues, status: e.target.value as AdminTicket["status"] })}
              className="border rounded p-2 w-40"
            >
              <option value="NEW">NEW</option>
              <option value="OPEN">OPEN</option>
              <option value="PENDING">PENDING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Priority</label>
            <select
              value={formValues.priority}
              onChange={(e) => setFormValues({ ...formValues, priority: e.target.value as AdminTicket["priority"] })}
              className="border rounded p-2 w-40"
            >
              <option value="LOW">LOW</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Severity</label>
            <select
              value={formValues.severity || "NONE"}
              onChange={(e) => setFormValues({ ...formValues, severity: e.target.value as AdminTicket["severity"] })}
              className="border rounded p-2 w-40"
            >
              <option value="NONE">NONE</option>
              <option value="MINOR">MINOR</option>
              <option value="MAJOR">MAJOR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Assigned Agent</label>
            <input
              type="text"
              value={formValues.assigned_agent_id || ""}
              onChange={(e) => setFormValues({ ...formValues, assigned_agent_id: e.target.value })}
              className="border rounded p-2 w-48"
              placeholder="Agent UUID"
            />
          </div>
        </div>
        <button
          onClick={handleUpdateTicket}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Update Ticket
        </button>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Messages</h3>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {messages.map((msg) => (
              <li key={msg.id} className="bg-gray-50 p-2 rounded">
                <p className="text-sm text-gray-800">{msg.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(msg.created_at ?? "").toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}

        {msgError && (
          <p className="text-red-500 mb-2">{msgError}</p>
        )}

        <div className="flex space-x-2">
          <input
            className="border rounded flex-1 p-2"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            disabled={msgLoading}
            onClick={handleSendMessage}
            className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {msgLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send
          </button>
        </div>
      </div>
    </main>
  );
};

export default TicketDetailPage;