import knex, { Knex } from "knex";
import config from "../../knexFile";
import * as dotenv from "dotenv";

dotenv.config();

// Render does NOT load .env, so we detect production like this
const isProduction = process.env.RENDER === "true" || process.env.NODE_ENV === "production";

let db: Knex;

// 🔥 In production → always use DATABASE_URL (Render / Supabase)
if (isProduction) {
  db = knex({
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 10 },
  });
} else {
  // Local development → use knexfile.ts config
  db = knex(config.development);
}

// Test DB connection
db.raw("SELECT 1")
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch((err) => {
    console.error("❌ PostgreSQL connection failed:", err);
    process.exit(1);
  });

export default db;
