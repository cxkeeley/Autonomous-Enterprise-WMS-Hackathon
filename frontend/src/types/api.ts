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
