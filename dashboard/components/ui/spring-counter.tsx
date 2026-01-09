"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useReducedMotion } from "framer-motion";

interface SpringCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function SpringCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.5,
  className = "",
}: SpringCounterProps) {
  const prefersReducedMotion = useReducedMotion();

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: prefersReducedMotion ? 0 : duration,
  });

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [display]);

  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
    );
  }

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}

interface SpringCurrencyProps {
  value: number;
  duration?: number;
  className?: string;
}

export function SpringCurrency({
  value,
  duration = 1.5,
  className = "",
}: SpringCurrencyProps) {
  const prefersReducedMotion = useReducedMotion();

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: prefersReducedMotion ? 0 : duration,
  });

  const [displayValue, setDisplayValue] = useState("$0");

  const formatCurrency = (n: number): string => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${Math.round(n).toLocaleString()}`;
  };

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      setDisplayValue(formatCurrency(v));
    });
    return unsubscribe;
  }, [spring]);

  if (prefersReducedMotion) {
    return <span className={className}>{formatCurrency(value)}</span>;
  }

  return <motion.span className={className}>{displayValue}</motion.span>;
}
