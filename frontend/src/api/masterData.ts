import type { ItemResponse, ItemCreate, LocationResponse, LocationCreate, EntityResponse, EntityCreate } from "../types/api";
import apiClient from "./client";

// ── Items ──

export async function fetchItems(): Promise<ItemResponse[]> {
  const response = await apiClient.get<ItemResponse[]>("/items/");
  return response.data;
}

export async function createItem(data: ItemCreate): Promise<ItemResponse> {
  const response = await apiClient.post<ItemResponse>("/items/", data);
  return response.data;
}

export async function deleteItem(id: string): Promise<void> {
  await apiClient.delete(`/items/${id}`);
}

// ── Locations ──

export async function fetchLocations(): Promise<LocationResponse[]> {
  const response = await apiClient.get<LocationResponse[]>("/locations/");
  return response.data;
}

export async function createLocation(data: LocationCreate): Promise<LocationResponse> {
  const response = await apiClient.post<LocationResponse>("/locations/", data);
  return response.data;
}

export async function deleteLocation(id: string): Promise<void> {
  await apiClient.delete(`/locations/${id}`);
}

// ── Entities ──

export async function fetchEntities(type?: string): Promise<EntityResponse[]> {
  const params = type ? { type } : {};
  const response = await apiClient.get<EntityResponse[]>("/entities/", { params });
  return response.data;
}

export async function createEntity(data: EntityCreate): Promise<EntityResponse> {
  const response = await apiClient.post<EntityResponse>("/entities/", data);
  return response.data;
}

export async function deleteEntity(id: string): Promise<void> {
  await apiClient.delete(`/entities/${id}`);
}
