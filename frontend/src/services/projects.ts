import { api } from "./api";
import type {
  GitHubRepository,
  Project,
  ProjectDetailResponse,
  ProjectImportRequest,
} from "../types/project";

export async function getProjects() {
  const response = await api.get<Project[]>("/api/projects");
  return response.data;
}

export async function getProject(id: number) {
  const response = await api.get<ProjectDetailResponse>(`/api/projects/${id}`);
  return response.data;
}

export async function importProject(repositoryId: number) {
  const payload: ProjectImportRequest = { repo_id: repositoryId };
  const response = await api.post<Project>("/api/projects/import", payload);
  return response.data;
}

export async function getRepositories() {
  const response = await api.get<GitHubRepository[]>("/api/projects/repositories");
  return response.data;
}

export async function deployProject(projectId: number) {
  const response = await api.post<ProjectDetailResponse>(`/api/projects/${projectId}/deploy`);
  return response.data;
}


export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/api/projects/${id}`);
}
