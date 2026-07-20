import { Check, LoaderCircle, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { DeploymentRunStatus } from "../types/deployment";
import { cn } from "../utils/cn";

type StatusPresentation = {
  label: string;
  icon: LucideIcon;
  className: string;
};

const statusPresentation: Record<DeploymentRunStatus, StatusPresentation> = {
  SUCCESS: {
    label: "Success",
    icon: Check,
    className: "border-accent-green/30 bg-accent-green/10 text-accent-green",
  },
  FAILED: {
    label: "Failed",
    icon: X,
    className: "border-accent-red/30 bg-accent-red/10 text-accent-red",
  },
  BUILDING: {
    label: "Building",
    icon: LoaderCircle,
    className: "border-accent-amber/30 bg-accent-amber/10 text-accent-amber",
  },
};

type DeploymentStatusBadgeProps = {
  status: DeploymentRunStatus;
};

export function DeploymentStatusBadge({ status }: DeploymentStatusBadgeProps) {
  const { label, icon: Icon, className } = statusPresentation[status];

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full border px-3 text-xs font-bold",
        className,
      )}
    >
      <Icon className={cn("h-3 w-3", status === "BUILDING" && "animate-spin")} />
      {label}
    </span>
  );
}
