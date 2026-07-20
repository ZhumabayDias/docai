import type { ReactNode } from "react";

type MetadataItemProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function MetadataItem({ className, label, value }: MetadataItemProps) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold text-brand">{value}</dd>
    </div>
  );
}
