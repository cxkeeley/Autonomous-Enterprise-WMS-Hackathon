import { useState, useMemo } from "react";
import type { FifoSuggestionItem } from "../types/api";

export interface BatchAllocation {
  batch_id: string;
  batch_number: string;
  quantity: number;
}

interface Props {
  suggestions: FifoSuggestionItem[];
  isLoading: boolean;
  onSelect: (allocations: BatchAllocation[]) => void;
}

export default function BatchSelector({ suggestions, isLoading, onSelect }: Props) {
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  const totalAllocated = useMemo(
    () => Object.values(allocations).reduce((sum, q) => sum + q, 0),
    [allocations]
  );

  const totalSuggested = useMemo(
    () => suggestions.reduce((sum, s) => sum + s.suggested_quantity, 0),
    [suggestions]
  );

  function handleQtyChange(batchId: string, maxQty: number, value: string) {
    const qty = Math.min(Math.max(0, parseFloat(value) || 0), maxQty);
    const next = { ...allocations, [batchId]: qty };
    if (qty <= 0) {
      delete next[batchId];
    }
    setAllocations(next);
    const result: BatchAllocation[] = Object.entries(next)
      .filter(([_, q]) => q > 0)
      .map(([id, q]) => {
        const batch = suggestions.find((s) => s.batch_id === id);
        return { batch_id: id, batch_number: batch?.batch_number ?? "", quantity: q };
      });
    onSelect(result);
  }

  if (isLoading) {
    return <p className="text-gray-500 py-2 text-sm">Calculating FIFO suggestions...</p>;
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          FIFO Picking Suggestions
        </label>
        <span className="text-xs text-gray-500">
          Allocated: {totalAllocated.toFixed(2)} / {totalSuggested.toFixed(2)}
        </span>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pick Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suggestions.map((s) => (
              <tr key={s.batch_id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs text-gray-700">{s.batch_number}</td>
                <td className="px-3 py-2 text-gray-700">{s.location_name}</td>
                <td className="px-3 py-2 text-gray-700">
                  {s.expiration_date
                    ? new Date(s.expiration_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">{s.available_quantity.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min="0"
                    max={s.suggested_quantity}
                    step="0.01"
                    value={allocations[s.batch_id] ?? ""}
                    onChange={(e) => handleQtyChange(s.batch_id, s.suggested_quantity, e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
