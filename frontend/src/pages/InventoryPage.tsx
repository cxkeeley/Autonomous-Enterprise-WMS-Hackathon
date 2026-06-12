import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInventory, fetchInventorySummary } from "../api/inventory";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import type { InventoryItem, InventorySummary } from "../types/api";

const detailColumns: Column<InventoryItem>[] = [
  { key: "item_sku", header: "SKU" },
  { key: "item_name", header: "Item" },
  { key: "item_type", header: "Type" },
  { key: "batch_number", header: "Batch" },
  { key: "location_name", header: "Location" },
  { key: "current_quantity", header: "Qty" },
  {
    key: "expiration_date",
    header: "Expires",
    render: (item) => item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : "—",
  },
];

const summaryColumns: Column<InventorySummary>[] = [
  { key: "item_sku", header: "SKU" },
  { key: "item_name", header: "Item" },
  { key: "item_type", header: "Type" },
  { key: "total_quantity", header: "Total Qty" },
  { key: "batch_count", header: "Batches" },
  { key: "location_count", header: "Locations" },
];

export default function InventoryPage() {
  const [view, setView] = useState<"summary" | "detail">("summary");

  const { data: summary = [], isLoading: summaryLoading } = useQuery({
    queryKey: ["inventory", "summary"],
    queryFn: fetchInventorySummary,
  });

  const { data: detail = [], isLoading: detailLoading } = useQuery({
    queryKey: ["inventory", "detail"],
    queryFn: fetchInventory,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Real-Time Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView("summary")}
            className={`px-3 py-1 rounded-md text-sm ${
              view === "summary"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setView("detail")}
            className={`px-3 py-1 rounded-md text-sm ${
              view === "detail"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Detail
          </button>
        </div>
      </div>

      {view === "summary" ? (
        <DataTable
          columns={summaryColumns}
          data={summary}
          keyExtractor={(item) => item.item_id}
          isLoading={summaryLoading}
        />
      ) : (
        <DataTable
          columns={detailColumns}
          data={detail}
          keyExtractor={(item) => item.batch_id}
          isLoading={detailLoading}
        />
      )}
    </div>
  );
}
