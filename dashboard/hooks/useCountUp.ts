"use client";

import { useState, useEffect, useRef } from "react";

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Animated count-up hook for hero metrics
 * Uses cubic ease-out for natural deceleration
 * Respects reduced motion preferences
 */
export function useCountUp(
  end: number,
  options: UseCountUpOptions = {}
): string {
  const {
    duration = 1500,
    delay = 0,
    decimals = 0,
    prefix = "",
    suffix = "",
  } = options;

  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    const timeout = setTimeout(() => {
      setHasStarted(true);
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Cubic ease-out for natural deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const currentValue = easeOut * end;
        setCount(currentValue);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, delay]);

  // Format the number
  const formatted = count.toFixed(decimals);
  return `${prefix}${formatted}${suffix}`;
}

/**
 * Animated count-up that formats as currency
 */
export function useCountUpCurrency(
  value: number,
  options: Omit<UseCountUpOptions, "prefix" | "suffix" | "decimals"> = {}
): string {
  const [displayValue, setDisplayValue] = useState("$0");
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const formatCurrency = (n: number): string => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
      return `$${Math.round(n).toLocaleString()}`;
    };

    if (prefersReducedMotion) {
      setDisplayValue(formatCurrency(value));
      return;
    }

    const { duration = 1500, delay = 0 } = options;

    const timeout = setTimeout(() => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setDisplayValue(formatCurrency(easeOut * value));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, options]);

  return displayValue;
}
