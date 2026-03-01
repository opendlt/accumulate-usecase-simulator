import { Sun, Moon } from "@phosphor-icons/react";
import { useUIStore } from "@/store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-[10px] text-text-muted hover:text-text hover:bg-overlay/[0.04] transition-colors cursor-pointer"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
