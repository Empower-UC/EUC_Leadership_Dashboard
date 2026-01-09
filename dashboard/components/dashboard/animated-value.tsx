"use client";

import { useCountUp, useCountUpCurrency } from "@/hooks/useCountUp";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1500,
  delay = 0,
  className = "",
}: AnimatedNumberProps) {
  const animated = useCountUp(value, {
    duration,
    delay,
    decimals,
    prefix,
    suffix,
  });

  return <span className={className}>{animated}</span>;
}

interface AnimatedCurrencyProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimatedCurrency({
  value,
  duration = 1500,
  delay = 0,
  className = "",
}: AnimatedCurrencyProps) {
  const animated = useCountUpCurrency(value, { duration, delay });

  return <span className={className}>{animated}</span>;
}
