import { z } from "zod";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "@/server/db/schema";

export const UserSchema = createSelectSchema(users);
export type User = z.infer<typeof UserSchema>;

export const UserRoleSchema = UserSchema.shape.role;
export const UserRoles = UserRoleSchema.Values;
export type UserRole = z.infer<typeof UserRoleSchema>;

const UserInsertSchema = createInsertSchema(users);
export const UserCreateSchema = UserInsertSchema.omit({
  id: true,
  hashedPassword: true,
  createdAt: true,
  updatedAt: true,
}).merge(
  z.object({
    password: z.string().min(6).optional(),
  }),
);
export type UserCreate = z.infer<typeof UserCreateSchema>;

export const UserReadAdminSchema = UserSchema.omit({
  hashedPassword: true,
});

export const UserReadAdminWithLastLoginSchema = UserReadAdminSchema.merge(
  z.object({
    lastLoginAt: z
      .string()
      .nullish()
      .transform((v) => (v ? new Date(v) : null)),
  }),
);

export type UserReadAdmin = z.infer<typeof UserReadAdminSchema>;

export const UserReadSchema = UserReadAdminSchema.omit({
  comment: true,
});
export type UserRead = z.infer<typeof UserReadSchema>;

const UserPasswordSchema = z.object({
  password: z.string().min(6),
});
export const UserLoginFormSchema = UserSchema.pick({
  username: true,
}).merge(UserPasswordSchema);
export const UserUpdatePasswordSchema = UserSchema.pick({
  id: true,
}).merge(UserPasswordSchema);

export const UserUpdateAdminSchema = UserCreateSchema.partial().merge(
  z.object({
    id: z.string(),
    clearPassword: z.boolean().optional().default(false),
  }),
);

export const UserUpdateSelfSchema = UserUpdateAdminSchema.pick({
  name: true,
});
