import {
  type ServiceTypeSchema,
  type ResourceTypeSchema,
  type DurationWindowSchema,
  type ServiceInstanceAttributesSchema,
  type EventTypeSchema,
  type EventResultTypeSchema,
  type ResourceEventTypeSchema,
} from "@/schema/definition.schema";

declare global {
  type ServiceType = z.infer<typeof ServiceTypeSchema>;

  type ResourceType = z.infer<typeof ResourceTypeSchema>;

  type ServiceInstanceAttributes = z.infer<typeof ServiceInstanceAttributesSchema>;

  type DurationWindow = z.infer<typeof DurationWindowSchema>;

  type EventType = z.infer<typeof EventTypeSchema>;

  type EventResultType = z.infer<typeof EventResultTypeSchema>;

  type ResourceEventType = z.infer<typeof ResourceEventTypeSchema>;
}
