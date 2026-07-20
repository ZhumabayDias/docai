import type { RecentDeployment } from "../types/deployment";

// The backend does not yet expose a deployment-history endpoint, so the
// Dashboard's "Recent Deployments" section is seeded with mock data. Swap
// this out for a real API call (e.g. `getRecentDeployments()`) once that
// endpoint exists — the shape of `RecentDeployment` is designed to match
// what such an endpoint would realistically return.
function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const mockRecentDeployments: RecentDeployment[] = [
  {
    id: "dep_1",
    projectName: "docai-test-react",
    status: "SUCCESS",
    branch: "main",
    commitHash: "c35a9bc",
    deployedAt: minutesAgo(2),
  },
  {
    id: "dep_2",
    projectName: "docai-cloud-landing",
    status: "BUILDING",
    branch: "feature/pricing-page",
    commitHash: "9f21ab4",
    deployedAt: minutesAgo(18),
  },
  {
    id: "dep_3",
    projectName: "docai-api-gateway",
    status: "FAILED",
    branch: "main",
    commitHash: "1e07d3f",
    deployedAt: minutesAgo(54),
  },
];
