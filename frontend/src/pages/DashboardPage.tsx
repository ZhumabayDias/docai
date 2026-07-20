import { useMemo, useState } from "react";
import { Activity, Box, Github, PackageOpen, Rocket, Server, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { RepositoryImportModal } from "../components/RepositoryImportModal";
import { StatisticCard } from "../components/StatisticCard";
import { StatusBadge } from "../components/StatusBadge";
import { useProjects } from "../hooks/useProjects";
import { formatRelativeTime } from "../utils/date";

export function DashboardPage() {
  const { projects, loading, error, refetch } = useProjects();
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const runningProjects = projects.filter((project) => project.status === "RUNNING").length;
  const buildingProjects = projects.filter((project) => project.status === "BUILDING").length;
  const failedProjects = projects.filter((project) => project.status === "FAILED").length;
  const consideredProjects = runningProjects + failedProjects;
  const healthPercent =
    consideredProjects === 0 ? null : Math.round((runningProjects / consideredProjects) * 100);

  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort(
          (left, right) =>
            new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
        )
        .slice(0, 5),
    [projects],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-accent-green">Production</p>
          <h2 className="mt-2 text-3xl font-extrabold text-brand">Overview</h2>
        </div>
        <Button
          icon={<Github className="h-4 w-4" />}
          onClick={() => {
            setImportModalOpen(true);
          }}
        >
          Import Project
        </Button>
      </section>

      {loading ? (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card className="h-[110px] animate-pulse" key={index}>
              <div className="h-4 w-20 rounded bg-surface-subtle" />
              <div className="mt-5 h-8 w-12 rounded bg-surface-subtle" />
            </Card>
          ))}
        </section>
      ) : error ? (
        <Card className="border-accent-red/30 bg-accent-red/10 text-accent-red">
          <p className="font-semibold">Unable to load dashboard data.</p>
          <p className="mt-2 text-sm">{error}</p>
          <Button className="mt-4" onClick={() => void refetch()} variant="secondary">
            Retry
          </Button>
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatisticCard accent="blue" icon={Server} label="Projects" value={projects.length} />
            <StatisticCard accent="green" icon={Activity} label="Running" value={runningProjects} />
            <StatisticCard accent="amber" icon={Rocket} label="Building" value={buildingProjects} />
            <StatisticCard accent="blue" icon={Box} label="Containers" value={runningProjects} />
            <StatisticCard accent="red" icon={XCircle} label="Failed" value={failedProjects} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-brand">Recent Projects</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Your most recently imported projects and their current state.
                </p>
              </div>

              {recentProjects.length === 0 ? (
                <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <PackageOpen className="h-8 w-8 text-brand-muted" />
                  <p className="text-sm font-semibold text-brand-muted">No projects yet.</p>
                  <Button onClick={() => setImportModalOpen(true)}>Import Project</Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <Link
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-surface-border bg-surface-subtle px-4 py-3 transition hover:border-brand-muted/50"
                      key={project.id}
                      to={`/projects/${project.id}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-brand">{project.repo_name}</p>
                        <p className="mt-1 text-xs text-brand-muted">
                          Imported {formatRelativeTime(project.created_at)}
                        </p>
                      </div>
                      <StatusBadge status={project.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Card className="h-fit">
              <div>
                <h2 className="text-lg font-bold text-brand">Project Health</h2>
                <p className="mt-1 text-sm text-brand-muted">Current deployed project state</p>
              </div>
              <div className="mt-6 space-y-5">
                {healthPercent === null ? (
                  <div className="rounded-md border border-surface-border bg-surface-subtle p-4">
                    <p className="text-sm font-semibold text-brand">No active deployment data</p>
                    <p className="mt-1 text-xs text-brand-muted">
                      Health is available when a project is running or failed.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-brand-muted">Healthy</span>
                      <span className="font-semibold text-brand">{healthPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
                      <div
                        className="h-full rounded-full bg-accent-green transition-[width]"
                        style={{ width: `${healthPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-surface-border bg-surface-subtle p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
                      Running
                    </p>
                    <p className="mt-2 text-xl font-bold text-brand">{runningProjects}</p>
                  </div>
                  <div className="rounded-md border border-surface-border bg-surface-subtle p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
                      Failed
                    </p>
                    <p className="mt-2 text-xl font-bold text-brand">{failedProjects}</p>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </>
      )}

      <RepositoryImportModal
        onClose={() => setImportModalOpen(false)}
        onImported={refetch}
        open={isImportModalOpen}
      />
    </div>
  );
}
