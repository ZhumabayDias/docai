import { Circle, LoaderCircle } from "lucide-react";

import type { DeploymentStatus } from "../types/project";
import { cn } from "../utils/cn";

type StatusBadgeProps = {
  status: DeploymentStatus;
};

const statusStyles: Record<DeploymentStatus, string> = {
  CREATED: "border-accent-blue/30 bg-accent-blue/10 text-accent-blue",
  BUILDING: "border-accent-amber/30 bg-accent-amber/10 text-accent-amber",
  RUNNING: "border-accent-green/30 bg-accent-green/10 text-accent-green",
  FAILED: "border-accent-red/30 bg-accent-red/10 text-accent-red",
  STOPPED: "border-brand-muted/30 bg-surface-subtle text-brand-muted",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const Icon = status === "BUILDING" ? LoaderCircle : Circle;

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full border px-3 text-xs font-bold",
        statusStyles[status],
      )}
    >
      <Icon className={cn("h-3 w-3", status === "BUILDING" && "animate-spin")} />
      {status}
    </span>
  );
}
