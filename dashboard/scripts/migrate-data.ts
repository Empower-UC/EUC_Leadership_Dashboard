import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import * as schema from "../lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse date string to Date object
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === "") return null;
  // Handle formats like "05/17/2023 05:45" or "2023-05-17"
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// Parse number
function parseNumber(str: string): number | null {
  if (!str || str === "") return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

// Parse boolean from various string representations
function parseBoolean(str: string): boolean | null {
  if (!str || str === "") return null;
  const lower = str.toLowerCase();
  if (lower === "yes" || lower === "true" || lower === "1") return true;
  if (lower === "no" || lower === "false" || lower === "0") return false;
  return null;
}

async function migrate() {
  console.log("Starting data migration...");

  // Read the CSV file
  const csvPath = path.resolve(
    __dirname,
    "../../data/processed/master_participant_file.csv"
  );
  console.log(`Reading from: ${csvPath}`);

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").filter((line) => line.trim());
  const headers = parseCSVLine(lines[0]);

  console.log(`Found ${lines.length - 1} rows`);

  // Create index map for headers
  const headerIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    headerIndex[h.trim()] = i;
  });

  // Collect unique navigators and counties
  const navigatorSet = new Set<string>();
  const countySet = new Set<string>();
  const rows: string[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    rows.push(row);

    const navigator = row[headerIndex["emp_navigator"]];
    const county = row[headerIndex["emp_county"]];

    if (navigator && navigator !== "") navigatorSet.add(navigator);
    if (county && county !== "") countySet.add(county);
  }

  console.log(`Found ${navigatorSet.size} unique navigators`);
  console.log(`Found ${countySet.size} unique counties`);

  // Clear existing data (in correct order due to foreign keys)
  console.log("Clearing existing data...");
  await db.delete(schema.metrics);
  await db.delete(schema.outcomes);
  await db.delete(schema.participants);
  await db.delete(schema.navigators);
  await db.delete(schema.counties);

  // Insert counties
  console.log("Inserting counties...");
  const countyMap = new Map<string, string>();
  for (const countyName of countySet) {
    const [inserted] = await db
      .insert(schema.counties)
      .values({
        name: countyName,
      })
      .returning({ id: schema.counties.id });
    countyMap.set(countyName, inserted.id);
  }

  // Insert navigators
  console.log("Inserting navigators...");
  const navigatorMap = new Map<string, string>();
  for (const navigatorName of navigatorSet) {
    const [inserted] = await db
      .insert(schema.navigators)
      .values({
        name: navigatorName,
      })
      .returning({ id: schema.navigators.id });
    navigatorMap.set(navigatorName, inserted.id);
  }

  // Insert participants and outcomes
  console.log("Inserting participants and outcomes...");
  let successCount = 0;
  let errorCount = 0;

  for (const row of rows) {
    try {
      const participantId = row[headerIndex["participant_id"]];
      const county = row[headerIndex["emp_county"]];
      const navigatorName = row[headerIndex["emp_navigator"]];
      const enrollmentStatus = row[headerIndex["Enrollment Status"]];
      const enrollmentDateStr = row[headerIndex["emp_enrollment_date"]];
      const householdSize = parseNumber(
        row[headerIndex["emp_household_size_at_enrollment"]]
      );
      const childrenInHousehold = parseNumber(
        row[headerIndex["How many children currently live in Household?"]]
      );
      const employedStr = row[headerIndex["Are you currently employed?"]];

      const navigatorId = navigatorName
        ? navigatorMap.get(navigatorName)
        : null;

      // Insert participant
      const [participant] = await db
        .insert(schema.participants)
        .values({
          participantId,
          county: county || "Unknown",
          enrollmentStatus,
          enrollmentDate: parseDate(enrollmentDateStr),
          navigatorId: navigatorId || null,
          navigatorName: navigatorName || null,
          householdSize: householdSize ? Math.round(householdSize) : null,
          childrenInHousehold: childrenInHousehold ? Math.round(childrenInHousehold) : null,
          employedAtEnrollment: parseBoolean(employedStr),
        })
        .returning({ id: schema.participants.id });

      // Insert outcome
      const fplAtEnrollment = parseNumber(
        row[headerIndex["emp_fpl_at_enrollment"]]
      );
      const currentFpl = parseNumber(row[headerIndex["emp_current_fpl"]]);
      const fplChange = parseNumber(row[headerIndex["emp_fpl_change"]]);
      const wageChange = parseNumber(
        row[headerIndex["emp_wage_increases_since_enrollment"]]
      );
      const daysInProgram = parseNumber(
        row[headerIndex["emp_days_in_program"]]
      );
      const outcomeCategory = row[headerIndex["outcome_category"]];

      await db.insert(schema.outcomes).values({
        participantId: participant.id,
        fplAtEnrollment,
        currentFpl,
        fplChange,
        wageChange,
        daysInProgram: daysInProgram ? Math.round(daysInProgram) : null,
        outcomeCategory,
      });

      successCount++;
    } catch (err) {
      errorCount++;
      console.error(`Error processing row: ${err}`);
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`Successfully imported: ${successCount} participants`);
  console.log(`Errors: ${errorCount}`);

  // Calculate and insert aggregate metrics
  console.log("\nCalculating aggregate metrics...");

  const totalParticipants = successCount;
  const graduatedCount = rows.filter(
    (r) => r[headerIndex["outcome_category"]]?.toLowerCase() === "graduated"
  ).length;
  const activeCount = rows.filter(
    (r) => r[headerIndex["outcome_category"]]?.toLowerCase() === "active"
  ).length;

  let totalWageGains = 0;
  for (const row of rows) {
    const wage = parseNumber(
      row[headerIndex["emp_wage_increases_since_enrollment"]]
    );
    if (wage && wage > 0) totalWageGains += wage;
  }

  await db.insert(schema.metrics).values([
    {
      metricName: "total_families",
      metricValue: totalParticipants,
      notes: "program",
    },
    {
      metricName: "graduated_count",
      metricValue: graduatedCount,
      notes: "outcomes",
    },
    {
      metricName: "active_count",
      metricValue: activeCount,
      notes: "outcomes",
    },
    {
      metricName: "total_wage_gains",
      metricValue: totalWageGains,
      notes: "financial",
    },
    {
      metricName: "graduation_rate",
      metricValue: parseFloat(((graduatedCount / totalParticipants) * 100).toFixed(2)),
      notes: "outcomes",
    },
  ]);

  console.log("Metrics inserted successfully");

  await client.end();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
