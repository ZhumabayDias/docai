export type DeploymentStatus = "CREATED" | "BUILDING" | "RUNNING" | "FAILED";

export interface Project {
  id: number;
  repo_name: string;
  status: DeploymentStatus;
  created_at: string;
  repo_id?: number;
  repo_full_name?: string;
  default_branch?: string;
  private?: boolean;
  clone_url?: string;
  updated_at?: string;
}

export interface ProjectDetailResponse {
  id: number;
  repo_name: string;
  repo_full_name: string;
  clone_url: string;
  default_branch: string;
  private: boolean;
  status: DeploymentStatus;
  created_at: string;
  updated_at: string;
}

export interface DeployProjectResponse {
  status: DeploymentStatus;
}

export interface ProjectImportRequest {
  repo_id: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  private: boolean;
  default_branch: string;
}
