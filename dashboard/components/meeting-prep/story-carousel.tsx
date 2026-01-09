"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Video, MapPin, User } from "lucide-react";

interface Story {
  id: string;
  participantName: string;
  county?: string;
  releaseFormSigned: boolean;
  willingToFilm: boolean;
  headline: string;
  pullQuote: string;
  fullStory: {
    success?: string;
    financialSituation?: string;
    inspiration?: string;
    challenges?: string;
    lifeChanged?: string;
  };
  archetypes: string[];
  tags: string[];
  emotionalResonance?: string;
  audienceScore?: number;
}

interface StoryCarouselProps {
  stories: Story[];
  title?: string;
  subtitle?: string;
  showFilmBadge?: boolean;
}

export function StoryCarousel({
  stories,
  title = "Family Stories",
  subtitle = "Real voices from the program",
  showFilmBadge = true
}: StoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  if (stories.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
        <p className="text-gray-500 text-center">No stories available for this audience.</p>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
    setExpandedStory(null);
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    setExpandedStory(null);
  };

  const formatArchetype = (archetype: string) => {
    return archetype
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Quote className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevStory}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            disabled={stories.length <= 1}
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm text-gray-500 min-w-[3rem] text-center">
            {currentIndex + 1} / {stories.length}
          </span>
          <button
            onClick={nextStory}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            disabled={stories.length <= 1}
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Story Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStory.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6"
        >
          {/* Participant info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{currentStory.participantName}</h4>
                {currentStory.county && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {currentStory.county} County
                  </div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              {showFilmBadge && currentStory.willingToFilm && (
                <span className="flex items-center gap-1 px-2 py-1 bg-[#8B9E8B]/20 text-[#8B9E8B] text-xs rounded-full">
                  <Video className="w-3 h-3" />
                  Video OK
                </span>
              )}
              {currentStory.emotionalResonance === 'high' && (
                <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full">
                  High Impact
                </span>
              )}
            </div>
          </div>

          {/* Quote */}
          <blockquote className="text-gray-700 italic mb-4 leading-relaxed">
            "{currentStory.pullQuote}"
          </blockquote>

          {/* Archetypes */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentStory.archetypes.slice(0, 3).map(archetype => (
              <span
                key={archetype}
                className="px-2 py-1 bg-white/60 text-gray-600 text-xs rounded-md"
              >
                {formatArchetype(archetype)}
              </span>
            ))}
          </div>

          {/* Expand/collapse full story */}
          <button
            onClick={() => setExpandedStory(expandedStory === currentStory.id ? null : currentStory.id)}
            className="text-amber-700 text-sm font-medium hover:text-amber-800 transition-colors"
          >
            {expandedStory === currentStory.id ? "Show less" : "Read full story"}
          </button>

          {/* Expanded story */}
          <AnimatePresence>
            {expandedStory === currentStory.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-amber-200 space-y-3">
                  {currentStory.fullStory.success && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Success</p>
                      <p className="text-sm text-gray-700">{currentStory.fullStory.success}</p>
                    </div>
                  )}
                  {currentStory.fullStory.challenges && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Challenges Overcome</p>
                      <p className="text-sm text-gray-700">{currentStory.fullStory.challenges}</p>
                    </div>
                  )}
                  {currentStory.fullStory.lifeChanged && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">How Life Changed</p>
                      <p className="text-sm text-gray-700">{currentStory.fullStory.lifeChanged}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      {stories.length > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setExpandedStory(null);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-amber-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
