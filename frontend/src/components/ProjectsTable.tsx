import { useNavigate } from "react-router-dom";

import type { Project } from "../types/project";
import { formatRelativeTime } from "../utils/date";
import { Button } from "./Button";
import { StatusBadge } from "./StatusBadge";

type ProjectsTableProps = {
  projects: Project[];
};

const columnHeaders = ["Project", "Repository", "Branch", "Status", "URL", "Last Deploy", "Actions"];

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-lg border border-surface-border bg-surface-raised shadow-glow">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-surface-border text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
            {columnHeaders.map((header) => (
              <th className={header === "Actions" ? "px-5 py-3 text-right" : "px-5 py-3"} key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {projects.map((project) => (
            <tr className="transition hover:bg-surface-subtle/60" key={project.id}>
              <td className="max-w-[220px] truncate px-5 py-4 font-semibold text-brand">
                {project.repo_name}
              </td>
              <td className="max-w-[220px] truncate px-5 py-4 text-brand-muted">
                {project.repo_full_name ?? project.repo_name}
              </td>
              <td className="px-5 py-4 text-brand-muted">{project.default_branch ?? "main"}</td>
              <td className="px-5 py-4">
                <StatusBadge status={project.status} />
              </td>
              <td className="max-w-[220px] truncate px-5 py-4">
                {project.deployment_url ? (
                  <a
                    className="truncate text-accent-blue hover:underline"
                    href={project.deployment_url}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {project.deployment_url}
                  </a>
                ) : (
                  <span className="text-brand-muted">Not deployed</span>
                )}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-brand-muted">
                {formatRelativeTime(project.updated_at)}
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      navigate(`/projects/${project.id}`);
                    }}
                    variant="secondary"
                  >
                    Details
                  </Button>

                  {/* Deploy/Delete are disabled for now; wrapping in a <span>
                      ensures the "Coming soon" tooltip still shows on hover
                      even though the button itself is disabled. */}
                  <span title="Coming soon">
                    <Button disabled variant="secondary">
                      Deploy
                    </Button>
                  </span>
                  <span title="Coming soon">
                    <Button
                      className="text-accent-red hover:bg-accent-red/10 hover:text-accent-red"
                      disabled
                      variant="ghost"
                    >
                      Delete
                    </Button>
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
