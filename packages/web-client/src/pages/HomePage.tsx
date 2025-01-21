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
      </div>
    </main>
  );
};

export default HomePage;
