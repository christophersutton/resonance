import React from "react";
import { Link, Outlet } from "react-router-dom";

function App() {
  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex gap-4">
          <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
          <Link to="/add-client" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Add Client</Link>
        </div>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
