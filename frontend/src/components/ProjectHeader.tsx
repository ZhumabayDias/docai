import { Github, Rocket } from "lucide-react";

import type { Project } from "../types/project";
import { Button } from "./Button";
import { StatusBadge } from "./StatusBadge";

type ProjectHeaderProps = {
  project: Project;
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-accent-green">Project</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="truncate text-3xl font-extrabold text-brand">{project.repo_name}</h2>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-2 truncate text-sm text-brand-muted">
          {project.repo_full_name ?? project.clone_url ?? project.repo_name}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button icon={<Github className="h-4 w-4" />} variant="secondary">
          Repository
        </Button>
        <Button
          icon={<Rocket className="h-4 w-4" />}
          onClick={() => {
            // TODO: Connect deployment action.
          }}
        >
          Deploy
        </Button>
      </div>
    </section>
  );
}
