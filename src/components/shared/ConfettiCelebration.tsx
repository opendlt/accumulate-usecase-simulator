import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  drift: number;
}

const COLORS = [
  "#22C55E", // green
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#F59E0B", // amber
  "#06B6D4", // cyan
  "#EC4899", // pink
];

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40, // 30-70% from left
    y: -5 - Math.random() * 15,
    rotation: Math.random() * 720 - 360,
    scale: 0.5 + Math.random() * 0.8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    delay: Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 30, // -15 to +15 vw drift
  }));
}

export function ConfettiCelebration({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      setParticles(createParticles(40));
      setVisible(true);

      // Auto-hide after animation completes
      const timer = setTimeout(() => setVisible(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                rotate: 0,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                top: `${100 + Math.random() * 20}%`,
                left: `${p.x + p.drift}%`,
                rotate: p.rotation,
                scale: p.scale,
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 1,
                delay: p.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute"
              style={{
                width: 10,
                height: 10,
              }}
            >
              {/* Confetti shapes: rectangles and circles */}
              {p.id % 3 === 0 ? (
                <div
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              ) : p.id % 3 === 1 ? (
                <div
                  className="w-full h-2 rounded-sm"
                  style={{ backgroundColor: p.color }}
                />
              ) : (
                <div
                  className="w-2 h-full rounded-sm"
                  style={{ backgroundColor: p.color }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
