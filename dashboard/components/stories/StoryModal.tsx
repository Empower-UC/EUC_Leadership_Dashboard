"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Video,
  TrendingUp,
  Calendar,
  Users,
  ChevronRight,
  User,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ParticipantStory,
  ARCHETYPE_INFO,
  TAG_INFO,
  Archetype,
  StoryTag,
} from "@/lib/types/stories";

interface StoryModalProps {
  story: ParticipantStory | null;
  isOpen: boolean;
  onClose: () => void;
  relatedStories?: ParticipantStory[];
  onSelectRelated?: (story: ParticipantStory) => void;
}

interface StorySectionProps {
  title: string;
  content: string;
}

function StorySection({ title, content }: StorySectionProps) {
  if (!content || content.trim() === "") return null;

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        {title}
      </h4>
      <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}

export function StoryModal({
  story,
  isOpen,
  onClose,
  relatedStories = [],
  onSelectRelated,
}: StoryModalProps) {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!story) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 md:inset-8 lg:inset-12 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header with photo */}
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-gray-100 to-gray-50 shrink-0">
              {story.photoPath && story.releaseFormSigned ? (
                <Image
                  src={story.photoPath}
                  alt={story.participantName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {story.willingToFilm && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#8B9E8B]/20 text-[#8B9E8B]">
                    <Video className="w-3.5 h-3.5" />
                    Willing to Film
                  </span>
                )}
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {story.headline}
                </h2>
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {story.participantName}
                  </span>
                  {story.county && story.county !== "Unknown" && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {story.county}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Pull quote */}
                    {story.pullQuote && (
                      <blockquote className="text-lg md:text-xl italic text-gray-700 border-l-4 border-[#4A7CCC] pl-4 py-2">
                        "{story.pullQuote}"
                      </blockquote>
                    )}

                    {/* Story sections */}
                    <div className="space-y-6">
                      <StorySection
                        title="Success Story"
                        content={story.fullStory.success}
                      />
                      <StorySection
                        title="Financial Situation"
                        content={story.fullStory.financialSituation}
                      />
                      <StorySection
                        title="What Inspired Change"
                        content={story.fullStory.inspiration}
                      />
                      <StorySection
                        title="Challenges Overcome"
                        content={story.fullStory.challenges}
                      />
                      <StorySection
                        title="How Life Has Changed"
                        content={story.fullStory.lifeChanged}
                      />
                    </div>

                    {/* Tags */}
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                        Themes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {story.tags.map((tag) => {
                          const info = TAG_INFO[tag as StoryTag];
                          return (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {info?.label || tag}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Outcomes card */}
                    <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                      <h4 className="font-semibold text-gray-900">Outcomes</h4>

                      {story.outcomes.fplAtEnrollment !== null &&
                        story.outcomes.fplAtExit !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              FPL Progress
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {Math.round(story.outcomes.fplAtEnrollment)}%
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                              <span
                                className={cn(
                                  "text-sm font-semibold",
                                  story.outcomes.fplAtExit >= 225
                                    ? "text-[#4A7CCC]"
                                    : story.outcomes.fplAtExit >= 150
                                    ? "text-[#6B9BE0]"
                                    : "text-gray-900"
                                )}
                              >
                                {Math.round(story.outcomes.fplAtExit)}%
                              </span>
                            </div>
                          </div>
                        )}

                      {story.outcomes.wageGainAnnual !== null &&
                        story.outcomes.wageGainAnnual !== 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Wage Change
                            </span>
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                story.outcomes.wageGainAnnual > 0
                                  ? "text-[#4A7CCC]"
                                  : "text-[#E07B67]"
                              )}
                            >
                              {story.outcomes.wageGainAnnual > 0 ? "+" : ""}$
                              {Math.abs(
                                story.outcomes.wageGainAnnual
                              ).toLocaleString()}
                              /yr
                            </span>
                          </div>
                        )}

                      {story.outcomes.daysInProgram !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Time in Program
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {Math.round(story.outcomes.daysInProgram / 30)}{" "}
                            months
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Archetypes */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">
                        Journey Type
                      </h4>
                      {story.archetypes.map((archetype) => {
                        const info = ARCHETYPE_INFO[archetype as Archetype];
                        return (
                          <div
                            key={archetype}
                            className={cn(
                              "p-3 rounded-lg border",
                              info?.color === "navy" &&
                                "bg-[#1E3A5F]/5 border-[#1E3A5F]/20",
                              info?.color === "blue" &&
                                "bg-[#4A7CCC]/10 border-[#4A7CCC]/30",
                              info?.color === "blue-light" &&
                                "bg-[#6B9BE0]/10 border-[#6B9BE0]/30",
                              info?.color === "amber" &&
                                "bg-[#D4A574]/10 border-[#D4A574]/30",
                              info?.color === "coral" &&
                                "bg-[#E07B67]/10 border-[#E07B67]/30",
                              info?.color === "sage" &&
                                "bg-[#8B9E8B]/10 border-[#8B9E8B]/30"
                            )}
                          >
                            <p className="font-medium text-sm text-gray-900">
                              {info?.label || archetype}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {info?.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>

                {/* Related stories */}
                {relatedStories.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Related Stories
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {relatedStories.slice(0, 4).map((related) => (
                        <button
                          key={related.id}
                          onClick={() => onSelectRelated?.(related)}
                          className="flex-shrink-0 w-48 bg-gray-50 rounded-lg p-3 text-left hover:bg-gray-100 transition-colors"
                        >
                          <p className="font-medium text-sm text-gray-900 line-clamp-2">
                            {related.headline}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {related.county}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
