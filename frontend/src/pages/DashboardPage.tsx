import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome back, <span className="font-semibold text-gray-800">{user?.username}</span>.
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Role: <span className="font-medium">{user?.role}</span>
        </p>
      </div>
    </div>
  );
}
