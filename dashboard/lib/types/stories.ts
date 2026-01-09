// Participant Stories Types

export type Archetype =
  | "first-in-family"
  | "career-builder"
  | "stability-architect"
  | "two-generation-leader"
  | "crisis-navigator"
  | "system-connector";

export type StoryTag =
  | "graduation"
  | "income-increase"
  | "education"
  | "cliff-navigation"
  | "children-family"
  | "career-employment"
  | "partner-services"
  | "transportation"
  | "housing"
  | "single-parenting";

export type StoryDepth = "brief" | "moderate" | "detailed";
export type EmotionalResonance = "low" | "medium" | "high";

export interface MetricRelevance {
  fplGraduation: number;
  wageGains: number;
  childrenImpact: number;
  cliffCrossings: number;
  partnerEngagement: number;
}

export interface StoryOutcomes {
  fplAtEnrollment: number | null;
  fplAtExit: number | null;
  wageGainAnnual: number | null;
  daysInProgram: number | null;
}

export interface FullStory {
  success: string;
  financialSituation: string;
  inspiration: string;
  challenges: string;
  lifeChanged: string;
}

export interface ParticipantStory {
  id: string;
  participantName: string;
  county: string;
  releaseFormSigned: boolean;
  willingToFilm: boolean;
  photoPath: string | null;
  headline: string;
  pullQuote: string;
  fullStory: FullStory;
  archetypes: Archetype[];
  tags: StoryTag[];
  metricRelevance: MetricRelevance;
  outcomes: StoryOutcomes;
  storyDepth: StoryDepth;
  emotionalResonance: EmotionalResonance;
}

export interface ThemeDistribution {
  count: number;
  percentage: number;
}

export interface ArchetypeDistribution {
  count: number;
  percentage: number;
}

export interface StoriesMetadata {
  generated_at: string;
  total_stories: number;
  stories_with_release: number;
  stories_willing_to_film: number;
  stories_with_photos: number;
}

export interface StoriesData {
  metadata: StoriesMetadata;
  themeDistribution: Record<StoryTag, ThemeDistribution>;
  archetypeDistribution: Record<Archetype, ArchetypeDistribution>;
  stories: ParticipantStory[];
}

// Filter state for stories page
export interface StoryFilterState {
  themes: StoryTag[];
  archetypes: Archetype[];
  counties: string[];
  metricFocus: keyof MetricRelevance | null;
  hasPhoto: boolean | null;
  willingToFilm: boolean | null;
  searchQuery: string;
}

// Metric type for integration with metric pages
export type MetricType =
  | "fpl_graduation"
  | "wage_gains"
  | "children_impact"
  | "cliff_crossings"
  | "partner_engagement";

// Helper to map metric types to relevance keys
export const METRIC_TO_RELEVANCE: Record<MetricType, keyof MetricRelevance> = {
  fpl_graduation: "fplGraduation",
  wage_gains: "wageGains",
  children_impact: "childrenImpact",
  cliff_crossings: "cliffCrossings",
  partner_engagement: "partnerEngagement",
};

// Archetype display info
// Colors mapped to EUC brand palette: navy, blue, blue-light, amber, coral, sage
export const ARCHETYPE_INFO: Record<
  Archetype,
  { label: string; description: string; color: string }
> = {
  "first-in-family": {
    label: "First in Family",
    description: "Breaking generational cycles through education",
    color: "navy",
  },
  "career-builder": {
    label: "Career Builder",
    description: "Wage gains, promotions, career pathways",
    color: "blue",
  },
  "stability-architect": {
    label: "Stability Architect",
    description: "Housing, transportation, building foundations",
    color: "blue-light",
  },
  "two-generation-leader": {
    label: "Two-Generation Leader",
    description: "Creating better futures for children",
    color: "amber",
  },
  "crisis-navigator": {
    label: "Crisis Navigator",
    description: "Overcoming major life disruptions",
    color: "coral",
  },
  "system-connector": {
    label: "System Connector",
    description: "Leveraging partner services and resources",
    color: "sage",
  },
};

// Tag display info
// Colors mapped to EUC brand palette
export const TAG_INFO: Record<StoryTag, { label: string; color: string }> = {
  graduation: { label: "Graduation", color: "blue" },
  "income-increase": { label: "Income Increase", color: "sage" },
  education: { label: "Education", color: "navy" },
  "cliff-navigation": { label: "Cliff Navigation", color: "amber" },
  "children-family": { label: "Children & Family", color: "coral" },
  "career-employment": { label: "Career", color: "blue-light" },
  "partner-services": { label: "Partner Services", color: "sage" },
  transportation: { label: "Transportation", color: "gray" },
  housing: { label: "Housing", color: "amber" },
  "single-parenting": { label: "Single Parenting", color: "coral" },
};
