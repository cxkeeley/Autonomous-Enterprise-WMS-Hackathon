import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import clsx from "clsx";

const navLinkClass = "block px-3 py-2 rounded text-sm transition-colors duration-150";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        navLinkClass,
        isActive
          ? "bg-indigo-600 text-white"
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}

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
          <NavLink to="/">Dashboard</NavLink>

          <div className="text-xs text-gray-500 uppercase tracking-wider pt-3 pb-1 px-3">
            Operations
          </div>
          <NavLink to="/inbound">Goods Receipt</NavLink>
          <NavLink to="/outbound">Outbound</NavLink>
          <NavLink to="/production">Production</NavLink>
          <NavLink to="/adjustments">Adjustments</NavLink>
          <NavLink to="/inventory">Inventory</NavLink>
          <NavLink to="/ledger">Ledger</NavLink>

          <div className="text-xs text-gray-500 uppercase tracking-wider pt-3 pb-1 px-3">
            Master Data
          </div>
          <NavLink to="/items">Items</NavLink>
          <NavLink to="/locations">Locations</NavLink>
          <NavLink to="/entities">Entities</NavLink>
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
