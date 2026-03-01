import { motion } from "framer-motion";

export function VictoryFlash() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      {/* Phase 1: Green radial ripple */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(34,197,94,0.25) 0%, transparent 70%)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 1.4] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Phase 2: Shield + checkmark stamp */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [0.5, 1.1, 1, 0.4],
            opacity: [0, 1, 1, 0],
            x: [0, 0, 0, 120],
            y: [0, 0, 0, -120],
          }}
          transition={{
            duration: 1.8,
            times: [0, 0.3, 0.6, 1],
            ease: "easeInOut",
          }}
        >
          {/* Shield */}
          <motion.path
            d="M40 6L12 20V40C12 56.5 24 71 40 76C56 71 68 56.5 68 40V20L40 6Z"
            stroke="#22C55E"
            strokeWidth="2.5"
            fill="rgba(34,197,94,0.08)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          {/* Checkmark */}
          <motion.path
            d="M28 40L36 48L54 30"
            stroke="#22C55E"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          />
        </motion.svg>
      </div>

      {/* Phase 3: Border glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-sm"
        style={{
          boxShadow: "inset 0 0 30px rgba(34,197,94,0.3)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
      />
    </div>
  );
}
