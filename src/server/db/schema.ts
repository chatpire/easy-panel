import { env } from "@/env";
import { type EventContent, type ResourceUsageLogDetails } from "@/schema/definition.schema";
import { relations, sql } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  boolean,
  text,
  integer,
  foreignKey,
  timestamp,
  primaryKey,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { type EventResultType, type EventType, type ServiceType } from "@/server/db/enum";
import { createJsonbType } from "./jsonb";
import { type GlobalSettingContent } from "@/schema/globalSetting.schema";

// Enums
export const userRole = pgEnum("user_role", ["USER", "ADMIN"]);

// Tables
export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    username: text("username").notNull(),
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
  instanceTokens: many(userInstanceTokens),
}));

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    currentIp: text("current_ip"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    fkUser: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  }),
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
    url: text("url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueName: unique().on(table.name),
  }),
);

export const serviceInstancesRelations = relations(serviceInstances, ({ many }) => ({
  userTokens: many(userInstanceTokens),
}));

export const userInstanceTokens = pgTable(
  "user_instance_tokens",
  {
    userId: text("user_id").notNull(),
    instanceId: text("instance_id").notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.instanceId] }),
    referenceUserId: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
    referenceInstanceId: foreignKey({
      columns: [table.instanceId],
      foreignColumns: [serviceInstances.id],
    }),
    uniqueToken: unique().on(table.token),
  }),
);

export const userInstanceTokensRelations = relations(userInstanceTokens, ({ one }) => ({
  user: one(users, {
    fields: [userInstanceTokens.userId],
    references: [users.id],
  }),
  instance: one(serviceInstances, {
    fields: [userInstanceTokens.instanceId],
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
    content: createJsonbType<EventContent>("content"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    fkUser: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
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
    details: createJsonbType<ResourceUsageLogDetails>("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    fkUser: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
    fkInstance: foreignKey({
      columns: [table.instanceId],
      foreignColumns: [serviceInstances.id],
    }),
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
  content: createJsonbType<GlobalSettingContent>("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
