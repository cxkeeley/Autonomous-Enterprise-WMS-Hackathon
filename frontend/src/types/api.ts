// Shared API response types — no `any` types allowed

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  username: string;
  role: "ADMIN" | "MANAGER" | "OPERATOR";
  created_at: string | null;
}

export interface ItemResponse {
  id: string;
  sku: string;
  name: string;
  type: "RAW_MATERIAL" | "WIP" | "FINISHED_GOOD";
  uom: string;
  created_at: string | null;
}

export interface ItemCreate {
  sku: string;
  name: string;
  type: "RAW_MATERIAL" | "WIP" | "FINISHED_GOOD";
  uom: string;
}

export interface LocationResponse {
  id: string;
  name: string;
  description: string | null;
}

export interface LocationCreate {
  name: string;
  description?: string;
}

export interface EntityResponse {
  id: string;
  name: string;
  type: "SUPPLIER" | "CUSTOMER";
}

export interface EntityCreate {
  name: string;
  type: "SUPPLIER" | "CUSTOMER";
}

export interface UploadResponse {
  object_key: string;
  message: string;
}

// ── Inventory ──

export interface InwardRequest {
  item_id: string;
  quantity: number;
  location_id: string;
  supplier_entity_id: string;
  receipt_date: string;
  expiration_date?: string;
  reference?: string;
  receipt_url?: string;
}

export interface InwardResponse {
  batch: BatchResponse;
  message: string;
}

export interface BatchResponse {
  id: string;
  batch_number: string;
  item_id: string;
  location_id: string;
  initial_quantity: number;
  current_quantity: number;
  receipt_date: string;
  expiration_date: string | null;
  created_at: string | null;
}

export interface InventoryItem {
  item_id: string;
  item_sku: string;
  item_name: string;
  item_type: string;
  batch_id: string;
  batch_number: string;
  location_id: string;
  location_name: string;
  current_quantity: number;
  expiration_date: string | null;
}

export interface InventorySummary {
  item_id: string;
  item_sku: string;
  item_name: string;
  item_type: string;
  total_quantity: number;
  batch_count: number;
  location_count: number;
}
