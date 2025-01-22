import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getClients } from '../services/clientService';

interface Client {
  id: string;
  name: string;
}

interface ClientContextType {
  clients: Client[];
  activeClient: Client | null;
  setActiveClient: (client: Client) => void;
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const { data } = await getClients();
        if (data && data.length > 0) {
          setClients(data);
          // Set the first client as active by default
          if (!activeClient) {
            setActiveClient(data[0]);
          }
        }
      } catch (err) {
        console.error('Error loading clients:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  return (
    <ClientContext.Provider value={{ clients, activeClient, setActiveClient, isLoading }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
} 