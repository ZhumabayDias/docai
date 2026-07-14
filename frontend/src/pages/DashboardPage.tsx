import { useState } from "react";
import { Activity, Github, Rocket, Server } from "lucide-react";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ProjectCard } from "../components/ProjectCard";
import { RepositoryImportModal } from "../components/RepositoryImportModal";
import { deployProject } from "../services/projects";
import { useProjects } from "../hooks/useProjects";

export function DashboardPage() {
  const { projects, loading, error, refetch } = useProjects();
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isDeployingLatest, setIsDeployingLatest] = useState(false);
  const runningProjects = projects.filter((project) => project.status === "RUNNING").length;
  const buildingProjects = projects.filter((project) => project.status === "BUILDING").length;
  const latestProject = projects[0];

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

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-muted">Projects</p>
              <p className="mt-2 text-3xl font-extrabold text-brand">{projects.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-blue/10 text-accent-blue">
              <Server className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-muted">Running</p>
              <p className="mt-2 text-3xl font-extrabold text-brand">
                {runningProjects}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-green/10 text-accent-green">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-muted">Building</p>
              <p className="mt-2 text-3xl font-extrabold text-brand">
                {buildingProjects}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-amber/10 text-accent-amber">
              <Rocket className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand">Projects</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Imported repositories ready for build and deploy actions.
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
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card className="min-h-52 animate-pulse" key={index}>
                  <div className="h-5 w-2/3 rounded bg-surface-subtle" />
                  <div className="mt-3 h-4 w-full rounded bg-surface-subtle" />
                  <div className="mt-8 h-4 w-1/2 rounded bg-surface-subtle" />
                  <div className="mt-12 flex justify-between">
                    <div className="h-10 w-24 rounded-md bg-surface-subtle" />
                    <div className="h-10 w-24 rounded-md bg-surface-subtle" />
                  </div>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <p className="text-lg font-bold text-brand">No projects yet</p>
              <Button
                className="mt-4"
                icon={<Github className="h-4 w-4" />}
                onClick={() => {
                  setImportModalOpen(true);
                }}
              >
                Import Repository
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} onDelete={refetch} project={project} />
              ))}
            </div>
          )}
        </div>

        <Card className="h-fit">
          <div>
            <h2 className="text-lg font-bold text-brand">Deployment health</h2>
            <p className="mt-1 text-sm text-brand-muted">Current project state</p>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-brand-muted">Successful</span>
                <span className="font-semibold text-brand">
                  {projects.length === 0 ? "0%" : `${Math.round((runningProjects / projects.length) * 100)}%`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-accent-green"
                  style={{
                    width: projects.length === 0 ? "0%" : `${(runningProjects / projects.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="rounded-md border border-surface-border bg-surface-subtle p-4">
              <p className="text-sm font-semibold text-brand">Latest activity</p>
              <p className="mt-2 text-sm text-brand-muted">
                {latestProject
                  ? `${latestProject.repo_name} is ${latestProject.status.toLowerCase()}.`
                  : "No deployment activity yet."}
              </p>
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
