import { api } from "./api";
import type { AuthUser } from "../types/auth";

export async function getCurrentUser() {
  const response = await api.get<AuthUser>("/api/me");
  return response.data;
}

export async function logout() {
  await api.post("/api/logout");
}
