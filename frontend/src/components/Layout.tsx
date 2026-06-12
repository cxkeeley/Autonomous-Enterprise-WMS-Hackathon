import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Warehouse WMS</h2>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link to="/" className="block px-3 py-2 rounded hover:bg-gray-700 text-sm">
            Dashboard
          </Link>
          <Link to="/items" className="block px-3 py-2 rounded hover:bg-gray-700 text-sm">
            Items
          </Link>
          <Link to="/locations" className="block px-3 py-2 rounded hover:bg-gray-700 text-sm">
            Locations
          </Link>
          <Link to="/entities" className="block px-3 py-2 rounded hover:bg-gray-700 text-sm">
            Entities
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-400">{user?.username}</p>
          <p className="text-xs text-gray-500 mb-2">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
