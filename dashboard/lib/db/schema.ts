import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  boolean,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const outcomeCategory = pgEnum("outcome_category", [
  "graduated",
  "active",
  "dismissed",
  "withdrawn",
  "other",
]);

export const enrollmentStatus = pgEnum("enrollment_status", [
  "Accepted",
  "Dismissed",
  "Withdrawn",
  "Exited",
]);

// Counties in Upper Cumberland
export const counties = pgTable("counties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Navigators (program staff)
export const navigators = pgTable("navigators", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Main participants table
export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  participantId: text("participant_id").notNull().unique(), // Original ID from data

  // Demographics (non-PII summary fields only)
  county: text("county").notNull(),
  enrollmentStatus: text("enrollment_status"),
  enrollmentDate: timestamp("enrollment_date"),

  // Navigator assignment
  navigatorId: uuid("navigator_id").references(() => navigators.id),
  navigatorName: text("navigator_name"), // Denormalized for easy queries

  // Household
  householdSize: integer("household_size"),
  childrenInHousehold: integer("children_in_household"),

  // Employment at enrollment
  employedAtEnrollment: boolean("employed_at_enrollment"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Outcomes/progress tracking
export const outcomes = pgTable("outcomes", {
  id: uuid("id").primaryKey().defaultRandom(),
  participantId: uuid("participant_id")
    .notNull()
    .references(() => participants.id),

  // FPL data
  fplAtEnrollment: real("fpl_at_enrollment"),
  currentFpl: real("current_fpl"),
  fplChange: real("fpl_change"),

  // Wage data
  wageChange: real("wage_change"), // Wage increase/decrease since enrollment

  // Program duration
  daysInProgram: integer("days_in_program"),

  // Outcome category
  outcomeCategory: text("outcome_category"), // graduated, active, dismissed, withdrawn, other

  // Timestamps
  recordedAt: timestamp("recorded_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Aggregated metrics (pre-computed for dashboard speed)
export const metrics = pgTable("metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  metricName: text("metric_name").notNull(),
  metricValue: real("metric_value").notNull(),
  metricDate: timestamp("metric_date").defaultNow(),
  notes: text("notes"),
});

// Types for TypeScript
export type County = typeof counties.$inferSelect;
export type Navigator = typeof navigators.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Outcome = typeof outcomes.$inferSelect;
export type Metric = typeof metrics.$inferSelect;

export type NewParticipant = typeof participants.$inferInsert;
export type NewOutcome = typeof outcomes.$inferInsert;
