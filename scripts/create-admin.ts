// scripts/createAdmin.ts
import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "@/lib/password";
import { UserCreateInputSchema } from "@/schema/generated/zod";

const prisma = new PrismaClient();

async function main() {
  try {
    const name = process.env.ADMIN_NAME ?? "Admin";
    const username = process.env.ADMIN_USERNAME ?? "admin";
    const password = process.env.ADMIN_PASSWORD ?? "password";
    const email = process.env.ADMIN_EMAIL ?? "admin@example.com";

    const admin = await prisma.user.create({
      data: UserCreateInputSchema.parse({
        name,
        username,
        hashedPassword: await hashPassword(password),
        email,
        role: UserRole.ADMIN,
      }),
    });

    console.log("Admin user created:", admin);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

await main();
