import { useState } from "react";
import { Activity, Box, Github, PackageOpen, Rocket, Server, UploadCloud } from "lucide-react";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { RecentDeploymentItem } from "../components/RecentDeploymentItem";
import { RepositoryImportModal } from "../components/RepositoryImportModal";
import { StatisticCard } from "../components/StatisticCard";
import { mockRecentDeployments } from "../mock/recentDeployments";
import { describeDeploymentStatus } from "../types/deployment";
import { deployProject } from "../services/projects";
import { formatRelativeTime } from "../utils/date";
import { useProjects } from "../hooks/useProjects";

// The backend does not yet expose an endpoint for a deployments-today
// total, so this stat is mocked. Containers is derived from the real
// running-project count (one container per running deployment).
const MOCK_DEPLOYMENTS_TODAY = 0;

export function DashboardPage() {
  const { projects, loading, error, refetch } = useProjects();
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isDeployingLatest, setIsDeployingLatest] = useState(false);
  const runningProjects = projects.filter((project) => project.status === "RUNNING").length;
  const buildingProjects = projects.filter((project) => project.status === "BUILDING").length;
  const latestProject = projects[0];
  const latestDeployment = mockRecentDeployments[0];
  const successRate = projects.length === 0 ? 0 : Math.round((runningProjects / projects.length) * 100);

  const handleDeployLatest = async () => {
    if (latestProject === undefined) {
      return;
    }

    setIsDeployingLatest(true);
    try {
      await deployProject(latestProject.id);
      await refetch();
    } catch (caughtError) {
      console.error(caughtError);
      alert("Failed to deploy the latest project.");
    } finally {
      setIsDeployingLatest(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-accent-green">Production</p>
          <h2 className="mt-2 text-3xl font-extrabold text-brand">Overview</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            icon={<Github className="h-4 w-4" />}
            onClick={() => {
              setImportModalOpen(true);
            }}
          >
            Import Project
          </Button>
          <Button
            disabled={latestProject === undefined || isDeployingLatest}
            icon={<Rocket className="h-4 w-4" />}
            onClick={() => {
              void handleDeployLatest();
            }}
            variant="secondary"
          >
            {isDeployingLatest ? "Deploying..." : "Deploy Latest"}
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatisticCard accent="blue" icon={Server} label="Projects" value={projects.length} />
        <StatisticCard accent="green" icon={Activity} label="Running" value={runningProjects} />
        <StatisticCard accent="amber" icon={Rocket} label="Building" value={buildingProjects} />
        <StatisticCard accent="blue" icon={Box} label="Containers" value={runningProjects} />
        <StatisticCard
          accent="green"
          icon={UploadCloud}
          label="Deployments Today"
          value={MOCK_DEPLOYMENTS_TODAY}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand">Recent Deployments</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Latest build and release activity across your projects.
              </p>
            </div>
          </div>

          {error ? (
            <Card className="border-accent-red/30 bg-accent-red/10 text-accent-red">
              <p className="font-semibold">Could not load projects</p>
              <p className="mt-2 text-sm">{error}</p>
              <Button
                className="mt-4"
                onClick={() => {
                  void refetch();
                }}
                variant="secondary"
              >
                Retry
              </Button>
            </Card>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card className="h-20 animate-pulse" key={index}>
                  <div className="h-4 w-1/3 rounded bg-surface-subtle" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-surface-subtle" />
                </Card>
              ))}
            </div>
          ) : mockRecentDeployments.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <PackageOpen className="h-8 w-8 text-brand-muted" />
              <p className="text-sm font-semibold text-brand-muted">No deployments yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {mockRecentDeployments.map((deployment) => (
                <RecentDeploymentItem deployment={deployment} key={deployment.id} />
              ))}
            </div>
          )}
        </div>

        <Card className="h-fit">
          <div>
            <h2 className="text-lg font-bold text-brand">Deployment Health</h2>
            <p className="mt-1 text-sm text-brand-muted">Current project state</p>
          </div>
          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-brand-muted">Successful</span>
                <span className="font-semibold text-brand">{successRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-accent-green transition-[width]"
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>

            <div className="rounded-md border border-surface-border bg-surface-subtle p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
                Latest Deployment
              </p>
              {latestDeployment ? (
                <>
                  <p className="mt-2 text-sm font-semibold text-brand">
                    {describeDeploymentStatus(latestDeployment.status)}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">
                    {formatRelativeTime(latestDeployment.deployedAt)}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-brand-muted">No deployment activity yet.</p>
              )}
            </div>
          </div>
        </Card>
      </section>

      <RepositoryImportModal
        onClose={() => {
          setImportModalOpen(false);
        }}
        onImported={refetch}
        open={isImportModalOpen}
      />
    </div>
  );
}
