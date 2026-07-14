import type { ReactNode } from "react";

import type { Project } from "../types/project";
import { formatDateTime } from "../utils/date";
import { Card } from "./Card";

type ProjectMetadataProps = {
  project: Project;
};

export function ProjectMetadata({ project }: ProjectMetadataProps) {
  return (
    <Card>
      <h3 className="text-lg font-bold text-brand">Project metadata</h3>
      <dl className="mt-5 grid gap-4 md:grid-cols-2">
        <MetadataItem label="Repository Name" value={project.repo_name} />
        <MetadataItem label="Full Repository Name" value={project.repo_full_name ?? "Not available"} />
        <MetadataItem label="Status" value={project.status} />
        <MetadataItem label="Default Branch" value={project.default_branch ?? "Not available"} />
        <MetadataItem label="Visibility" value={project.private ? "Private" : "Public"} />
        <MetadataItem label="Created At" value={formatDateTime(project.created_at)} />
        <MetadataItem label="Last Updated" value={formatDateTime(project.updated_at)} />
        <MetadataItem className="md:col-span-2" label="Clone URL" value={project.clone_url ?? "Not available"} />
      </dl>
    </Card>
  );
}

type MetadataItemProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

function MetadataItem({ className, label, value }: MetadataItemProps) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold text-brand">{value}</dd>
    </div>
  );
}
