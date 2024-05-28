import { serviceInstances } from "@/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { ServiceTypeSchema } from "@/server/db/enum";
import { PoekmonAPIInstanceDataSchema } from "./service/poekmon-api.schema";
import { PoekmonSharedInstanceDataSchema } from "./service/poekmon-shared.schema";

export const ServiceInstanceDataSchema = z.discriminatedUnion("type", [PoekmonAPIInstanceDataSchema, PoekmonSharedInstanceDataSchema]);
export type ServiceInstanceData = z.infer<typeof ServiceInstanceDataSchema>;

export const ServiceInstanceAdminSchema = createSelectSchema(serviceInstances).merge(
  z.object({
    type: ServiceTypeSchema,
  }),
);
export type ServiceInstance = z.infer<typeof ServiceInstanceAdminSchema>;

export const ServiceInstanceUserReadSchema = ServiceInstanceAdminSchema.omit({
  data: true,
});
export type ServiceInstanceUserRead = z.infer<typeof ServiceInstanceUserReadSchema>;

const ServiceInstanceInsertSchema = createInsertSchema(serviceInstances).merge(
  z.object({
    type: ServiceTypeSchema,
    description: z.string().optional(),
    url: z.string().url().optional(),
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

export const ServiceInstanceWithToken = ServiceInstanceUserReadSchema.merge(
  z.object({
    token: z.string(),
  }),
);
export type ServiceInstanceWithToken = z.infer<typeof ServiceInstanceWithToken>;
