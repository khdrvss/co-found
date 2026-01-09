import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export type TabType = "projects" | "all" | "people";

interface FilterTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  recommendedCount?: number;
  allProjectsCount?: number;
  peopleCount?: number;
}

export function FilterTabs({
  activeTab,
  onTabChange,
  recommendedCount = 0,
  allProjectsCount = 0,
  peopleCount = 0
}: FilterTabsProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: "projects" as TabType, label: t("filter.recommended"), count: recommendedCount },
    { id: "all" as TabType, label: t("filter.all"), count: allProjectsCount },
    { id: "people" as TabType, label: t("filter.people"), count: peopleCount },
  ];

  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground glow-primary"
              : "glass text-muted-foreground hover:text-foreground glass-hover"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              "ml-3 px-2 py-0.5 rounded-full text-xs",
              activeTab === tab.id ? "bg-primary-foreground/20" : "bg-muted"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
