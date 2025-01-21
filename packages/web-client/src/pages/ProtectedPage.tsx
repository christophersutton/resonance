import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";

const ProtectedPage = () => {
  const { session } = useSession();
  return (
    <main className="min-h-screen p-8">
      <Link 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8" 
        to="/"
      >
        <span className="mr-2">◄</span>
        Home
      </Link>
      <section className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">This is a Protected Page</h1>
        <p className="text-gray-700">
          Current User: <span className="font-medium">{session?.user.email || "None"}</span>
        </p>
      </section>
    </main>
  );
};

export default ProtectedPage;
