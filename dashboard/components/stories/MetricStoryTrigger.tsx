"use client";

import { useState, useMemo } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoryModal } from "./StoryModal";
import {
  ParticipantStory,
  MetricType,
  METRIC_TO_RELEVANCE,
  MetricRelevance,
} from "@/lib/types/stories";

interface MetricStoryTriggerProps {
  metric: MetricType;
  stories: ParticipantStory[];
  variant?: "badge" | "button" | "inline";
  label?: string;
  className?: string;
  limit?: number;
}

export function MetricStoryTrigger({
  metric,
  stories,
  variant = "badge",
  label,
  className,
  limit = 3,
}: MetricStoryTriggerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<ParticipantStory | null>(
    null
  );

  // Get relevant stories sorted by metric relevance
  const relevantStories = useMemo(() => {
    const relevanceKey = METRIC_TO_RELEVANCE[metric];
    return [...stories]
      .filter((s) => s.releaseFormSigned)
      .sort(
        (a, b) => b.metricRelevance[relevanceKey] - a.metricRelevance[relevanceKey]
      )
      .slice(0, limit);
  }, [stories, metric, limit]);

  // Get related stories for the modal
  const getRelatedStories = (currentStory: ParticipantStory) => {
    return relevantStories
      .filter((s) => s.id !== currentStory.id)
      .slice(0, 3);
  };

  if (relevantStories.length === 0) return null;

  const handleClick = () => {
    setSelectedStory(relevantStories[0]);
    setIsModalOpen(true);
  };

  const handleSelectRelated = (story: ParticipantStory) => {
    setSelectedStory(story);
  };

  const displayLabel =
    label ||
    `${relevantStories.length} ${relevantStories.length === 1 ? "story" : "stories"}`;

  if (variant === "badge") {
    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
            "bg-[#4A7CCC]/10 text-[#4A7CCC] hover:bg-[#4A7CCC]/20 transition-colors",
            className
          )}
        >
          <BookOpen className="w-3 h-3" />
          {displayLabel}
        </button>
        <StoryModal
          story={selectedStory}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          relatedStories={
            selectedStory ? getRelatedStories(selectedStory) : []
          }
          onSelectRelated={handleSelectRelated}
        />
      </>
    );
  }

  if (variant === "button") {
    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            "inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg",
            "bg-[#1E3A5F] text-white hover:bg-[#2D4A6F] transition-colors",
            className
          )}
        >
          <BookOpen className="w-4 h-4" />
          {displayLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
        <StoryModal
          story={selectedStory}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          relatedStories={
            selectedStory ? getRelatedStories(selectedStory) : []
          }
          onSelectRelated={handleSelectRelated}
        />
      </>
    );
  }

  // inline variant
  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1 text-xs text-[#4A7CCC] hover:text-[#1E3A5F] hover:underline",
          className
        )}
      >
        <BookOpen className="w-3 h-3" />
        {displayLabel}
      </button>
      <StoryModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relatedStories={
          selectedStory ? getRelatedStories(selectedStory) : []
        }
        onSelectRelated={handleSelectRelated}
      />
    </>
  );
}

// Standalone component for opening a specific story
interface StoryLinkProps {
  story: ParticipantStory;
  relatedStories?: ParticipantStory[];
  children: React.ReactNode;
  className?: string;
}

export function StoryLink({
  story,
  relatedStories = [],
  children,
  className,
}: StoryLinkProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<ParticipantStory>(story);

  return (
    <>
      <button
        onClick={() => {
          setSelectedStory(story);
          setIsModalOpen(true);
        }}
        className={className}
      >
        {children}
      </button>
      <StoryModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relatedStories={relatedStories.filter((s) => s.id !== selectedStory.id)}
        onSelectRelated={setSelectedStory}
      />
    </>
  );
}
