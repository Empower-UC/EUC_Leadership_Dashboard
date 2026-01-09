"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Users,
  Video,
  FileCheck,
  Camera,
  Filter,
  X,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { StoryCard } from "@/components/stories/StoryCard";
import { StoryModal } from "@/components/stories/StoryModal";
import { StoryFilters } from "@/components/stories/StoryFilters";
import {
  StoriesData,
  ParticipantStory,
  StoryFilterState,
} from "@/lib/types/stories";

interface StoriesClientProps {
  data: StoriesData;
}

export function StoriesClient({ data }: StoriesClientProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showFilters, setShowFilters] = useState(true);
  const [selectedStory, setSelectedStory] = useState<ParticipantStory | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState<StoryFilterState>({
    themes: [],
    archetypes: [],
    counties: [],
    metricFocus: null,
    hasPhoto: null,
    willingToFilm: null,
    searchQuery: "",
  });

  // Get unique counties
  const counties = useMemo(() => {
    const uniqueCounties = new Set(data.stories.map((s) => s.county));
    return Array.from(uniqueCounties);
  }, [data.stories]);

  // Filter and sort stories
  const filteredStories = useMemo(() => {
    let stories = [...data.stories];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      stories = stories.filter(
        (s) =>
          s.headline.toLowerCase().includes(query) ||
          s.pullQuote.toLowerCase().includes(query) ||
          s.participantName.toLowerCase().includes(query) ||
          s.fullStory.success.toLowerCase().includes(query) ||
          s.fullStory.lifeChanged.toLowerCase().includes(query)
      );
    }

    // Archetype filter
    if (filters.archetypes.length > 0) {
      stories = stories.filter((s) =>
        filters.archetypes.some((a) => s.archetypes.includes(a))
      );
    }

    // Theme filter
    if (filters.themes.length > 0) {
      stories = stories.filter((s) =>
        filters.themes.some((t) => s.tags.includes(t))
      );
    }

    // County filter
    if (filters.counties.length > 0) {
      stories = stories.filter((s) => filters.counties.includes(s.county));
    }

    // Media filters
    if (filters.willingToFilm === true) {
      stories = stories.filter((s) => s.willingToFilm);
    }
    if (filters.hasPhoto === true) {
      stories = stories.filter((s) => s.photoPath !== null);
    }

    // Sort by metric relevance if focused
    if (filters.metricFocus) {
      stories.sort(
        (a, b) =>
          b.metricRelevance[filters.metricFocus!] -
          a.metricRelevance[filters.metricFocus!]
      );
    } else {
      // Default sort: emotional resonance, then story depth
      const resonanceOrder = { high: 3, medium: 2, low: 1 };
      const depthOrder = { detailed: 3, moderate: 2, brief: 1 };
      stories.sort(
        (a, b) =>
          resonanceOrder[b.emotionalResonance] -
            resonanceOrder[a.emotionalResonance] ||
          depthOrder[b.storyDepth] - depthOrder[a.storyDepth]
      );
    }

    return stories;
  }, [data.stories, filters]);

  // Get related stories for modal
  const getRelatedStories = (story: ParticipantStory) => {
    return data.stories
      .filter(
        (s) =>
          s.id !== story.id &&
          s.archetypes.some((a) => story.archetypes.includes(a))
      )
      .slice(0, 4);
  };

  const handleStoryClick = (story: ParticipantStory) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const fadeIn = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay },
        };

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      <Topbar
        title="Participant Stories"
        actions={
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-white/60 transition-colors"
          >
            {showFilters ? (
              <X className="w-4 h-4" />
            ) : (
              <Filter className="w-4 h-4" />
            )}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        }
      />

      <div className="px-10 pb-10 space-y-6 max-w-7xl">
        {/* Hero stats */}
        <motion.div className="grid grid-cols-4 gap-4" {...fadeIn(0)}>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#4A7CCC]/10 rounded-lg">
                <Users className="w-5 h-5 text-[#4A7CCC]" />
              </div>
            </div>
            <p className="text-3xl font-bold font-data text-gray-900">
              {data.metadata.total_stories}
            </p>
            <p className="text-sm text-gray-500">Total Stories</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#8B9E8B]/10 rounded-lg">
                <FileCheck className="w-5 h-5 text-[#8B9E8B]" />
              </div>
            </div>
            <p className="text-3xl font-bold font-data text-gray-900">
              {data.metadata.stories_with_release}
            </p>
            <p className="text-sm text-gray-500">
              Release Signed ({Math.round((data.metadata.stories_with_release / data.metadata.total_stories) * 100)}%)
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Video className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold font-data text-gray-900">
              {data.metadata.stories_willing_to_film}
            </p>
            <p className="text-sm text-gray-500">
              Willing to Film ({Math.round((data.metadata.stories_willing_to_film / data.metadata.total_stories) * 100)}%)
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Camera className="w-5 h-5 text-rose-600" />
              </div>
            </div>
            <p className="text-3xl font-bold font-data text-gray-900">
              {data.metadata.stories_with_photos}
            </p>
            <p className="text-sm text-gray-500">With Photos</p>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex gap-6">
          {/* Filters sidebar */}
          {showFilters && (
            <motion.div className="w-64 shrink-0" {...fadeIn(0.05)}>
              <StoryFilters
                filters={filters}
                onFiltersChange={setFilters}
                counties={counties}
              />
            </motion.div>
          )}

          {/* Stories grid */}
          <div className="flex-1">
            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {filteredStories.length} of {data.stories.length} stories
              </p>
              {filters.metricFocus && (
                <p className="text-xs text-[#4A7CCC]">
                  Sorted by {filters.metricFocus} relevance
                </p>
              )}
            </div>

            {/* Grid */}
            {filteredStories.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial="hidden"
                animate="visible"
                variants={
                  prefersReducedMotion
                    ? {}
                    : {
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.08,
                            delayChildren: 0.1,
                          },
                        },
                      }
                }
              >
                {filteredStories.map((story, idx) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onClick={() => handleStoryClick(story)}
                    delay={idx}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">
                  No stories match your current filters.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      themes: [],
                      archetypes: [],
                      counties: [],
                      metricFocus: null,
                      hasPhoto: null,
                      willingToFilm: null,
                      searchQuery: "",
                    })
                  }
                  className="mt-2 text-sm text-[#4A7CCC] hover:text-[#1E3A5F]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Story Modal */}
      <StoryModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relatedStories={selectedStory ? getRelatedStories(selectedStory) : []}
        onSelectRelated={(story) => setSelectedStory(story)}
      />
    </div>
  );
}
