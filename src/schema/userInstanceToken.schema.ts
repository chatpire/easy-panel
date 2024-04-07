import { userInstanceAbilities } from "@/server/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { type z } from "zod";

export const UserInstanceAbilitySchema = createSelectSchema(userInstanceAbilities);
export type UserInstanceAbility = z.infer<typeof UserInstanceAbilitySchema>;
