import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClients } from "../services/clientService";
import { useSession } from "../context/SessionContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  contact_info: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  notes?: string;
  created_at: string;
}

export const HomePage = () => {
  const { session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const { data, error: clientError } = await getClients();
        if (clientError) {
          setError(clientError.message);
        } else {
          setClients(data || []);
        }
      } catch (err) {
        setError('Failed to load clients');
        console.error('Error loading clients:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">
              Manage your client organizations
            </p>
          </div>
          <Link to="/add-client">
            <Button size="lg" className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Client
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : clients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-4">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No clients yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first client</p>
              <Link to="/add-client">
                <Button>Add Your First Client</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Link key={client.id} to={`/clients/${client.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{client.name}</CardTitle>
                    <CardDescription>
                      {client.contact_info.firstName} {client.contact_info.lastName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500">
                      <p>{client.contact_info.email}</p>
                      {client.contact_info.phone && (
                        <p className="mt-1">{client.contact_info.phone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HomePage;
