import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLocations, createLocation, deleteLocation } from "../api/masterData";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import type { LocationResponse } from "../types/api";

const columns: Column<LocationResponse>[] = [
  { key: "name", header: "Name" },
  { key: "description", header: "Description" },
];

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setShowForm(false);
      setName("");
      setDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Locations</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
        >
          {showForm ? "Cancel" : "New Location"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ name, description: description || undefined });
          }}
          className="bg-white p-4 rounded-lg shadow mb-6 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Location name (e.g. Aisle 4, Shelf B)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
        data={locations}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onDelete={(item) => deleteMutation.mutate(item.id)}
      />
    </div>
  );
}
