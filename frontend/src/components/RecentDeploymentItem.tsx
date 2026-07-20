import { GitBranch } from "lucide-react";

import type { RecentDeployment } from "../types/deployment";
import { formatRelativeTime } from "../utils/date";
import { DeploymentStatusBadge } from "./DeploymentStatusBadge";

type RecentDeploymentItemProps = {
  deployment: RecentDeployment;
};

export function RecentDeploymentItem({ deployment }: RecentDeploymentItemProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-surface-border bg-surface-subtle px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-semibold text-brand">{deployment.projectName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
          <span className="inline-flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            {deployment.branch}
          </span>
          <code className="rounded bg-surface-base px-1.5 py-0.5 font-mono text-[11px] text-brand-muted">
            {deployment.commitHash}
          </code>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <DeploymentStatusBadge status={deployment.status} />
        <span className="text-xs text-brand-muted">{formatRelativeTime(deployment.deployedAt)}</span>
      </div>
    </div>
  );
}
