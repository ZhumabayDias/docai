import { GitBranch, Lock, Unlock } from "lucide-react";

import type { Project } from "../types/project";
import { formatDateTime } from "../utils/date";
import { Card } from "./Card";

type ProjectInfoCardProps = {
  project: Project;
};

export function ProjectInfoCard({ project }: ProjectInfoCardProps) {
  const VisibilityIcon = project.private ? Lock : Unlock;

  return (
    <Card className="h-fit">
      <h3 className="text-lg font-bold text-brand">Repository</h3>
      <div className="mt-5 space-y-4 text-sm text-brand-muted">
        <div className="flex items-center gap-3">
          <GitBranch className="h-4 w-4 text-accent-blue" />
          <span>{project.default_branch ?? "No default branch"}</span>
        </div>
        <div className="flex items-center gap-3">
          <VisibilityIcon className="h-4 w-4 text-accent-green" />
          <span>{project.private ? "Private repository" : "Public repository"}</span>
        </div>
        <div className="rounded-md border border-surface-border bg-surface-subtle p-4">
          <p className="font-semibold text-brand">Created</p>
          <p className="mt-1">{formatDateTime(project.created_at)}</p>
        </div>
      </div>
    </Card>
  );
}
