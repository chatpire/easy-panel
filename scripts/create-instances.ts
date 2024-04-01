// scripts/createAdmin.ts
import { PrismaClient } from "@prisma/client";
import { ServiceInstanceCreateInputSchema } from "@/schema/generated/zod";

const prisma = new PrismaClient();

async function main() {
  try {
    const instanceUrls = ["http://localhost:3000"];

    for (let i = 0; i < instanceUrls.length; i++) {
      const instanceInput = ServiceInstanceCreateInputSchema.parse({
        type: "CHATGPT_SHARED",
        name: `ChatGPT Shared ${i}`,
        url: instanceUrls[i],
      });

      const instance = await prisma.serviceInstance.create({
        data: instanceInput,
      });

      console.log("Service instance created:", instance);
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

await main();
