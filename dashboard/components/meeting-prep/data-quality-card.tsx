"use client";

import { motion } from "framer-motion";
import { Database, CheckCircle, AlertCircle } from "lucide-react";

interface DataQualityCardProps {
  data: {
    totalEnrolled: number;
    inMonthlyReview: number;
    incomeData: {
      hasEnrollmentFpl: number;
      hasCurrentFpl: number;
      hasBothFpl: number;
      hasWageData: number;
      completenessRate: number;
    };
    wageDataQuality: {
      totalWithData: number;
      positiveGains: number;
      negativeGains: number;
      mean: number;
      median: number;
      outliers: number;
    };
  };
  title?: string;
}

export function DataQualityCard({
  data,
  title = "Data Quality Dashboard"
}: DataQualityCardProps) {
  const completenessPercent = (data.incomeData.completenessRate * 100).toFixed(1);
  const positiveRate = ((data.wageDataQuality.positiveGains / data.wageDataQuality.totalWithData) * 100).toFixed(0);

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Database className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">Transparency in data collection and completeness</p>
        </div>
      </div>

      {/* Main completeness indicator */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Income Data Completeness</span>
          <span className="text-2xl font-bold font-data text-gray-900">{completenessPercent}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-slate-500 to-slate-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completenessPercent}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {data.incomeData.hasBothFpl} of {data.totalEnrolled} families have both enrollment and current FPL data
        </p>
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[#8B9E8B]" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Data</span>
          </div>
          <p className="text-2xl font-bold font-data text-gray-900">{data.totalEnrolled}</p>
          <p className="text-xs text-gray-500">Total families enrolled</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[#8B9E8B]" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Review</span>
          </div>
          <p className="text-2xl font-bold font-data text-gray-900">{data.inMonthlyReview}</p>
          <p className="text-xs text-gray-500">In monthly tracking</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Wage Data</span>
          </div>
          <p className="text-2xl font-bold font-data text-gray-900">{data.wageDataQuality.totalWithData}</p>
          <p className="text-xs text-gray-500">Families with wage tracking</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outliers</span>
          </div>
          <p className="text-2xl font-bold font-data text-gray-900">{data.wageDataQuality.outliers}</p>
          <p className="text-xs text-gray-500">Gains &gt;$50K (excluded from means)</p>
        </div>
      </div>

      {/* Wage distribution */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Wage Gain Distribution</h4>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500">Mean</p>
            <p className="text-lg font-bold font-data text-gray-900">${data.wageDataQuality.mean.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Median</p>
            <p className="text-lg font-bold font-data text-gray-900">${data.wageDataQuality.median.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Positive Outcomes</p>
            <p className="text-lg font-bold font-data text-[#8B9E8B]">
              {positiveRate}% ({data.wageDataQuality.positiveGains})
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Negative Outcomes</p>
            <p className="text-lg font-bold font-data text-[#E07B67]">
              {data.wageDataQuality.negativeGains}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
