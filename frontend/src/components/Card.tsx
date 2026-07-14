import type { HTMLAttributes } from "react";

import { cn } from "../utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-surface-border bg-surface-raised p-5 shadow-glow",
        className,
      )}
      {...props}
    />
  );
}
