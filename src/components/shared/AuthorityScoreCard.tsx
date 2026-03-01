import { motion } from "framer-motion";
import type { BeforeAfterComparison } from "@/types/evidence";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { cn } from "@/lib/utils";

interface AuthorityScoreCardProps {
  comparisons: BeforeAfterComparison[];
  todayViolationCount: number;
}

/**
 * Compute an "Authority Score" grade from comparison data.
 *
 * Scoring factors:
 *  - Time improvement percentage
 *  - Manual steps eliminated
 *  - Compliance violations resolved
 *  - Audit coverage gained
 *
 * Returns 0–100 numeric score + letter grade.
 */
function computeAuthorityScore(
  comparisons: BeforeAfterComparison[],
  violationCount: number,
): { score: number; grade: string; gradeColor: string; summary: string } {
  let score = 50; // Base score

  for (const c of comparisons) {
    const improvement = c.improvement;
    // Parse percentage improvements like "80% faster"
    const pctMatch = improvement.match(/(\d+)%/);
    if (pctMatch) {
      const pct = parseInt(pctMatch[1]!, 10);
      score += pct * 0.2; // Each % improvement adds 0.2 points
    }
    // "Eliminated" or "0" after values = perfect score for that metric
    if (/eliminated|100%|∞/i.test(improvement)) {
      score += 8;
    }
  }

  // Violations resolved bonus
  if (violationCount > 0) {
    score += Math.min(violationCount * 5, 15);
  }

  // Clamp to 0–100
  score = Math.max(0, Math.min(100, Math.round(score)));

  let grade: string;
  let gradeColor: string;
  let summary: string;

  if (score >= 90) {
    grade = "A";
    gradeColor = "#22C55E";
    summary = "Exceptional improvement — Accumulate eliminates virtually all manual bottlenecks";
  } else if (score >= 80) {
    grade = "A-";
    gradeColor = "#22C55E";
    summary = "Outstanding — dramatic reduction in approval time and compliance risk";
  } else if (score >= 70) {
    grade = "B+";
    gradeColor = "#3B82F6";
    summary = "Strong improvement — significant time savings and better audit coverage";
  } else if (score >= 60) {
    grade = "B";
    gradeColor = "#3B82F6";
    summary = "Good improvement — meaningful reduction in manual steps and delays";
  } else {
    grade = "B-";
    gradeColor = "#F59E0B";
    summary = "Moderate improvement — clear benefits in automation and compliance";
  }

  return { score, grade, gradeColor, summary };
}

export function AuthorityScoreCard({ comparisons, todayViolationCount }: AuthorityScoreCardProps) {
  const { score, grade, gradeColor, summary } = computeAuthorityScore(comparisons, todayViolationCount);
  const animatedScore = useAnimatedCounter(score, { duration: 1500 });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface/60 border border-overlay/[0.06]"
    >
      {/* Grade circle */}
      <div className="relative shrink-0">
        <svg width="64" height="64" viewBox="0 0 64 64">
          {/* Background track */}
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="currentColor"
            className="text-overlay/[0.06]"
            strokeWidth="4"
          />
          {/* Score arc */}
          <motion.circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke={gradeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 28}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-xl font-bold"
            style={{ color: gradeColor }}
          >
            {grade}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Authority Score
          </span>
          <span
            className={cn("text-sm font-bold tabular-nums")}
            style={{ color: gradeColor }}
          >
            {animatedScore}/100
          </span>
        </div>
        <p className="text-[0.65rem] text-text-muted leading-relaxed">
          {summary}
        </p>
      </div>
    </motion.div>
  );
}
