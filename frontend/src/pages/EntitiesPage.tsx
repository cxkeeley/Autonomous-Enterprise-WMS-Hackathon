import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEntities, createEntity, deleteEntity } from "../api/masterData";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import type { EntityResponse } from "../types/api";

const columns: Column<EntityResponse>[] = [
  { key: "name", header: "Name" },
  { key: "type", header: "Type" },
];

export default function EntitiesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"SUPPLIER" | "CUSTOMER">("SUPPLIER");
  const [filterType, setFilterType] = useState<string | undefined>(undefined);

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["entities", filterType],
    queryFn: () => fetchEntities(filterType),
  });

  const createMutation = useMutation({
    mutationFn: createEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      setShowForm(false);
      setName("");
      setType("SUPPLIER");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEntity,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entities"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Entities</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
        >
          {showForm ? "Cancel" : "New Entity"}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[undefined, "SUPPLIER", "CUSTOMER"].map((f) => (
          <button
            key={f ?? "all"}
            onClick={() => setFilterType(f)}
            className={`px-3 py-1 rounded-md text-sm ${
              filterType === f
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {f === undefined ? "All" : f === "SUPPLIER" ? "Suppliers" : "Customers"}
          </button>
        ))}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ name, type });
          }}
          className="bg-white p-4 rounded-lg shadow mb-6 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Entity name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="SUPPLIER">Supplier</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
          >
            {createMutation.isPending ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      <DataTable
        columns={columns}
        data={entities}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onDelete={(item) => deleteMutation.mutate(item.id)}
      />
    </div>
  );
}
