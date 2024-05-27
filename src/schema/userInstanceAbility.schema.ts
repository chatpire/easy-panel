import { userInstanceAbilities } from "@/server/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { PoekmonSharedUserInstanceDataSchema } from "./service/poekmon-shared.schema";

export const UserInstanceDataSchema = z.discriminatedUnion("type", [PoekmonSharedUserInstanceDataSchema]);
export type UserInstanceData = z.infer<typeof UserInstanceDataSchema>;

export const UserInstanceAbilitySchema = createSelectSchema(userInstanceAbilities);
export type UserInstanceAbility = z.infer<typeof UserInstanceAbilitySchema>;
