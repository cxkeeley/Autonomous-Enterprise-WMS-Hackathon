import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transfer } from "../api/inventory";
import { fetchItems, fetchLocations } from "../api/masterData";
import AsyncSelect from "../components/AsyncSelect";
import type { ItemResponse, LocationResponse } from "../types/api";

export default function ProductionPage() {
  const queryClient = useQueryClient();
  const [sourceItemId, setSourceItemId] = useState("");
  const [destItemId, setDestItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [locationId, setLocationId] = useState("");
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<{ message: string; transactions: { batch_number: string; type: string; qty: number }[] } | null>(null);

  const mutation = useMutation({
    mutationFn: transfer,
    onSuccess: (data) => {
      setResult({
        message: data.message,
        transactions: data.transactions.map((t) => ({
          batch_number: t.batch_number,
          type: t.transaction_type,
          qty: t.quantity,
        })),
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setSourceItemId("");
      setDestItemId("");
      setQuantity("");
      setLocationId("");
      setReference("");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceItemId || !destItemId || !quantity || !locationId) return;
    mutation.mutate({
      source_item_id: sourceItemId,
      destination_item_id: destItemId,
      quantity: parseFloat(quantity),
      location_id: locationId,
      reference: reference || undefined,
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Production Transfer</h1>
      <p className="text-sm text-gray-500 mb-4">
        Convert WIP (Work In Progress) into Finished Goods.
      </p>

      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">{result.message}</p>
          <ul className="text-sm mt-1 list-disc list-inside">
            {result.transactions.map((t, i) => (
              <li key={i}>
                <span className="font-mono">{t.type}</span> — Batch {t.batch_number}: {t.qty.toFixed(2)} units
              </li>
            ))}
          </ul>
          <button
            onClick={() => setResult(null)}
            className="text-sm text-green-600 underline mt-1"
          >
            New Transfer
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source Item (WIP)
          </label>
          <AsyncSelect
            queryKey={["items", "WIP"]}
            queryFn={() => fetchItems()}
            value={sourceItemId}
            onChange={setSourceItemId}
            placeholder="Select WIP item..."
            mapOption={(item) => {
              const i = item as ItemResponse;
              return { id: i.id, label: `${i.sku} — ${i.name} (${i.type})` };
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Item (Finished Good)
          </label>
          <AsyncSelect
            queryKey={["items", "FG"]}
            queryFn={() => fetchItems()}
            value={destItemId}
            onChange={setDestItemId}
            placeholder="Select finished good..."
            mapOption={(item) => {
              const i = item as ItemResponse;
              return { id: i.id, label: `${i.sku} — ${i.name} (${i.type})` };
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              placeholder="e.g. 100"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. WO-2026-001"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination Location</label>
          <AsyncSelect
            queryKey={["locations"]}
            queryFn={fetchLocations}
            value={locationId}
            onChange={setLocationId}
            placeholder="Select location..."
            mapOption={(item) => {
              const l = item as LocationResponse;
              return { id: l.id, label: l.name };
            }}
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || !sourceItemId || !destItemId || !quantity || !locationId}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Transferring..." : "Complete Production Transfer"}
        </button>
      </form>
    </div>
  );
}
