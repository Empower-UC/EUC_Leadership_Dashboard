"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Newspaper,
  Users,
  Baby,
  DollarSign,
  Download,
  FileText,
  Quote,
  MapPin,
  Heart,
  Video,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { StoryCarousel } from "@/components/meeting-prep/story-carousel";
import { ShareableStatCard } from "@/components/meeting-prep/shareable-stat-card";
import { getMediaData, getStoriesForAudience } from "@/lib/data/audience-meeting-data";

export default function MediaMeetingPrepPage() {
  const prefersReducedMotion = useReducedMotion();
  const data = getMediaData();
  const stories = getStoriesForAudience('media', 5);

  // Get filmable and high-resonance counts
  const filmableCount = data.featuredStories.totalWillingToFilm;
  const withReleaseCount = data.featuredStories.totalWithRelease;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Topbar
        title="Media View"
        description="Human stories and shareable content"
      />

      <div className="px-10 py-10 max-w-6xl">
        {/* Back navigation */}
        <Link
          href="/meeting-prep"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to audience selection
        </Link>

        {/* Hero Card */}
        <motion.div
          className="bg-gradient-to-br from-[#E07B67] to-[#D4A574] rounded-3xl p-8 text-white shadow-lg mb-8"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Newspaper className="w-5 h-5" />
                </div>
                <span className="text-white/70 text-sm font-medium">For Media & Public Communications</span>
              </div>
              <h1 className="text-4xl font-bold mb-3 leading-tight max-w-xl">
                {data.hero.headline}
              </h1>
              <p className="text-white/80 max-w-xl text-lg">
                {data.hero.subhead}
              </p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold font-data">{data.hero.primaryMetric.value}</p>
              <p className="text-white/70 text-sm mt-1">{data.hero.primaryMetric.label}</p>
              <p className="text-white/60 text-xs mt-1">{data.hero.primaryMetric.context}</p>
            </div>
          </div>
        </motion.div>

        {/* Video-Ready Stories Banner */}
        <motion.div
          className="bg-[#8B9E8B]/10 border border-[#8B9E8B]/30 rounded-2xl p-4 mb-8 flex items-center justify-between"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#8B9E8B]/20 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-[#8B9E8B]" />
            </div>
            <div>
              <p className="font-semibold text-[#1E3A5F]">
                {filmableCount} families willing to be filmed
              </p>
              <p className="text-sm text-[#8B9E8B]">
                {withReleaseCount} have signed media release forms • Ready for documentary or feature
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#8B9E8B] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F] transition-colors">
            Contact for B-roll
          </button>
        </motion.div>

        {/* Shareable Stats */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Shareable Statistics
          </h2>
          <ShareableStatCard
            stats={data.shareableStats}
            title="Click-to-Copy for Social Media"
          />
        </motion.section>

        {/* Cliff Myth-Buster */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            The Benefits Cliff Story
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{data.cliffMythBuster.headline}</h3>
                <p className="text-sm text-gray-500">A compelling narrative that challenges conventional wisdom</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* The Myth */}
              <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
                <div className="flex items-center gap-2 mb-3">
                  <Quote className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">The Myth</span>
                </div>
                <p className="text-gray-700 italic">{data.cliffMythBuster.myth}</p>
              </div>

              {/* The Reality */}
              <div className="bg-[#8B9E8B]/10 rounded-xl p-5 border border-[#8B9E8B]/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-[#8B9E8B]" />
                  <span className="text-xs font-semibold text-[#8B9E8B] uppercase tracking-wider">The Reality</span>
                </div>
                <p className="text-gray-700">{data.cliffMythBuster.reality}</p>
              </div>
            </div>

            {/* Visual data */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Of <span className="font-semibold">{data.cliffMythBuster.data.crossedCliff}</span> families who crossed the SNAP cliff:</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold font-data text-[#8B9E8B]">{data.cliffMythBuster.data.keptClimbing}</p>
                    <p className="text-xs text-[#8B9E8B]">Kept climbing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold font-data text-[#E07B67]">{data.cliffMythBuster.data.fellBack}</p>
                    <p className="text-xs text-[#E07B67]">Fell back</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Featured Stories Carousel */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Featured Stories
          </h2>
          <StoryCarousel
            stories={stories}
            title="Voices from the Program"
            subtitle="Real families, real transformations—many ready for interviews"
            showFilmBadge={true}
          />
        </motion.section>

        {/* Story Themes for Pitching */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Story Angles by Theme
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.themes as Record<string, { count: number; percentage: number }>)
                .sort(([, a], [, b]) => b.count - a.count)
                .slice(0, 6)
                .map(([theme, themeData]) => (
                  <div
                    key={theme}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {theme.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </p>
                      <p className="text-xs text-gray-500">{themeData.count} stories available</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-data text-[#D4A574]">
                        {themeData.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </motion.section>

        {/* Story Archetypes */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Character Archetypes
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(data.archetypes as Record<string, { count: number; percentage: number }>)
              .sort(([, a], [, b]) => b.count - a.count)
              .slice(0, 6)
              .map(([archetype, archetypeData]) => (
                <motion.div
                  key={archetype}
                  className="bg-white rounded-xl p-4 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    {archetype.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{archetypeData.percentage}% of stories</p>
                  <p className="text-xs text-[#D4A574] font-medium">{archetypeData.count} families match</p>
                </motion.div>
              ))}
          </div>
        </motion.section>

        {/* Human Numbers Grid */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Human-Scale Numbers
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] text-center">
              <Baby className="w-6 h-6 text-[#4A7CCC] mx-auto mb-2" />
              <p className="text-3xl font-bold font-data text-gray-900">
                {data.shareableStats[1]?.stat ?? 'N/A'}
              </p>
              <p className="text-sm text-gray-500">children impacted</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] text-center">
              <DollarSign className="w-6 h-6 text-[#8B9E8B] mx-auto mb-2" />
              <p className="text-3xl font-bold font-data text-gray-900">
                {data.shareableStats[0]?.stat ?? 'N/A'}
              </p>
              <p className="text-sm text-gray-500">wage gains</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] text-center">
              <TrendingUp className="w-6 h-6 text-[#D4A574] mx-auto mb-2" />
              <p className="text-3xl font-bold font-data text-gray-900">
                {data.shareableStats[2]?.stat ?? 'N/A'}
              </p>
              <p className="text-sm text-gray-500">{data.shareableStats[2]?.label ?? ''}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] text-center">
              <Users className="w-6 h-6 text-[#1E3A5F] mx-auto mb-2" />
              <p className="text-3xl font-bold font-data text-gray-900">
                {data.shareableStats[3]?.stat ?? 'N/A'}
              </p>
              <p className="text-sm text-gray-500">{data.shareableStats[3]?.label ?? ''}</p>
            </div>
          </div>
        </motion.section>

        {/* The Setting */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            The Setting
          </h2>
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#D4A574]" />
              <h3 className="font-semibold text-gray-900">Tennessee's Upper Cumberland Region</h3>
            </div>
            <p className="text-gray-600 mb-4">
              14 rural counties where good jobs are scarce, public transportation doesn't exist,
              and the "benefits cliff" traps families in poverty. This is where traditional
              welfare programs have struggled the most—and where EUC is writing a different story.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Heart className="w-4 h-4 text-[#D4A574]" />
                <span>17 local navigators</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4 text-[#D4A574]" />
                <span>14 counties</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Video className="w-4 h-4 text-[#D4A574]" />
                <span>{filmableCount} video-ready families</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Export */}
        <motion.div
          className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Media Press Kit</p>
              <p className="text-sm text-gray-500">
                Fact sheet, story summaries, and high-res imagery
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#E07B67] text-white rounded-lg hover:bg-[#D4A574] transition-colors">
            <Download className="w-4 h-4" />
            Download Press Kit
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-xs text-gray-400 mt-8 text-center"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          Stories shared with participant consent • {withReleaseCount} families have signed release forms
        </motion.p>
      </div>
    </div>
  );
}
