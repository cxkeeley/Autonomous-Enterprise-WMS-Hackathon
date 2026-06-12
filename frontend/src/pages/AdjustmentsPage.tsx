import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adjust, fetchBatches } from "../api/inventory";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import type { BatchResponse } from "../types/api";

export default function AdjustmentsPage() {
  const queryClient = useQueryClient();
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<{
    batchNumber: string;
    oldQty: number;
    newQty: number;
    diff: number;
    message: string;
  } | null>(null);

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: fetchBatches,
  });

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  const mutation = useMutation({
    mutationFn: adjust,
    onSuccess: (data) => {
      setResult({
        batchNumber: data.batch_number,
        oldQty: data.old_quantity,
        newQty: data.new_quantity,
        diff: data.difference,
        message: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setSelectedBatchId("");
      setNewQuantity("");
      setReason("");
      setReference("");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBatchId || !newQuantity || !reason) return;
    mutation.mutate({
      batch_id: selectedBatchId,
      new_quantity: parseFloat(newQuantity),
      reason,
      reference: reference || undefined,
    });
  }

  const columns: Column<BatchResponse>[] = [
    { key: "batch_number", header: "Batch" },
    {
      key: "current_quantity",
      header: "Current Qty",
      render: (b) => b.current_quantity.toFixed(2),
    },
    {
      key: "expiration_date",
      header: "Expires",
      render: (b) => (b.expiration_date ? new Date(b.expiration_date).toLocaleDateString() : "—"),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Inventory Adjustments</h1>
      <p className="text-sm text-gray-500 mb-4">
        Correct inventory discrepancies — shrinkage, damage, or cycle count fixes.
      </p>

      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">{result.message}</p>
          <p className="text-sm mt-1">
            Batch <span className="font-mono">{result.batchNumber}</span>:{" "}
            {result.oldQty.toFixed(2)} → {result.newQty.toFixed(2)} ({result.diff >= 0 ? "+" : ""}{result.diff.toFixed(2)})
          </p>
          <button
            onClick={() => setResult(null)}
            className="text-sm text-green-600 underline mt-1"
          >
            New Adjustment
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch list */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Select Batch</h2>
          <DataTable
            columns={columns}
            data={batches}
            keyExtractor={(b) => b.id}
            isLoading={isLoading}
          />
        </div>

        {/* Adjustment form */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Adjustment Details</h2>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  const batch = batches.find((b) => b.id === e.target.value);
                  if (batch) setNewQuantity(String(batch.current_quantity));
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
              >
                <option value="">Select a batch...</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_number} (Qty: {b.current_quantity.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {selectedBatch && (
              <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
                <p>Current quantity: <span className="font-semibold">{selectedBatch.current_quantity.toFixed(2)}</span></p>
                <p>Location: <span className="font-semibold">{selectedBatch.location_id}</span></p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Quantity
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                required
                placeholder="0"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
              >
                <option value="">Select reason...</option>
                <option value="DAMAGE">Damage</option>
                <option value="SHRINKAGE">Shrinkage</option>
                <option value="CYCLE_COUNT">Cycle Count Correction</option>
                <option value="RETURN">Return</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. CC-2026-001"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || !selectedBatchId || !newQuantity || !reason}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Applying..." : "Apply Adjustment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
