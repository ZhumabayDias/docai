export type DeploymentRunStatus = "SUCCESS" | "FAILED" | "BUILDING";

export interface RecentDeployment {
  id: string;
  projectName: string;
  status: DeploymentRunStatus;
  branch: string;
  commitHash: string;
  deployedAt: string;
}

const deploymentStatusDescriptions: Record<DeploymentRunStatus, string> = {
  SUCCESS: "Successful",
  FAILED: "Failed",
  BUILDING: "Building",
};

export function describeDeploymentStatus(status: DeploymentRunStatus): string {
  return deploymentStatusDescriptions[status];
}
