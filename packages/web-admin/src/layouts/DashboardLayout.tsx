import { NavLink, Outlet, Navigate } from "react-router-dom";
import { ScrollArea } from "../components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { LayoutDashboard, Settings, TicketIcon, PieChart, Users } from "lucide-react";
import { cn } from "../lib/utils";
import { useClient } from "../context/ClientContext";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive ? "bg-accent" : "transparent"
      )
    }
  >
    {icon}
    {label}
  </NavLink>
);

export const DashboardLayout = () => {
  const { clients, activeClient, setActiveClient, isLoading } = useClient();

  // If there are no clients, redirect to add client page
  if (!isLoading && clients.length === 0) {
    return <Navigate to="/add-client" />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background">
        <div className="flex h-full flex-col">
          {/* Client Picker */}
          <div className="p-4">
            <Select
              value={activeClient?.id}
              onValueChange={(value) => {
                const client = clients.find(c => c.id === value);
                if (client) setActiveClient(client);
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Client">
                  {activeClient?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Separator />

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="flex flex-col gap-2">
              <NavItem 
                to="/dashboard" 
                icon={<LayoutDashboard className="h-4 w-4" />} 
                label="Dashboard" 
              />
              <NavItem 
                to="/clients" 
                icon={<Users className="h-4 w-4" />} 
                label="Clients" 
              />
              <NavItem 
                to="/tickets" 
                icon={<TicketIcon className="h-4 w-4" />} 
                label="Tickets" 
              />
              <NavItem 
                to="/reports" 
                icon={<PieChart className="h-4 w-4" />} 
                label="Reports" 
              />
              <NavItem 
                to="/settings" 
                icon={<Settings className="h-4 w-4" />} 
                label="Settings" 
              />
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-accent/10 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout; 