import { Outlet } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";

const Providers = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Outlet />
    </div>
  );
};

export default Providers;
