import { Graph, Sliders, Play, FileText } from "@phosphor-icons/react";
import { useUIStore } from "@/store";

const tabs = [
  { id: "canvas" as const, label: "Canvas", icon: Graph },
  { id: "policy" as const, label: "Policy", icon: Sliders },
  { id: "simulation" as const, label: "Simulate", icon: Play },
  { id: "evidence" as const, label: "Evidence", icon: FileText },
];

export function MobileTabBar() {
  const { activeMobilePanel, setActiveMobilePanel } = useUIStore();

  return (
    <nav className="flex items-center justify-around border-t border-border bg-surface/80 backdrop-blur-sm py-2 shrink-0">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = activeMobilePanel === id;
        return (
          <button
            key={id}
            onClick={() => setActiveMobilePanel(id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              active ? "text-primary" : "text-text-muted"
            }`}
          >
            <Icon size={20} weight={active ? "fill" : "regular"} />
            <span className="text-[0.6rem] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
