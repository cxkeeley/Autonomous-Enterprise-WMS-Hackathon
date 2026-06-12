import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardStats } from "../api/inventory";
import MetricCard from "../components/MetricCard";
import AlertList from "../components/AlertList";
import type { AlertItem } from "../components/AlertList";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000, // refresh every 60s
  });

  const expiringAlerts: AlertItem[] = (stats?.expiring_soon ?? []).map((b) => ({
    id: b.id,
    title: `${b.item_name} — ${b.batch_number}`,
    subtitle: `Qty: ${b.current_quantity.toFixed(2)} at ${b.location_name} — Expires ${new Date(b.expiration_date).toLocaleDateString()}`,
    severity: (() => {
      const days = Math.ceil((new Date(b.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days <= 7 ? "danger" : "warning";
    })(),
    linkTo: "/inventory",
  }));

  const lowStockAlerts: AlertItem[] = (stats?.low_stock ?? []).map((item) => ({
    id: item.item_id,
    title: `${item.sku} — ${item.name}`,
    subtitle: `Type: ${item.type} — Total stock: ${item.total_quantity.toFixed(2)}`,
    severity: item.total_quantity <= 0 ? "danger" : "warning",
    linkTo: "/inventory",
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>

      {/* Welcome */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-gray-600">
          Welcome back, <span className="font-semibold text-gray-800">{user?.username}</span>.
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Role: <span className="font-medium">{user?.role}</span>
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Batches"
          value={stats?.total_batches ?? "—"}
          subtitle="Active inventory batches"
          color="indigo"
        />
        <MetricCard
          title="Total Items"
          value={stats?.total_items ?? "—"}
          subtitle="Distinct SKUs in stock"
          color="green"
        />
        <MetricCard
          title="Total Quantity"
          value={stats ? stats.total_quantity.toFixed(0) : "—"}
          subtitle="Units across all batches"
          color="indigo"
        />
        <MetricCard
          title="Expiring Soon"
          value={stats?.expiring_soon.length ?? "—"}
          subtitle="Within 30 days"
          color={stats && stats.expiring_soon.length > 0 ? "amber" : "green"}
        />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertList
          title="Expiring Batches"
          items={expiringAlerts}
          isLoading={isLoading}
          emptyMessage="No batches expiring within 30 days"
        />
        <AlertList
          title="Low Stock Items"
          items={lowStockAlerts}
          isLoading={isLoading}
          emptyMessage="All items have adequate stock levels"
        />
      </div>
    </div>
  );
}
