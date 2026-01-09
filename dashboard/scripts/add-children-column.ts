import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(connectionString, { prepare: false });

async function addColumn() {
  console.log("Adding children_in_household column...");

  try {
    await client`
      ALTER TABLE participants
      ADD COLUMN IF NOT EXISTS children_in_household INTEGER
    `;
    console.log("Column added successfully");
  } catch (err) {
    console.log("Column may already exist or error:", err);
  }

  await client.end();
}

addColumn();
