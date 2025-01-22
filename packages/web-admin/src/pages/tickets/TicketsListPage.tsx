import { useEffect, useState } from "react";
import { getClientTickets, type AdminTicket } from "../../services/ticketService";
import { Link } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { useClient } from "../../context/ClientContext";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const getStatusColor = (status: AdminTicket['status']) => {
  switch (status) {
    case 'NEW':
      return 'bg-blue-500';
    case 'OPEN':
      return 'bg-green-500';
    case 'PENDING':
      return 'bg-yellow-500';
    case 'RESOLVED':
      return 'bg-purple-500';
    case 'CLOSED':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const getPriorityColor = (priority: AdminTicket['priority']) => {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-500';
    case 'HIGH':
      return 'bg-orange-500';
    case 'NORMAL':
      return 'bg-blue-500';
    case 'LOW':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const TicketsListPage = () => {
  const { activeClient } = useClient();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTickets = async () => {
      if (!activeClient) return;
      
      setLoading(true);
      const { data, error } = await getClientTickets(activeClient.id);
      if (error) {
        setError(error.message);
      } else {
        setTickets(data || []);
      }
      setLoading(false);
    };

    loadTickets();
  }, [activeClient]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-destructive text-center">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">
            Manage support tickets for {activeClient?.name}
          </p>
        </div>
        <Button size="lg">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Loader2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No tickets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first support ticket to get started
            </p>
            <Button>Create Ticket</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{ticket.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                    <Badge variant="secondary" className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsListPage;