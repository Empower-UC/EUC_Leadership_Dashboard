"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin, User, Video, Quote } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ParticipantStory,
  ARCHETYPE_INFO,
  Archetype,
} from "@/lib/types/stories";

interface StoryCardProps {
  story: ParticipantStory;
  onClick: () => void;
  delay?: number;
}

export function StoryCard({ story, onClick, delay = 0 }: StoryCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const primaryArchetype = story.archetypes[0] as Archetype | undefined;
  const archetypeInfo = primaryArchetype
    ? ARCHETYPE_INFO[primaryArchetype]
    : null;

  const cardContent = (
    <>
      {/* Photo section */}
      <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-50 rounded-t-2xl overflow-hidden">
        {story.photoPath && story.releaseFormSigned ? (
          <Image
            src={story.photoPath}
            alt={story.participantName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        )}

        {/* Filming badge */}
        {story.willingToFilm && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#8B9E8B]/20 text-[#8B9E8B]">
              <Video className="w-3 h-3" />
              Video
            </span>
          </div>
        )}

        {/* County badge */}
        {story.county && story.county !== "Unknown" && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 text-gray-600 backdrop-blur-sm">
              <MapPin className="w-3 h-3" />
              {story.county}
            </span>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-4 space-y-3">
        {/* Name and headline */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {story.headline}
          </h3>
        </div>

        {/* Pull quote */}
        {story.pullQuote && (
          <div className="relative">
            <Quote className="absolute -top-1 -left-1 w-4 h-4 text-gray-200" />
            <p className="text-xs text-gray-600 italic pl-4 line-clamp-3">
              "{story.pullQuote}"
            </p>
          </div>
        )}

        {/* Archetype badges */}
        <div className="flex flex-wrap gap-1.5">
          {story.archetypes.slice(0, 2).map((archetype) => {
            const info = ARCHETYPE_INFO[archetype];
            return (
              <Badge
                key={archetype}
                variant="outline"
                className={cn(
                  "text-[10px] py-0",
                  info?.color === "navy" &&
                    "border-[#1E3A5F]/20 text-[#1E3A5F] bg-[#1E3A5F]/5",
                  info?.color === "blue" &&
                    "border-[#4A7CCC]/30 text-[#4A7CCC] bg-[#4A7CCC]/10",
                  info?.color === "blue-light" &&
                    "border-[#6B9BE0]/30 text-[#4A7CCC] bg-[#6B9BE0]/10",
                  info?.color === "amber" &&
                    "border-[#D4A574]/30 text-[#D4A574] bg-[#D4A574]/10",
                  info?.color === "coral" &&
                    "border-[#E07B67]/30 text-[#E07B67] bg-[#E07B67]/10",
                  info?.color === "sage" &&
                    "border-[#8B9E8B]/30 text-[#8B9E8B] bg-[#8B9E8B]/10"
                )}
              >
                {info?.label || archetype}
              </Badge>
            );
          })}
        </div>

        {/* Outcomes preview */}
        {(story.outcomes.fplAtExit || story.outcomes.wageGainAnnual) && (
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            {story.outcomes.fplAtExit && (
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-900">
                  {Math.round(story.outcomes.fplAtExit)}%
                </p>
                <p className="text-[10px] text-gray-500">FPL</p>
              </div>
            )}
            {story.outcomes.wageGainAnnual && story.outcomes.wageGainAnnual > 0 && (
              <div className="text-center">
                <p className="text-xs font-semibold text-[#4A7CCC]">
                  +${Math.round(story.outcomes.wageGainAnnual / 1000)}K
                </p>
                <p className="text-[10px] text-gray-500">Wage</p>
              </div>
            )}
          </div>
        )}

        {/* Click to read */}
        <div className="flex items-center justify-end pt-1">
          <span className="text-[10px] text-gray-400">Click to read</span>
        </div>
      </div>
    </>
  );

  if (prefersReducedMotion) {
    return (
      <button
        onClick={onClick}
        className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden text-left w-full hover:shadow-md transition-shadow cursor-pointer"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden text-left w-full cursor-pointer"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
            delay: delay * 0.08,
          },
        },
      }}
      whileHover={{
        y: -4,
        boxShadow: "0 12px 24px -8px rgb(0 0 0 / 0.12)",
        transition: { duration: 0.2 },
      }}
    >
      {cardContent}
    </motion.button>
  );
}
