import type { LucideIcon } from "lucide-react";

import { cn } from "../utils/cn";
import { Card } from "./Card";

type StatisticAccent = "blue" | "green" | "amber" | "red";

const accentStyles: Record<StatisticAccent, string> = {
  blue: "bg-accent-blue/10 text-accent-blue",
  green: "bg-accent-green/10 text-accent-green",
  amber: "bg-accent-amber/10 text-accent-amber",
  red: "bg-accent-red/10 text-accent-red",
};

type StatisticCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: StatisticAccent;
};

export function StatisticCard({ label, value, icon: Icon, accent }: StatisticCardProps) {
  return (
    <Card className="flex h-full items-center">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-brand-muted">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-brand">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
            accentStyles[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
