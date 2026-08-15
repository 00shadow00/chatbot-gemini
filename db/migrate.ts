import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { sql } from "drizzle-orm";
import postgres from "postgres";

config({
  path: ".env.local",
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log("⏳ Running migrations...");

  const start = Date.now();

  await migrate(db, {
    migrationsFolder: "./lib/drizzle",
  });

  console.log("🔧 Checking Chat.messages column...");

  await db.execute(sql`
    ALTER TABLE "Chat"
    ADD COLUMN IF NOT EXISTS "messages" json NOT NULL DEFAULT '[]'::json;
  `);

  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");

  await connection.end();

  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
