import { userInstanceTokens } from "@/server/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const UserInstanceTokenSchema = createSelectSchema(userInstanceTokens);
export type UserInstanceToken = z.infer<typeof UserInstanceTokenSchema>;