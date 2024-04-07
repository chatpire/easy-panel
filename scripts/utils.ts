import { env } from "@/env";
import { createCUID } from "@/lib/cuid";
import { hashPassword } from "@/lib/password";
import { UserCreateSchema, UserRoles } from "@/schema/user.schema";
import { type Db } from "@/server/db";
import { users } from "@/server/db/schema";

export async function createAdminUser(db: Db) {
  const username = env.ADMIN_USERNAME;
  const name = "Admin";
  const password = env.ADMIN_PASSWORD;
  const email = env.ADMIN_EMAIL;

  const result = await db
    .insert(users)
    .values({
      ...UserCreateSchema.parse({
        name,
        username,
        email,
        role: UserRoles.ADMIN,
      }),
      hashedPassword: await hashPassword(password),
      id: createCUID(),
    })
    .onConflictDoNothing()
    .returning();
  return result[0]!;
}
