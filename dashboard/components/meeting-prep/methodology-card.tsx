"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface MethodologyCardProps {
  title: string;
  value: string | number;
  methodology: string;
  dataSource: string;
  confidence: "measured" | "projected" | "estimated";
  asOf?: string;
  caveats?: string[];
  calculation?: string;
  children?: React.ReactNode;
}

const confidenceConfig = {
  measured: {
    label: "Measured",
    color: "bg-[#8B9E8B]/20 text-[#8B9E8B]",
    icon: CheckCircle,
    description: "Directly observed from program data"
  },
  projected: {
    label: "Projected",
    color: "bg-[#D4A574]/20 text-[#D4A574]",
    icon: Clock,
    description: "Calculated based on assumptions about the future"
  },
  estimated: {
    label: "Estimated",
    color: "bg-[#4A7CCC]/20 text-[#4A7CCC]",
    icon: AlertTriangle,
    description: "Approximated based on available data"
  }
};

export function MethodologyCard({
  title,
  value,
  methodology,
  dataSource,
  confidence,
  asOf = "January 7, 2026",
  caveats,
  calculation,
  children
}: MethodologyCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = confidenceConfig[confidence];
  const ConfidenceIcon = config.icon;

  return (
    <div className="relative">
      {/* Main metric display */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {children}
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="ml-2 p-1 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="View methodology"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Card */}
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="text-2xl font-bold font-data text-gray-900 mt-1">
                    {value}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Confidence badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${config.color}`}>
                    <ConfidenceIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {config.description}
                  </span>
                </div>

                {/* Methodology */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    What this measures
                  </p>
                  <p className="text-sm text-gray-700">{methodology}</p>
                </div>

                {/* Data source */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-400">Source:</span>{" "}
                    <span className="text-gray-700">{dataSource}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">As of:</span>{" "}
                    <span className="text-gray-700">{asOf}</span>
                  </div>
                </div>

                {/* Calculation details */}
                {calculation && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Calculation
                    </p>
                    <p className="text-xs font-mono text-gray-600">{calculation}</p>
                  </div>
                )}

                {/* Caveats */}
                {caveats && caveats.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Important caveats
                    </p>
                    <ul className="text-xs text-amber-800 space-y-1">
                      {caveats.map((caveat, i) => (
                        <li key={i}>• {caveat}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-[11px] text-gray-400">
                  RCT validation pending with MEF Associates / Urban Institute
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simplified inline version for tight spaces
export function MethodologyBadge({
  confidence
}: {
  confidence: "measured" | "projected" | "estimated"
}) {
  const config = confidenceConfig[confidence];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${config.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
}
