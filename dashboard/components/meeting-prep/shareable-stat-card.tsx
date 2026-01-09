"use client";

import { motion } from "framer-motion";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ShareableStat {
  stat: string;
  label: string;
  context: string;
}

interface ShareableStatCardProps {
  stats: ShareableStat[];
  title?: string;
}

export function ShareableStatCard({
  stats,
  title = "Shareable Statistics"
}: ShareableStatCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (stat: ShareableStat, index: number) => {
    const text = `${stat.stat} ${stat.label} - ${stat.context}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#4A7CCC]/20 rounded-xl flex items-center justify-center">
          <Share2 className="w-5 h-5 text-[#4A7CCC]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">Click to copy for social media</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.button
            key={index}
            onClick={() => copyToClipboard(stat, index)}
            className="relative p-4 bg-gradient-to-br from-[#4A7CCC]/10 to-[#6B9BE0]/10 rounded-xl text-left group hover:from-[#4A7CCC]/20 hover:to-[#6B9BE0]/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-3 right-3">
              {copiedIndex === index ? (
                <Check className="w-4 h-4 text-[#8B9E8B]" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            <p className="text-3xl font-bold font-data text-[#1E3A5F] mb-1">
              {stat.stat}
            </p>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {stat.label}
            </p>
            <p className="text-xs text-gray-500">
              {stat.context}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
