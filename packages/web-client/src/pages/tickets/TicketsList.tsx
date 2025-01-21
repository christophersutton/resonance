import { useEffect, useState } from "react";
import { getTickets, type Ticket } from "../../services/ticketService";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const TicketsList = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await getTickets();
      if (error) {
        setError(error.message);
      } else {
        setTickets(data || []);
      }
      setLoading(false);
    };

    fetchTickets();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>Error: {error}</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <Link
          to="/tickets/new"
          className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Create Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="bg-white rounded shadow p-4">
              <Link to={`/tickets/${ticket.id}`} className="font-semibold text-blue-600">
                {ticket.title} ({ticket.status})
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                Priority: {ticket.priority} | Severity: {ticket.severity}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default TicketsList;