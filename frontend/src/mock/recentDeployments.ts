import type { RecentDeployment } from "../types/deployment";

// Kept for compatibility with any legacy imports. Production Dashboard data now comes
// exclusively from the authenticated projects API and does not use mock deployments.
export const mockRecentDeployments: RecentDeployment[] = [];
