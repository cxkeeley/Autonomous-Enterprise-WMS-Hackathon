import type { LoginRequest, TokenResponse, UserResponse } from "../types/api";
import apiClient from "./client";

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/auth/login", data);
  return response.data;
}

export async function getMe(): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>("/users/me");
  return response.data;
}
