import { ExternalLink } from "lucide-react";

import type { DeploymentStatus } from "../types/project";
import { Button } from "./Button";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";

type DeploymentCardProps = {
  status: DeploymentStatus;
  deploymentUrl?: string | null;
};

export function DeploymentCard({ status, deploymentUrl }: DeploymentCardProps) {
  const hasDeploymentUrl = Boolean(deploymentUrl);
  const canOpenSite = status === "RUNNING" && hasDeploymentUrl;

  return (
    <Card className="h-fit">
      <h3 className="text-lg font-bold text-brand">Deployment</h3>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
            Status
          </p>
          <div className="mt-2">
            <StatusBadge status={status} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
            URL
          </p>
          {hasDeploymentUrl ? (

<a

  className="mt-2 block truncate text-sm font-semibold text-accent-blue hover:underline"

  href={deploymentUrl ?? undefined}

  target="_blank"

  rel="noreferrer"

>

  {deploymentUrl}

</a>

) : (

<p className="mt-2 text-sm text-brand-muted">

  No deployment available.

</p>

)}

</div>

        {canOpenSite ? (
          <Button
            className="w-full"
            icon={<ExternalLink className="h-4 w-4" />}
            onClick={() => {
              window.open(deploymentUrl as string, "_blank", "noopener,noreferrer");
            }}
          >
            Open Site
          </Button>
        ) : null}
      </div>
    </Card>
  );
}