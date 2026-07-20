import { useMemo, useState } from "react";
import { Github, Search } from "lucide-react";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ProjectsTable } from "../components/ProjectsTable";
import { RepositoryImportModal } from "../components/RepositoryImportModal";
import { useProjects } from "../hooks/useProjects";

export function ProjectsPage() {
  const { projects, loading, error, refetch } = useProjects();
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return projects;
    }

    return projects.filter((project) => project.repo_name.toLowerCase().includes(normalizedSearch));
  }, [projects, searchTerm]);

  const openImportModal = () => {
    setImportModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-brand">Projects</h2>
          <p className="mt-2 text-sm text-brand-muted">Manage your deployed applications.</p>
        </div>
        <Button icon={<Github className="h-4 w-4" />} onClick={openImportModal}>
          Import Project
        </Button>
      </section>

      <section className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <input
          className="h-10 w-full rounded-md border border-surface-border bg-surface-subtle pl-9 pr-3 text-sm text-brand placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-muted/40"
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
          placeholder="Search projects..."
          type="text"
          value={searchTerm}
        />
      </section>

      <section>
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
          <Card className="flex min-h-72 items-center justify-center">
            <LoadingSpinner />
          </Card>
        ) : projects.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 py-14 text-center">
            <div>
              <p className="text-lg font-bold text-brand">No projects yet</p>
              <p className="mt-2 text-sm text-brand-muted">
                Import your first GitHub repository to deploy it with Docai Cloud.
              </p>
            </div>
            <Button icon={<Github className="h-4 w-4" />} onClick={openImportModal}>
              Import Project
            </Button>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-sm text-brand-muted">No projects match "{searchTerm}".</p>
          </Card>
        ) : (
          <ProjectsTable projects={filteredProjects} />
        )}
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
