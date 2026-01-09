"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Download, FileSpreadsheet, FileText, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ExportButtonProps {
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  data?: Record<string, unknown>[];
  filename?: string;
  className?: string;
}

export function ExportButton({
  onExportCSV,
  onExportPDF,
  data,
  filename = "euc-export",
  className = "",
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exported, setExported] = useState<"csv" | "pdf" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
    } else if (data) {
      // Default CSV export
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(","),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    }

    setExported("csv");
    setTimeout(() => setExported(null), 2000);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      // Trigger print dialog as fallback for PDF
      window.print();
    }

    setExported("pdf");
    setTimeout(() => setExported(null), 2000);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4A7CCC] hover:bg-[#1E3A5F] text-white text-sm font-medium rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A7CCC] focus:ring-offset-2"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            <div className="p-1">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-[#8B9E8B]/20 rounded-lg group-hover:bg-[#8B9E8B]/30 transition-colors">
                  <FileSpreadsheet className="w-4 h-4 text-[#8B9E8B]" />
                </div>
                <div>
                  <p className="font-medium">Export CSV</p>
                  <p className="text-xs text-gray-500">Spreadsheet format</p>
                </div>
                {exported === "csv" && (
                  <Check className="w-4 h-4 text-[#8B9E8B] ml-auto" />
                )}
              </button>

              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <FileText className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Export PDF</p>
                  <p className="text-xs text-gray-500">Print-ready format</p>
                </div>
                {exported === "pdf" && (
                  <Check className="w-4 h-4 text-[#8B9E8B] ml-auto" />
                )}
              </button>
            </div>

            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                Legislature-ready formats
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export bar for page headers
export function ExportBar({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between p-4 bg-white border-b border-gray-200 ${className}`}>
      <div className="flex items-center gap-3">
        {children}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 mr-2">Data as of {new Date().toLocaleDateString()}</span>
        <ExportButton />
      </div>
    </div>
  );
}
