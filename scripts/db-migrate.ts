import "dotenv/config";
import { conn, db } from "@/server/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";

migrate(db, { migrationsFolder: "./drizzle" })
  .then(async () => {
    await conn.end();
  })
  .catch(async (err) => {
    console.error(err);
    await conn.end();
    process.exit(1);
  });
