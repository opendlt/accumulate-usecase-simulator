import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "We replaced a 72-hour approval chain with a 30-second automated flow.",
    role: "VP of Engineering",
    industry: "SaaS",
  },
  {
    quote: "Auditors used to spend weeks on evidence gathering. Now it's instant.",
    role: "Chief Compliance Officer",
    industry: "Finance",
  },
  {
    quote: "Our subcontractor access review went from 5 days to 5 minutes.",
    role: "Security Director",
    industry: "Defense",
  },
  {
    quote: "HIPAA compliance evidence that generates itself — exactly what we needed.",
    role: "CTO",
    industry: "Healthcare",
  },
  {
    quote: "The cryptographic proof eliminated all disputes about who authorized what.",
    role: "Head of Risk",
    industry: "Supply Chain",
  },
];

interface SocialProofBarProps {
  industryFilter?: string;
}

export function SocialProofBar({ industryFilter }: SocialProofBarProps) {
  const [index, setIndex] = useState(() => {
    // Start with the industry-matched quote if available
    if (industryFilter) {
      const matchIdx = TESTIMONIALS.findIndex(
        (t) => t.industry.toLowerCase() === industryFilter.toLowerCase()
      );
      if (matchIdx >= 0) return matchIdx;
    }
    return 0;
  });

  // Rotate quotes every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const testimonial = TESTIMONIALS[index]!;

  return (
    <div className="py-2 px-4 bg-overlay/[0.02] border border-overlay/[0.04] rounded-xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-2"
        >
          <span className="text-primary/40 text-lg leading-none shrink-0">&ldquo;</span>
          <div className="flex-1 min-w-0">
            <p className="text-[0.7rem] text-text-muted italic leading-relaxed">
              {testimonial.quote}
            </p>
            <p className="text-[0.6rem] text-text-subtle mt-0.5">
              &mdash; {testimonial.role}, {testimonial.industry}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Indicator dots */}
      <div className="flex items-center justify-center gap-1 mt-1.5">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="cursor-pointer p-0.5"
          >
            <div
              className={`w-1 h-1 rounded-full transition-all ${
                i === index ? "bg-primary/60 w-2.5" : "bg-text-subtle/30"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
