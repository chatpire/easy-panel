import { serviceInstances } from "@/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { ServiceTypeSchema } from "@/server/db/enum";
import { UserInstanceAbilitySchema } from "./userInstanceToken.schema";

export const ServiceInstanceSchema = createSelectSchema(serviceInstances).merge(
  z.object({
    type: ServiceTypeSchema,
  }),
);
export type ServiceInstance = z.infer<typeof ServiceInstanceSchema>;

const ServiceInstanceInsertSchema = createInsertSchema(serviceInstances).merge(
  z.object({
    type: ServiceTypeSchema,
    description: z.string().optional(),
    url: z.string().url(),
  }),
);

export const ServiceInstanceCreateSchema = ServiceInstanceInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ServiceInstanceCreate = z.infer<typeof ServiceInstanceCreateSchema>;

export const ServiceInstanceUpdateSchema = ServiceInstanceInsertSchema.omit({
  createdAt: true,
});

export const ServiceInstanceWithToken = ServiceInstanceSchema.merge(
  z.object({
    token: z.string(),
  }),
);
export type ServiceInstanceWithToken = z.infer<typeof ServiceInstanceWithToken>;