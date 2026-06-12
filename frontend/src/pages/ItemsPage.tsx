import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchItems, createItem, deleteItem } from "../api/masterData";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import type { ItemResponse } from "../types/api";

const columns: Column<ItemResponse>[] = [
  { key: "sku", header: "SKU" },
  { key: "name", header: "Name" },
  { key: "type", header: "Type" },
  { key: "uom", header: "UoM" },
];

export default function ItemsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"RAW_MATERIAL" | "WIP" | "FINISHED_GOOD">("RAW_MATERIAL");
  const [uom, setUom] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setShowForm(false);
      setSku("");
      setName("");
      setType("RAW_MATERIAL");
      setUom("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Items</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
        >
          {showForm ? "Cancel" : "New Item"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ sku, name, type, uom });
          }}
          className="bg-white p-4 rounded-lg shadow mb-6 space-y-3"
        >
          <div className="grid grid-cols-4 gap-3">
            <input
              placeholder="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              placeholder="Name"
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
              <option value="RAW_MATERIAL">Raw Material</option>
              <option value="WIP">WIP</option>
              <option value="FINISHED_GOOD">Finished Good</option>
            </select>
            <input
              placeholder="UoM (e.g. kg, pcs)"
              value={uom}
              onChange={(e) => setUom(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
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
        data={items}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onDelete={(item) => deleteMutation.mutate(item.id)}
      />
    </div>
  );
}
