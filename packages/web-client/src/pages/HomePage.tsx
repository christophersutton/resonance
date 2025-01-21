import { Link } from "react-router-dom";
import supabase from "../supabase";
import { useSession } from "../context/SessionContext";

export const HomePage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground">Resonance</h1>
        <p className="text-lg text-foreground mt-4">
          Welcome to the Resonance Client Portal.
          <br />
          
        </p>
        <div className="mt-8">
          <Link
            to="/tickets/new"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Create New Ticket
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
