import { api } from "./api";
import type { GitHubProfile } from "../types/profile";

export async function getProfile() {
  const response = await api.get<GitHubProfile>("/api/profile");
  return response.data;
}
