import { useState, useEffect, useRef } from "react";

/**
 * Animated counter hook — smoothly counts from 0 (or a start value) to a target.
 * Uses requestAnimationFrame for buttery-smooth 60fps animation.
 */
export function useAnimatedCounter(
  target: number,
  options: {
    duration?: number;   // ms, default 1200
    start?: number;      // default 0
    enabled?: boolean;   // default true — set false to skip animation
    decimals?: number;   // decimal places, default 0
  } = {},
) {
  const {
    duration = 1200,
    start = 0,
    enabled = true,
    decimals = 0,
  } = options;

  const [value, setValue] = useState(enabled ? start : target);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }

    const from = start;
    const delta = target - from;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + delta * eased;

      setValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [target, duration, start, enabled, decimals]);

  return value;
}
