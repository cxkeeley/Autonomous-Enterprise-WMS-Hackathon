import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "../api/inventory";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";

interface Transaction {
  id: string;
  transaction_type: string;
  quantity: number;
  reference_id: string | null;
  batch_number: string | null;
  item_sku: string | null;
  item_name: string | null;
  performed_by: string | null;
  created_at: string;
}

const columns: Column<Transaction>[] = [
  {
    key: "created_at",
    header: "Date",
    render: (t) => new Date(t.created_at).toLocaleString(),
  },
  { key: "transaction_type", header: "Type" },
  { key: "item_sku", header: "SKU" },
  { key: "item_name", header: "Item" },
  { key: "batch_number", header: "Batch" },
  { key: "quantity", header: "Qty" },
  { key: "reference_id", header: "Reference" },
  { key: "performed_by", header: "Performed By" },
];

export default function LedgerPage() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetchTransactions(200, 0),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Transaction Ledger</h1>
      <p className="text-sm text-gray-500 mb-4">
        Complete audit trail of all inventory movements.
      </p>
      <DataTable
        columns={columns}
        data={transactions}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
      />
    </div>
  );
}
