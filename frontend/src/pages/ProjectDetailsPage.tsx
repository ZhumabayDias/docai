import { useState } from "react";
import { ArrowLeft, Rocket } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DeploymentCard } from "../components/DeploymentCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatusBadge } from "../components/StatusBadge";
import { deleteProject, deployProject } from "../services/projects";
import { useProject } from "../hooks/useProject";
import { formatDateTime } from "../utils/date";

export function ProjectDetailsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const parsedProjectId = Number(projectId);
  const safeProjectId = Number.isInteger(parsedProjectId) ? parsedProjectId : null;
  const { error, loading, notFound, project, refetch } = useProject(safeProjectId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<"deploy" | "delete" | null>(null);

  const handleDeploy = async () => {
    if (project === null) {
      return;
    }

    setActionError(null);
    setActionInProgress("deploy");

    try {
      await deployProject(project.id);
      await refetch();
    } catch (caughtError) {
      setActionError(getFriendlyActionError(caughtError, "deploy"));
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async () => {
    if (project === null) {
      return;
    }

    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setActionInProgress("delete");

    try {
      await deleteProject(project.id);
      navigate("/dashboard");
    } catch (caughtError) {
      setActionError(getFriendlyActionError(caughtError, "delete"));
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="flex min-h-72 items-center justify-center">
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="space-y-4">
          <h2 className="text-xl font-bold text-brand">Project not found</h2>
          <p className="text-sm text-brand-muted">
            The project does not exist or you do not have access to it.
          </p>
          <Button
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => {
              navigate("/dashboard");
            }}
            variant="secondary"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (error || project === null) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="border-accent-red/30 bg-accent-red/10 text-accent-red">
          <p className="font-semibold">Could not load project</p>
          <p className="mt-2 text-sm">{error ?? "Project data is unavailable."}</p>
          <Button
            className="mt-4"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => {
              navigate("/dashboard");
            }}
            variant="secondary"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-accent-green">Project</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="truncate text-3xl font-extrabold text-brand">{project.repo_name}</h2>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-2 truncate text-sm text-brand-muted">{project.repo_full_name}</p>
        </div>

        <Button
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => {
            navigate("/dashboard");
          }}
          variant="secondary"
        >
          Back to Dashboard
        </Button>
      </section>

      {actionError ? (
        <Card className="border-accent-red/30 bg-accent-red/10 text-accent-red">
          <p className="font-semibold">Action failed</p>
          <p className="mt-2 text-sm">{actionError}</p>
        </Card>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <Card>
          <h3 className="text-lg font-bold text-brand">Repository Information</h3>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoItem label="Repository full name" value={project.repo_full_name} />
            <InfoItem label="Default branch" value={project.default_branch} />
            <InfoItem label="Visibility" value={project.private ? "Private" : "Public"} />
            <InfoItem label="Created at" value={formatDateTime(project.created_at)} />
            <InfoItem label="Project ID" value={project.id} />
            <InfoItem label="Clone URL" value={project.clone_url} />
          </dl>
        </Card>

        <div className="space-y-4">
          <DeploymentCard deploymentUrl={project.deployment_url} status={project.status} />

          <Card className="h-fit">
            <h3 className="text-lg font-bold text-brand">Actions</h3>
            <div className="mt-5 space-y-3">
              <Button
                className="w-full"
                icon={<Rocket className="h-4 w-4" />}
                disabled={actionInProgress !== null}
                onClick={() => {
                  void handleDeploy();
                }}
              >
                {actionInProgress === "deploy" ? "Deploying..." : "Deploy"}
              </Button>
              <Button
                className="w-full text-accent-red hover:bg-accent-red/10 hover:text-accent-red"
                disabled={actionInProgress !== null}
                onClick={() => {
                  void handleDelete();
                }}
                variant="ghost"
              >
                {actionInProgress === "delete" ? "Deleting..." : "Delete"}
              </Button>
              <Button
                className="w-full"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => {
                  navigate("/dashboard");
                }}
                variant="secondary"
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

type InfoItemProps = {
  label: string;
  value: string | number;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold text-brand">{value}</dd>
    </div>
  );
}

function getFriendlyActionError(error: unknown, action: "deploy" | "delete") {
  if (action === "delete") {
    return "Failed to delete project.";
  }

  return "Failed to deploy project.";
}