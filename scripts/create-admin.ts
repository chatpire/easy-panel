import { db } from "@/server/db";
import { createAdminUser } from "./utils";

async function main() {
  const admin = await createAdminUser(db);
  console.log(`Created admin user ${admin.name}, id: ${admin.id}`);
}

main()
  .then()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
