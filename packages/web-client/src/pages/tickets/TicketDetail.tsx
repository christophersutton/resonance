import { useEffect, useState } from "react";
import {
  getTicketById,
  getMessages,
  createMessage,
  type Ticket,
  type Message
} from "../../services/ticketService";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const fetchTicketAndMessages = async (ticketId: string) => {
    setLoading(true);

    const ticketResult = await getTicketById(ticketId);
    if (ticketResult.error) {
      setError(ticketResult.error.message);
      setLoading(false);
      return;
    }

    const messagesResult = await getMessages(ticketId);
    if (messagesResult.error) {
      setError(messagesResult.error.message);
    }

    setTicket(ticketResult.data || null);
    setMessages(messagesResult.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchTicketAndMessages(id);
    }
  }, [id]);

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
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{ticket.title}</h1>
      <p className="text-gray-600 mb-4">
        Status: {ticket.status} | Priority: {ticket.priority} | Severity: {ticket.severity}
      </p>
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-1">Description</h2>
        <p className="text-gray-700 whitespace-pre-line">{ticket.description}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Messages</h2>
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

export default TicketDetail;