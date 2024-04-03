import { PrismaClient } from "@prisma/client";
import { createAdminUser } from "./utils";

const prisma = new PrismaClient();

async function main() {
  const admin = await createAdminUser(prisma);
  console.log(`Created admin user ${admin.name}, id: ${admin.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
