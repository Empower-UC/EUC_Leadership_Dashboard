"use client";

import { Search, X, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoryFilterState, StoryTag, TAG_INFO } from "@/lib/types/stories";

const THEME_OPTIONS: StoryTag[] = [
  "children-family",
  "career-employment",
  "education",
  "housing",
  "transportation",
  "income-increase",
  "graduation",
  "single-parenting",
];

interface StoryFiltersProps {
  filters: StoryFilterState;
  onFiltersChange: (filters: StoryFilterState) => void;
  counties: string[];
}

export function StoryFilters({
  filters,
  onFiltersChange,
  counties,
}: StoryFiltersProps) {
  const updateFilters = (updates: Partial<StoryFilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleCounty = (county: string) => {
    const newCounties = filters.counties.includes(county)
      ? filters.counties.filter((c) => c !== county)
      : [...filters.counties, county];
    updateFilters({ counties: newCounties });
  };

  const toggleTheme = (theme: StoryTag) => {
    const newThemes = filters.themes.includes(theme)
      ? filters.themes.filter((t) => t !== theme)
      : [...filters.themes, theme];
    updateFilters({ themes: newThemes });
  };

  const clearFilters = () => {
    onFiltersChange({
      themes: [],
      archetypes: [],
      counties: [],
      metricFocus: null,
      hasPhoto: null,
      willingToFilm: null,
      searchQuery: "",
    });
  };

  const hasActiveFilters =
    filters.counties.length > 0 || filters.themes.length > 0 || filters.searchQuery !== "";

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search stories..."
          value={filters.searchQuery}
          onChange={(e) => updateFilters({ searchQuery: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7CCC] focus:border-transparent"
        />
        {filters.searchQuery && (
          <button
            onClick={() => updateFilters({ searchQuery: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-sm text-[#4A7CCC] hover:text-[#1E3A5F] py-1"
        >
          Clear filters
        </button>
      )}

      {/* Themes */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Themes</span>
        </div>
        <div className="space-y-1">
          {THEME_OPTIONS.map((theme) => {
            const info = TAG_INFO[theme];
            const isActive = filters.themes.includes(theme);
            return (
              <button
                key={theme}
                onClick={() => toggleTheme(theme)}
                className={cn(
                  "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-[#4A7CCC]/10 text-[#1E3A5F] font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {info?.label || theme}
              </button>
            );
          })}
        </div>
      </div>

      {/* Counties */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">County</span>
        </div>
        <div className="space-y-1">
          {counties
            .filter((c) => c && c !== "Unknown")
            .sort()
            .map((county) => {
              const isActive = filters.counties.includes(county);
              return (
                <button
                  key={county}
                  onClick={() => toggleCounty(county)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-[#4A7CCC]/10 text-[#1E3A5F] font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {county}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
