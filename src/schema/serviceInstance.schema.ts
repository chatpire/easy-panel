import { serviceInstances } from "@/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { ServiceTypeSchema } from "./definition.schema";

export const ServiceInstanceSchema = createSelectSchema(serviceInstances).merge(
  z.object({
    type: ServiceTypeSchema,
  }),
);
export type ServiceInstance = z.infer<typeof ServiceInstanceSchema>;

const ServiceInstanceInsertSchema = createInsertSchema(serviceInstances);
export const ServiceInstanceCreateSchema = ServiceInstanceInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).merge(
  z.object({
    type: ServiceTypeSchema,
    description: z.string().optional(),
  }),
);
export type ServiceInstanceCreate = z.infer<typeof ServiceInstanceCreateSchema>;

export const ServiceInstanceUpdateSchema = ServiceInstanceInsertSchema.pick({
  id: true,
  name: true,
  description: true,
});
