import { motion } from "framer-motion";

export function ProofStamp() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.9 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="inline-flex items-center gap-2 border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E] text-[0.75rem] font-semibold rounded-[10px] px-3.5 py-2 shadow-[0_0_20px_rgba(34,197,94,0.12)]"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <motion.path
          d="M6 8L7.5 9.5L10 6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        />
        <motion.path
          d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        />
      </svg>
      Verifiable Proof
    </motion.div>
  );
}
