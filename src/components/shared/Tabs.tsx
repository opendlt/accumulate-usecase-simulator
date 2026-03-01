import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 p-1 rounded-[10px] bg-surface/60 border border-overlay/[0.06]",
        className
      )}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => onTabChange(index)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all duration-200 cursor-pointer",
            activeTab === index
              ? "bg-primary/15 text-primary border border-primary/20"
              : "text-text-muted hover:text-text hover:bg-overlay/[0.04] border border-transparent"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
