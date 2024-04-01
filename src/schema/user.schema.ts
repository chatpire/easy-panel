import {
  UserGroupSchema,
  UserSchema,
} from "@/schema/generated/zod";
import { z } from "zod";

export const UserReadAdminSchema = UserSchema.omit({
  hashedPassword: true,
}).merge(
  z.object({
    group: UserGroupSchema
  }),
);

export type UserReadAdmin = z.infer<typeof UserReadAdminSchema>;

export const UserReadSchema = UserReadAdminSchema.omit({
  comment: true,
});

export const UserPasswordSchema = z.object({
  password: z.string().min(6),
});

export const UserLoginFormSchema = UserSchema.pick({
  username: true,
}).merge(UserPasswordSchema);

export const UserUpdatePasswordSchema = UserSchema.pick({
  id: true,
}).merge(UserPasswordSchema);

export const UserUpdateAdminSchema = UserReadAdminSchema.omit({
  userToken: true,
  createdAt: true,
  updatedAt: true,
});

export const UserUpdateSelfSchema = UserUpdateAdminSchema.omit({
  id: true,
  group: true,
});
