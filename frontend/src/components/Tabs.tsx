import { cn } from "../utils/cn";

export type TabItem = {
  key: string;
  label: string;
};

type TabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onChange: (key: string) => void;
};

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="border-b border-surface-border">
      <nav aria-label="Project sections" className="-mb-px flex flex-wrap gap-2" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              aria-selected={isActive}
              className={cn(
                "rounded-t-md border-b-2 px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "border-brand text-brand"
                  : "border-transparent text-brand-muted hover:text-brand",
              )}
              key={tab.key}
              onClick={() => {
                onChange(tab.key);
              }}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
