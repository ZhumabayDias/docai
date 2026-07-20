import type { LucideIcon } from "lucide-react";

import { cn } from "../utils/cn";
import { Card } from "./Card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({ className, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <Card className={cn("flex flex-col items-center gap-3 py-14 text-center", className)}>
      <Icon className="h-8 w-8 text-brand-muted" />
      <div>
        <p className="text-sm font-semibold text-brand-muted">{title}</p>
        {description ? <p className="mt-2 text-sm text-brand-muted">{description}</p> : null}
      </div>
    </Card>
  );
}
