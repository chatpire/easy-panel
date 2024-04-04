import { env } from "@/env";
import { createCUID } from "@/lib/cuid";
import { hashPassword } from "@/lib/password";
import { UserCreateSchema, UserRoles } from "@/schema/user.schema";
import { Db } from "@/server/db";
import { users } from "@/server/db/schema";

export async function createAdminUser(db: Db) {
  const name = "Admin";
  const username = env.ADMIN_USERNAME;
  const password = env.ADMIN_PASSWORD;
  const email = env.ADMIN_EMAIL;

  const result = await db
    .insert(users)
    .values({
      id: createCUID(),
      name,
      username,
      hashedPassword: await hashPassword(password),
      email,
      role: UserRoles.ADMIN,
    })
    .returning();
  return result[0]!;
}
