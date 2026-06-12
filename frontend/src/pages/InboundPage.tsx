import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inward } from "../api/inventory";
import { fetchItems } from "../api/masterData";
import { fetchLocations } from "../api/masterData";
import { fetchEntities } from "../api/masterData";
import AsyncSelect from "../components/AsyncSelect";
import FileUpload from "../components/FileUpload";
import type { ItemResponse, LocationResponse, EntityResponse } from "../types/api";

export default function InboundPage() {
  const queryClient = useQueryClient();
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [locationId, setLocationId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [reference, setReference] = useState("");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [expirationDate, setExpirationDate] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<{ batchNumber: string; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: inward,
    onSuccess: (data) => {
      setResult({
        batchNumber: data.batch.batch_number,
        message: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      // Reset form
      setItemId("");
      setQuantity("");
      setLocationId("");
      setSupplierId("");
      setReference("");
      setReceiptDate(new Date().toISOString().split("T")[0]);
      setExpirationDate("");
      setReceiptUrl(undefined);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemId || !quantity || !locationId || !supplierId) return;

    mutation.mutate({
      item_id: itemId,
      quantity: parseFloat(quantity),
      location_id: locationId,
      supplier_entity_id: supplierId,
      receipt_date: new Date(receiptDate).toISOString(),
      expiration_date: expirationDate ? new Date(expirationDate).toISOString() : undefined,
      reference: reference || undefined,
      receipt_url: receiptUrl,
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Goods Receipt (Inbound)</h1>

      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">{result.message}</p>
          <p className="text-sm">Batch: <span className="font-mono">{result.batchNumber}</span></p>
          <button
            onClick={() => setResult(null)}
            className="text-sm text-green-600 underline mt-1"
          >
            Receive another
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
          <AsyncSelect
            queryKey={["entities", "SUPPLIER"]}
            queryFn={() => fetchEntities("SUPPLIER")}
            value={supplierId}
            onChange={setSupplierId}
            placeholder="Select supplier..."
            mapOption={(item) => {
              const e = item as EntityResponse;
              return { id: e.id, label: e.name };
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
          <AsyncSelect
            queryKey={["items"]}
            queryFn={fetchItems}
            value={itemId}
            onChange={setItemId}
            placeholder="Select item..."
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
              placeholder="e.g. 1000"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference (PO #)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. PO-2026-001"
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt Date
            </label>
            <input
              type="date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>
        </div>

        <FileUpload onUploadComplete={(key) => setReceiptUrl(key)} />

        <button
          type="submit"
          disabled={mutation.isPending || !itemId || !quantity || !locationId || !supplierId}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Receiving goods..." : "Receive Goods"}
        </button>
      </form>
    </div>
  );
}
