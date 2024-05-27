import { type EventContent } from "@/schema/definition.schema";
import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  boolean,
  text,
  integer,
  timestamp,
  primaryKey,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { type EventResultType, type EventType, type ServiceType } from "@/server/db/enum";
import { createJsonbType } from "./jsonb";
import { type GlobalSettingContent } from "@/schema/globalSetting.schema";
import { type ResourceUsageLogDetails } from "@/schema/resourceLog.schema";
import { type ServiceInstanceData } from "@/schema/serviceInstance.schema";
import { type UserInstanceData } from "@/schema/userInstanceAbility.schema";

// Enums
export const userRole = pgEnum("user_role", ["USER", "ADMIN"]);

// Tables
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    name: text("name").notNull(),
    email: text("email"),
    role: userRole("role").notNull().default("USER"),
    image: text("image"),
    comment: text("comment"),
    expireAt: timestamp("expire_at"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    hashedPassword: text("hashed_password"),
  },
  (table) => ({
    uniqueUsername: unique().on(table.username),
    uniqueEmail: unique().on(table.email),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  instanceTokens: many(userInstanceAbilities),
}));

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    currentIp: text("current_ip"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const serviceInstances = pgTable(
  "service_instances",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull().$type<ServiceType>(),
    name: text("name").notNull(),
    description: text("description"),
    url: text("url"),
    data: createJsonbType<ServiceInstanceData>("data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueName: unique().on(table.name),
  }),
);

export const serviceInstancesRelations = relations(serviceInstances, ({ many }) => ({
  userAbilities: many(userInstanceAbilities),
}));

export const userInstanceAbilities = pgTable(
  "user_instance_ability",
  {
    userId: text("user_id").notNull(),
    instanceId: text("instance_id").notNull(),
    token: text("token"),
    canUse: boolean("can_use").notNull().default(true),
    data: createJsonbType<UserInstanceData>("data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.instanceId] }),
    uniqueToken: unique().on(table.token),
  }),
);

export const userInstanceAbilitiesRelations = relations(userInstanceAbilities, ({ one }) => ({
  user: one(users, {
    fields: [userInstanceAbilities.userId],
    references: [users.id],
  }),
  instance: one(serviceInstances, {
    fields: [userInstanceAbilities.instanceId],
    references: [serviceInstances.id],
  }),
}));

export const eventLogs = pgTable(
  "event_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    type: text("type").notNull().$type<EventType>(),
    resultType: text("result_type").notNull().$type<EventResultType>(),
    // content: jsonb("content").notNull().$type<EventContent>(),
    content: createJsonbType<EventContent>("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    indexCreatedAtUserId: index().on(table.createdAt, table.userId),
  }),
);

export const eventLogsRelations = relations(eventLogs, ({ one }) => ({
  user: one(users, {
    fields: [eventLogs.userId],
    references: [users.id],
  }),
}));

export const resourceUsageLogs = pgTable(
  "resource_usage_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    instanceId: text("instance_id"),
    type: text("type").notNull().$type<ServiceType>(),
    text: text("text"),
    textBytes: integer("text_bytes"),
    // details: jsonb("details").notNull().$type<ResourceUsageLogDetails>(),
    details: createJsonbType<ResourceUsageLogDetails>("details").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    indexTypeCreatedAt: index().on(table.type, table.createdAt),
    indexUserId: index().on(table.userId),
    indexInstanceId: index().on(table.instanceId),
  }),
);

export const resourceUsageLogsRelations = relations(resourceUsageLogs, ({ one }) => ({
  user: one(users, {
    fields: [resourceUsageLogs.userId],
    references: [users.id],
  }),
  instance: one(serviceInstances, {
    fields: [resourceUsageLogs.instanceId],
    references: [serviceInstances.id],
  }),
}));

export const globalSettings = pgTable("global_settings", {
  key: text("key").primaryKey(),
  content: createJsonbType<GlobalSettingContent>("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
