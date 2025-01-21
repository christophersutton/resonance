import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { getClientTickets, type AdminTicket } from '../services/ticketService';
import { Badge } from '../components/ui/badge';
import { Loader2 } from 'lucide-react';

export function ClientPage() {
  const { id } = useParams<{ id: string }>();
  const [tickets, setTickets] = useState<(AdminTicket & { ticket_types: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      if (!id) return;
      
      const { data, error } = await getClientTickets(id);
      setLoading(false);
      
      if (error) {
        console.error('Error loading tickets:', error);
        setError(error.message);
      } else {
        setTickets(data || []);
      }
    }

    loadTickets();
  }, [id]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      OPEN: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-purple-100 text-purple-800',
      CLOSED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-800',
      NORMAL: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Client ID: {id}</p>
          {/* TODO: Add client details, contact info, etc. */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Tickets</CardTitle>
          <Link
            to={`/tickets/new?client=${id}`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Create Ticket
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500 text-center p-4">No tickets found for this client.</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{ticket.title}</h3>
                      <div className="flex gap-2 text-sm">
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                        {ticket.ticket_types?.name && (
                          <Badge variant="outline">{ticket.ticket_types.name}</Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(ticket.created_at!).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 