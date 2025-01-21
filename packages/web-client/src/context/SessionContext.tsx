import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabase";
import LoadingPage from "../pages/LoadingPage";
import type { User, Session } from "@supabase/supabase-js";

type Role = 'ADMIN' | 'CLIENT_CONTACT' | 'AGENT' | 'DEVELOPER';

interface SessionContextType {
  session: Session | null;
  role: Role | null;
  isAdmin: boolean;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  role: null,
  isAdmin: false,
});

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

type Props = { children: React.ReactNode };
export const SessionProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStateListener = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        setSession(session);
        // Get role from session metadata
        const userRole = session?.user?.app_metadata?.role as Role;
        setRole(userRole);
        setIsLoading(false);
      }
    );

    return () => {
      authStateListener.data.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ 
      session, 
      role,
      isAdmin: role === 'ADMIN'
    }}>
      {isLoading ? <LoadingPage /> : children}
    </SessionContext.Provider>
  );
};
