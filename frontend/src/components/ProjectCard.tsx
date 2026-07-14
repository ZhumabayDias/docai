import { useState } from "react";
import { GitBranch, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { deployProject, deleteProject } from "../services/projects";
import type { Project } from "../types/project";
import { Button } from "./Button";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";

type ProjectCardProps = {
  project: Project;
  onDelete: () => Promise<void>;
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const [isDeploying, setIsDeploying] = useState(false);
  const repository = project.repo_full_name ?? project.clone_url ?? project.repo_name;
  const branch = project.default_branch ?? "main";
  const createdAt = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(project.created_at));

  return (
    <Card
      className="flex min-h-52 cursor-pointer flex-col justify-between transition hover:-translate-y-0.5 hover:border-brand-muted"
      onClick={() => {
        navigate(`/projects/${project.id}`);
      }}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/projects/${project.id}`);
        }
      }}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-brand">{project.repo_name}</h3>
            <p className="mt-1 truncate text-sm text-brand-muted">{repository}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-brand-muted">
          <span className="inline-flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {branch}
          </span>
          <span>Imported {createdAt}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/projects/${project.id}`);
            }}
            variant="secondary"
          >
            Details
          </Button>
          <Button
            className="text-accent-red hover:bg-accent-red/10 hover:text-accent-red"
            onClick={async (event) => {
              event.stopPropagation();

              const confirmed = window.confirm("Delete this project?");
              if (!confirmed) {
                return;
              }

              try {
                await deleteProject(project.id);
                await onDelete();
              } catch (error) {
                console.error(error);
                alert("Failed to delete project.");
              }
            }}
            variant="ghost"
          >
            Delete
          </Button>
        </div>
        <Button
          icon={<Rocket className="h-4 w-4" />}
          disabled={isDeploying}
          onClick={async (event) => {
            event.stopPropagation();

            setIsDeploying(true);
            try {
              await deployProject(project.id);
              await onDelete();
            } catch (error) {
              console.error(error);
              alert("Failed to deploy project.");
            } finally {
              setIsDeploying(false);
            }
          }}
        >
          {isDeploying ? "Deploying..." : "Deploy"}
        </Button>
      </div>
    </Card>
  );
}
