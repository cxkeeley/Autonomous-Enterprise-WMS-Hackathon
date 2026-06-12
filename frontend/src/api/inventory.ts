import type {
  InwardRequest,
  InwardResponse,
  InventoryItem,
  InventorySummary,
  FifoSuggestionItem,
  OutwardRequest,
  OutwardResponse,
} from "../types/api";
import apiClient from "./client";

export async function inward(data: InwardRequest): Promise<InwardResponse> {
  const response = await apiClient.post<InwardResponse>("/inventory/inward", data);
  return response.data;
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const response = await apiClient.get<InventoryItem[]>("/inventory/");
  return response.data;
}

export async function fetchInventorySummary(): Promise<InventorySummary[]> {
  const response = await apiClient.get<InventorySummary[]>("/inventory/summary");
  return response.data;
}

export async function fetchTransactions(limit = 100, offset = 0) {
  const response = await apiClient.get("/inventory/transactions", {
    params: { limit, offset },
  });
  return response.data;
}

export async function fetchFifoSuggestion(
  itemId: string,
  quantity: number
): Promise<FifoSuggestionItem[]> {
  const response = await apiClient.get<FifoSuggestionItem[]>("/inventory/fifo-suggestion", {
    params: { item_id: itemId, quantity },
  });
  return response.data;
}

export async function outward(data: OutwardRequest): Promise<OutwardResponse> {
  const response = await apiClient.post<OutwardResponse>("/inventory/outward", data);
  return response.data;
}
