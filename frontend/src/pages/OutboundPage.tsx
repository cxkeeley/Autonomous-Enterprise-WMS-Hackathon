import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFifoSuggestion, outward } from "../api/inventory";
import { fetchItems } from "../api/masterData";
import { fetchEntities } from "../api/masterData";
import AsyncSelect from "../components/AsyncSelect";
import BatchSelector from "../components/BatchSelector";
import FileUpload from "../components/FileUpload";
import type { ItemResponse, EntityResponse, FifoSuggestionItem, BatchAllocation } from "../types/api";

export default function OutboundPage() {
  const queryClient = useQueryClient();
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [reference, setReference] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<FifoSuggestionItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [allocations, setAllocations] = useState<BatchAllocation[]>([]);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [result, setResult] = useState<{ transactions: { batch_number: string; quantity: number }[]; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: outward,
    onSuccess: (data) => {
      setResult({
        transactions: data.transactions.map((t) => ({
          batch_number: t.batch_number,
          quantity: t.quantity,
        })),
        message: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      // Reset form
      setItemId("");
      setQuantity("");
      setCustomerId("");
      setReference("");
      setReceiptUrl(undefined);
      setSuggestions([]);
      setAllocations([]);
    },
  });

  async function handleGetSuggestions() {
    if (!itemId || !quantity) return;
    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    setSuggestions([]);
    setAllocations([]);
    try {
      const data = await fetchFifoSuggestion(itemId, parseFloat(quantity));
      setSuggestions(data);
      // Auto-allocate all suggested quantities
      const autoAllocations: BatchAllocation[] = data.map((s) => ({
        batch_id: s.batch_id,
        batch_number: s.batch_number,
        quantity: s.suggested_quantity,
      }));
      setAllocations(autoAllocations);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response: { data: { detail?: string } } }).response?.data?.detail || "Failed to get suggestions")
          : "Failed to get suggestions";
      setSuggestionError(msg);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemId || !quantity || !customerId) return;

    mutation.mutate({
      item_id: itemId,
      quantity: parseFloat(quantity),
      customer_entity_id: customerId,
      reference: reference || undefined,
      receipt_url: receiptUrl,
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Outbound Dispatch</h1>

      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">{result.message}</p>
          <ul className="text-sm mt-1 list-disc list-inside">
            {result.transactions.map((t, i) => (
              <li key={i}>
                Batch <span className="font-mono">{t.batch_number}</span>: {t.quantity.toFixed(2)} units
              </li>
            ))}
          </ul>
          <button
            onClick={() => setResult(null)}
            className="text-sm text-green-600 underline mt-1"
          >
            New Dispatch
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <AsyncSelect
            queryKey={["entities", "CUSTOMER"]}
            queryFn={() => fetchEntities("CUSTOMER")}
            value={customerId}
            onChange={setCustomerId}
            placeholder="Select customer..."
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
              placeholder="e.g. 500"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference (DO #)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. DO-2026-001"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGetSuggestions}
            disabled={isLoadingSuggestions || !itemId || !quantity}
            className="w-full py-2 px-4 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingSuggestions ? "Calculating..." : "Get FIFO Suggestions"}
          </button>
        </div>

        {suggestionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {suggestionError}
          </div>
        )}

        <BatchSelector
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          onSelect={setAllocations}
        />

        <FileUpload onUploadComplete={(key) => setReceiptUrl(key)} />

        <button
          type="submit"
          disabled={mutation.isPending || !itemId || !quantity || !customerId || suggestions.length === 0}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Dispatching..." : "Dispatch Goods"}
        </button>
      </form>
    </div>
  );
}
