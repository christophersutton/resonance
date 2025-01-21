import { useEffect, useState } from "react";
import { getAllTickets, type AdminTicket } from "../../services/ticketService";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const TicketsListPage = () => {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await getAllTickets();
      if (error) {
        setError(error.message);
      } else {
        setTickets(data || []);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>Error: {error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Tickets</h1>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white p-4 rounded shadow">
              <Link
                to={`/tickets/${ticket.id}`}
                className="font-semibold text-blue-600"
              >
                {ticket.title} ({ticket.status})
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                Priority: {ticket.priority} | Severity: {ticket.severity}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default TicketsListPage;