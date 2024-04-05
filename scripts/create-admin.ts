import "dotenv/config";
import { conn, db } from "@/server/db";
import { createAdminUser } from "./utils";

async function main() {
  console.log("DATABASE_TYPE", process.env.DATABASE_TYPE);
  const admin = await createAdminUser(db);
  console.log(`Created admin user ${admin.name}, id: ${admin.id}`);
  return admin;
}

main()
  .then(async () => {
    await conn.end();
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
