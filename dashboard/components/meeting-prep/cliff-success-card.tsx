"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface CliffSuccessCardProps {
  data: {
    headline: string;
    insight: string;
    afterCrossingSnap: {
      total: number;
      continuedClimbing: number;
      continuedPct: number;
      fellBack: number;
      fellBackPct: number;
    };
    benefitsAtRisk: number;
    familiesInZone: number;
  };
}

export function CliffSuccessCard({ data }: CliffSuccessCardProps) {
  const { afterCrossingSnap } = data;

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-[#8B9E8B]/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-[#8B9E8B]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{data.headline}</h3>
          <p className="text-sm text-gray-500 mt-1">{data.insight}</p>
        </div>
      </div>

      {/* Visual bar showing outcomes */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">
            {afterCrossingSnap.total} families crossed the SNAP cliff
          </span>
        </div>
        <div className="h-8 bg-gray-100 rounded-full overflow-hidden flex">
          <motion.div
            className="h-full bg-[#8B9E8B] flex items-center justify-center text-white text-xs font-bold"
            initial={{ width: 0 }}
            animate={{ width: `${afterCrossingSnap.continuedPct}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {afterCrossingSnap.continuedPct}% kept climbing
          </motion.div>
          {afterCrossingSnap.fellBackPct > 0 && (
            <motion.div
              className="h-full bg-[#E07B67] flex items-center justify-center text-white text-xs font-bold"
              initial={{ width: 0 }}
              animate={{ width: `${afterCrossingSnap.fellBackPct}%` }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {afterCrossingSnap.fellBackPct}%
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-[#8B9E8B]/10 rounded-xl">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-[#8B9E8B]" />
          </div>
          <p className="text-2xl font-bold font-data text-[#8B9E8B]">
            {afterCrossingSnap.continuedClimbing}
          </p>
          <p className="text-xs text-[#8B9E8B]">Continued climbing</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-data text-gray-700">
            {data.familiesInZone}
          </p>
          <p className="text-xs text-gray-500">Currently in cliff zone</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold font-data text-gray-700">
            ${(data.benefitsAtRisk / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-gray-500">Benefits at risk annually</p>
        </div>
      </div>
    </motion.div>
  );
}
