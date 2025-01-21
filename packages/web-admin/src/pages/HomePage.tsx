import { Link } from "react-router-dom";
import supabase from "../supabase";
import { useSession } from "../context/SessionContext";

export const HomePage = () => {
  const { session } = useSession();
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <section className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">React Supabase Auth Template</h1>
          
          <p className="text-gray-600 text-center">
            Current User: <span className="font-medium">{session?.user.email || "None"}</span>
          </p>
          <Link to="/add-client">Add Client</Link>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth/sign-in"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign In
              </Link>
            )}
            
            <Link
              to="/protected"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Protected Page 🛡️
            </Link>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          
        </div>
      </section>
    </main>
  );
};

export default HomePage;
