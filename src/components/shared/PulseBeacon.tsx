import { motion } from "framer-motion";

/**
 * A subtle pulsing beacon that draws attention to a CTA.
 * Renders as a small dot with an expanding ring animation.
 */
export function PulseBeacon({ color = "#3B82F6" }: { color?: string }) {
  return (
    <span className="relative inline-flex items-center justify-center w-2 h-2">
      {/* Pulsing ring */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 2.5, 3],
          opacity: [0.5, 0.2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      {/* Solid dot */}
      <span
        className="relative w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}
