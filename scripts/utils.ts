import { hashPassword } from "@/lib/password";
import { UserCreateInputSchema } from "@/schema/generated/zod";
import { type PrismaClient, UserRole } from "@prisma/client";

export async function createAdminUser(prisma: PrismaClient) {
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
  return admin;
}
