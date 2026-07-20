import { useState } from "react";
import { ArrowLeft, History, Layers, Rocket, SlidersHorizontal, Terminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DeploymentCard } from "../components/DeploymentCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { MetadataItem } from "../components/MetadataItem";
import { StatusBadge } from "../components/StatusBadge";
import { Tabs } from "../components/Tabs";
import type { TabItem } from "../components/Tabs";
import { deleteProject, deployProject } from "../services/projects";
import { useProject } from "../hooks/useProject";
import { formatDateTime } from "../utils/date";

const tabs: TabItem[] = [
  { key: "overview", label: "Overview" },
  { key: "deployments", label: "Deployments" },
  { key: "environment", label: "Environment" },
  { key: "logs", label: "Logs" },
  { key: "settings", label: "Settings" },
];

// The remaining tabs aren't implemented yet (see PR description). Each maps
// to a "Coming soon" empty state instead of duplicating that JSX per tab.
const comingSoonConfig: Record<string, { icon: LucideIcon; description: string }> = {
  deployments: {
    icon: History,
    description: "Deployment history will be available in an upcoming release.",
  },
  environment: {
    icon: Layers,
    description: "Environment variable management will be available in an upcoming release.",
  },
  logs: {
    icon: Terminal,
    description: "Build and runtime logs will be available in an upcoming release.",
  },
  settings: {
    icon: SlidersHorizontal,
    description: "Project settings will be available in an upcoming release.",
  },
};

export function ProjectDetailsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const parsedProjectId = Number(projectId);
  const safeProjectId = Number.isInteger(parsedProjectId) ? parsedProjectId : null;
  const { error, loading, notFound, project, refetch } = useProject(safeProjectId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<"deploy" | "delete" | null>(null);
  const [activeTabId, setActiveTabId] = useState(tabs[0].key);

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
      navigate("/projects");
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
              navigate("/projects");
            }}
            variant="secondary"
          >
            Return to Projects
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
              navigate("/projects");
            }}
            variant="secondary"
          >
            Return to Projects
          </Button>
        </Card>
      </div>
    );
  }

  const comingSoon = comingSoonConfig[activeTabId];

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

        <div className="flex flex-wrap gap-3">
          <Button
            icon={<Rocket className="h-4 w-4" />}
            disabled={actionInProgress !== null}
            onClick={() => {
              void handleDeploy();
            }}
          >
            {actionInProgress === "deploy" ? "Deploying..." : "Deploy"}
          </Button>
          <Button
            className="text-accent-red hover:bg-accent-red/10 hover:text-accent-red"
            disabled={actionInProgress !== null}
            onClick={() => {
              void handleDelete();
            }}
            variant="ghost"
          >
            {actionInProgress === "delete" ? "Deleting..." : "Delete"}
          </Button>
          <Button
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => {
              navigate("/projects");
            }}
            variant="secondary"
          >
            Back to Projects
          </Button>
        </div>
      </section>

      {actionError ? (
        <Card className="border-accent-red/30 bg-accent-red/10 text-accent-red">
          <p className="font-semibold">Action failed</p>
          <p className="mt-2 text-sm">{actionError}</p>
        </Card>
      ) : null}

      <Tabs activeTab={activeTabId} onChange={setActiveTabId} tabs={tabs} />

      {activeTabId === "overview" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="h-fit">
            <h3 className="text-lg font-bold text-brand">General</h3>
            <dl className="mt-5 space-y-4">
              <MetadataItem label="Project Name" value={project.repo_name} />
              <MetadataItem label="Created At" value={formatDateTime(project.created_at)} />
              <MetadataItem label="Last Updated" value={formatDateTime(project.updated_at)} />
            </dl>
          </Card>

          <Card className="h-fit">
            <h3 className="text-lg font-bold text-brand">Repository</h3>
            <dl className="mt-5 space-y-4">
              <MetadataItem label="Repository" value={project.repo_full_name} />
              <MetadataItem label="Default Branch" value={project.default_branch} />
              <MetadataItem label="Visibility" value={project.private ? "Private" : "Public"} />
            </dl>
          </Card>

          {/* The backend does not expose a container port on the project
              detail response yet, so DeploymentCard falls back to
              "Not available" rather than showing mock data. */}
          <DeploymentCard deploymentUrl={project.deployment_url} status={project.status} />
        </div>
      ) : comingSoon ? (
        <EmptyState description={comingSoon.description} icon={comingSoon.icon} title="Coming soon" />
      ) : null}
    </div>
  );
}

function getFriendlyActionError(error: unknown, action: "deploy" | "delete") {
  if (action === "delete") {
    return "Failed to delete project.";
  }

  return "Failed to deploy project.";
}
