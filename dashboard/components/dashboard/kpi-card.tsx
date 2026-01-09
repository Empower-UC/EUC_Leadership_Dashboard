import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: KPICardProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] kpi-card cursor-default",
      className
    )}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-400">
          {title}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums font-data">
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-gray-500 mt-3">{subtitle}</p>
      )}

      {/* Trend badge */}
      {trend && (
        <div className="mt-4">
          <span className={cn(
            "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg",
            trend.value >= 0
              ? "bg-[#8B9E8B]/10 text-[#8B9E8B]"
              : "bg-[#E07B67]/10 text-[#E07B67]"
          )}>
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}
