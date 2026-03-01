export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z"
            stroke="#3B82F6"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M8 6V10" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 8H10" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="font-heading text-sm font-semibold text-text">
        <span className="gradient-text">Accumulate</span>
        <span className="text-text-muted ml-1">Simulator</span>
      </span>
    </div>
  );
}
