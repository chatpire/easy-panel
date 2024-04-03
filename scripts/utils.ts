import { env } from "@/env";
import { hashPassword } from "@/lib/password";
import { UserCreateInputSchema } from "@/schema/generated/zod";
import { type PrismaClient, UserRole } from "@prisma/client";

export async function createAdminUser(prisma: PrismaClient) {
  const name = "Admin";
  const username = env.ADMIN_USERNAME;
  const password = env.ADMIN_PASSWORD;
  const email = env.ADMIN_EMAIL;

  const admin = await prisma.user.create({
    data: UserCreateInputSchema.parse({
      name,
      username,
      hashedPassword: await hashPassword(password),
      email,
      role: UserRole.ADMIN,
    }),
  });
  return admin;
}
