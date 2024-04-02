import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { ServiceTypeSchema, DurationWindowSchema, ServiceInstanceAttributesSchema, EventTypeSchema, EventContentSchema, EventResultTypeSchema, ResourceEventTypeSchema } from '@/schema/definition.schema'

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','username','email','role','image','comment','validUntil','isActive','createdAt','updatedAt','hashedPassword']);

export const SessionScalarFieldEnumSchema = z.enum(['id','userId','expiresAt','currentIp','createdAt']);

export const ServiceInstanceScalarFieldEnumSchema = z.enum(['id','type','name','description','url','createdAt','updatedAt']);

export const UserInstanceTokenScalarFieldEnumSchema = z.enum(['id','userId','instanceId','token','isActive','createdAt','updatedAt']);

export const UserEventLogScalarFieldEnumSchema = z.enum(['id','userId','type','resultType','content','timestamp']);

export const UserResourceUsageLogScalarFieldEnumSchema = z.enum(['id','userId','instanceId','model','openaiTeamId','text','utf8Length','tokensLength','conversationId','timestamp']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const JsonNullValueInputSchema = z.enum(['JsonNull',]).transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const UserRoleSchema = z.enum(['USER','ADMIN']);

export type UserRoleType = `${z.infer<typeof UserRoleSchema>}`

export const ResourceUnitSchema = z.enum(['CHAR']);

export type ResourceUnitType = `${z.infer<typeof ResourceUnitSchema>}`

export const RefreshPeriodSchema = z.enum(['DAILY','MONTHLY','YEARLY','NEVER']);

export type RefreshPeriodType = `${z.infer<typeof RefreshPeriodSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: UserRoleSchema,
  id: z.string().cuid(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().nullable(),
  image: z.string().nullable(),
  comment: z.string().max(500).nullable(),
  validUntil: z.coerce.date().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  hashedPassword: z.string(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// USER CUSTOM VALIDATORS SCHEMA
/////////////////////////////////////////

export const UserCustomValidatorsSchema = UserSchema

export type UserCustomValidators = z.infer<typeof UserCustomValidatorsSchema>

// USER OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserOptionalDefaultsSchema = UserSchema.merge(z.object({
  role: UserRoleSchema.optional(),
  id: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type UserOptionalDefaults = z.infer<typeof UserOptionalDefaultsSchema>

// USER RELATION SCHEMA
//------------------------------------------------------

export type UserRelations = {
  sessions: SessionWithRelations[];
  eventLogs: UserEventLogWithRelations[];
  usageLogs: UserResourceUsageLogWithRelations[];
  userInstanceTokens: UserInstanceTokenWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(z.object({
  sessions: z.lazy(() => SessionWithRelationsSchema).array(),
  eventLogs: z.lazy(() => UserEventLogWithRelationsSchema).array(),
  usageLogs: z.lazy(() => UserResourceUsageLogWithRelationsSchema).array(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenWithRelationsSchema).array(),
}))

// USER OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserOptionalDefaultsRelations = {
  sessions: SessionOptionalDefaultsWithRelations[];
  eventLogs: UserEventLogOptionalDefaultsWithRelations[];
  usageLogs: UserResourceUsageLogOptionalDefaultsWithRelations[];
  userInstanceTokens: UserInstanceTokenOptionalDefaultsWithRelations[];
};

export type UserOptionalDefaultsWithRelations = z.infer<typeof UserOptionalDefaultsSchema> & UserOptionalDefaultsRelations

export const UserOptionalDefaultsWithRelationsSchema: z.ZodType<UserOptionalDefaultsWithRelations> = UserOptionalDefaultsSchema.merge(z.object({
  sessions: z.lazy(() => SessionOptionalDefaultsWithRelationsSchema).array(),
  eventLogs: z.lazy(() => UserEventLogOptionalDefaultsWithRelationsSchema).array(),
  usageLogs: z.lazy(() => UserResourceUsageLogOptionalDefaultsWithRelationsSchema).array(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  expiresAt: z.coerce.date().min(new Date()),
  currentIp: z.string().ip().nullable(),
  createdAt: z.coerce.date(),
})

export type Session = z.infer<typeof SessionSchema>

// SESSION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const SessionOptionalDefaultsSchema = SessionSchema.merge(z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type SessionOptionalDefaults = z.infer<typeof SessionOptionalDefaultsSchema>

// SESSION RELATION SCHEMA
//------------------------------------------------------

export type SessionRelations = {
  user: UserWithRelations;
};

export type SessionWithRelations = z.infer<typeof SessionSchema> & SessionRelations

export const SessionWithRelationsSchema: z.ZodType<SessionWithRelations> = SessionSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
}))

// SESSION OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type SessionOptionalDefaultsRelations = {
  user: UserOptionalDefaultsWithRelations;
};

export type SessionOptionalDefaultsWithRelations = z.infer<typeof SessionOptionalDefaultsSchema> & SessionOptionalDefaultsRelations

export const SessionOptionalDefaultsWithRelationsSchema: z.ZodType<SessionOptionalDefaultsWithRelations> = SessionOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// SERVICE INSTANCE SCHEMA
/////////////////////////////////////////

export const ServiceInstanceSchema = z.object({
  id: z.string().cuid(),
  /**
   * [ServiceType]
   */
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().nullable(),
  url: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ServiceInstance = z.infer<typeof ServiceInstanceSchema>

// SERVICE INSTANCE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ServiceInstanceOptionalDefaultsSchema = ServiceInstanceSchema.merge(z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type ServiceInstanceOptionalDefaults = z.infer<typeof ServiceInstanceOptionalDefaultsSchema>

// SERVICE INSTANCE RELATION SCHEMA
//------------------------------------------------------

export type ServiceInstanceRelations = {
  usageLogs: UserResourceUsageLogWithRelations[];
  userInstanceTokens: UserInstanceTokenWithRelations[];
};

export type ServiceInstanceWithRelations = z.infer<typeof ServiceInstanceSchema> & ServiceInstanceRelations

export const ServiceInstanceWithRelationsSchema: z.ZodType<ServiceInstanceWithRelations> = ServiceInstanceSchema.merge(z.object({
  usageLogs: z.lazy(() => UserResourceUsageLogWithRelationsSchema).array(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenWithRelationsSchema).array(),
}))

// SERVICE INSTANCE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type ServiceInstanceOptionalDefaultsRelations = {
  usageLogs: UserResourceUsageLogOptionalDefaultsWithRelations[];
  userInstanceTokens: UserInstanceTokenOptionalDefaultsWithRelations[];
};

export type ServiceInstanceOptionalDefaultsWithRelations = z.infer<typeof ServiceInstanceOptionalDefaultsSchema> & ServiceInstanceOptionalDefaultsRelations

export const ServiceInstanceOptionalDefaultsWithRelationsSchema: z.ZodType<ServiceInstanceOptionalDefaultsWithRelations> = ServiceInstanceOptionalDefaultsSchema.merge(z.object({
  usageLogs: z.lazy(() => UserResourceUsageLogOptionalDefaultsWithRelationsSchema).array(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// USER INSTANCE TOKEN SCHEMA
/////////////////////////////////////////

export const UserInstanceTokenSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  instanceId: z.string(),
  token: z.string(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserInstanceToken = z.infer<typeof UserInstanceTokenSchema>

// USER INSTANCE TOKEN OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserInstanceTokenOptionalDefaultsSchema = UserInstanceTokenSchema.merge(z.object({
  id: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type UserInstanceTokenOptionalDefaults = z.infer<typeof UserInstanceTokenOptionalDefaultsSchema>

// USER INSTANCE TOKEN RELATION SCHEMA
//------------------------------------------------------

export type UserInstanceTokenRelations = {
  user: UserWithRelations;
  instance: ServiceInstanceWithRelations;
};

export type UserInstanceTokenWithRelations = z.infer<typeof UserInstanceTokenSchema> & UserInstanceTokenRelations

export const UserInstanceTokenWithRelationsSchema: z.ZodType<UserInstanceTokenWithRelations> = UserInstanceTokenSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
  instance: z.lazy(() => ServiceInstanceWithRelationsSchema),
}))

// USER INSTANCE TOKEN OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserInstanceTokenOptionalDefaultsRelations = {
  user: UserOptionalDefaultsWithRelations;
  instance: ServiceInstanceOptionalDefaultsWithRelations;
};

export type UserInstanceTokenOptionalDefaultsWithRelations = z.infer<typeof UserInstanceTokenOptionalDefaultsSchema> & UserInstanceTokenOptionalDefaultsRelations

export const UserInstanceTokenOptionalDefaultsWithRelationsSchema: z.ZodType<UserInstanceTokenOptionalDefaultsWithRelations> = UserInstanceTokenOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
  instance: z.lazy(() => ServiceInstanceOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// USER EVENT LOG SCHEMA
/////////////////////////////////////////

export const UserEventLogSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().nullable(),
  /**
   * [EventType]
   */
  type: z.lazy(() => EventTypeSchema),
  /**
   * [EventResultType]
   */
  resultType: z.lazy(() => EventResultTypeSchema),
  /**
   * [EventContent]
   */
  content: z.lazy(() => EventContentSchema),
  timestamp: z.coerce.date(),
})

export type UserEventLog = z.infer<typeof UserEventLogSchema>

// USER EVENT LOG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserEventLogOptionalDefaultsSchema = UserEventLogSchema.merge(z.object({
  id: z.string().cuid().optional(),
  timestamp: z.coerce.date().optional(),
}))

export type UserEventLogOptionalDefaults = z.infer<typeof UserEventLogOptionalDefaultsSchema>

// USER EVENT LOG RELATION SCHEMA
//------------------------------------------------------

export type UserEventLogRelations = {
  user?: UserWithRelations | null;
};

export type UserEventLogWithRelations = z.infer<typeof UserEventLogSchema> & UserEventLogRelations

export const UserEventLogWithRelationsSchema: z.ZodType<UserEventLogWithRelations> = UserEventLogSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema).nullable(),
}))

// USER EVENT LOG OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserEventLogOptionalDefaultsRelations = {
  user?: UserOptionalDefaultsWithRelations | null;
};

export type UserEventLogOptionalDefaultsWithRelations = z.infer<typeof UserEventLogOptionalDefaultsSchema> & UserEventLogOptionalDefaultsRelations

export const UserEventLogOptionalDefaultsWithRelationsSchema: z.ZodType<UserEventLogOptionalDefaultsWithRelations> = UserEventLogOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema).nullable(),
}))

/////////////////////////////////////////
// USER RESOURCE USAGE LOG SCHEMA
/////////////////////////////////////////

export const UserResourceUsageLogSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().nullable(),
  instanceId: z.string().nullable(),
  model: z.string(),
  openaiTeamId: z.string().nullable(),
  text: z.string().nullable(),
  utf8Length: z.number().int().nullable(),
  tokensLength: z.number().int().nullable(),
  conversationId: z.string().nullable(),
  timestamp: z.coerce.date(),
})

export type UserResourceUsageLog = z.infer<typeof UserResourceUsageLogSchema>

// USER RESOURCE USAGE LOG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserResourceUsageLogOptionalDefaultsSchema = UserResourceUsageLogSchema.merge(z.object({
  id: z.string().cuid().optional(),
  timestamp: z.coerce.date().optional(),
}))

export type UserResourceUsageLogOptionalDefaults = z.infer<typeof UserResourceUsageLogOptionalDefaultsSchema>

// USER RESOURCE USAGE LOG RELATION SCHEMA
//------------------------------------------------------

export type UserResourceUsageLogRelations = {
  user?: UserWithRelations | null;
  instance?: ServiceInstanceWithRelations | null;
};

export type UserResourceUsageLogWithRelations = z.infer<typeof UserResourceUsageLogSchema> & UserResourceUsageLogRelations

export const UserResourceUsageLogWithRelationsSchema: z.ZodType<UserResourceUsageLogWithRelations> = UserResourceUsageLogSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema).nullable(),
  instance: z.lazy(() => ServiceInstanceWithRelationsSchema).nullable(),
}))

// USER RESOURCE USAGE LOG OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserResourceUsageLogOptionalDefaultsRelations = {
  user?: UserOptionalDefaultsWithRelations | null;
  instance?: ServiceInstanceOptionalDefaultsWithRelations | null;
};

export type UserResourceUsageLogOptionalDefaultsWithRelations = z.infer<typeof UserResourceUsageLogOptionalDefaultsSchema> & UserResourceUsageLogOptionalDefaultsRelations

export const UserResourceUsageLogOptionalDefaultsWithRelationsSchema: z.ZodType<UserResourceUsageLogOptionalDefaultsWithRelations> = UserResourceUsageLogOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema).nullable(),
  instance: z.lazy(() => ServiceInstanceOptionalDefaultsWithRelationsSchema).nullable(),
}))

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  eventLogs: z.union([z.boolean(),z.lazy(() => UserEventLogFindManyArgsSchema)]).optional(),
  usageLogs: z.union([z.boolean(),z.lazy(() => UserResourceUsageLogFindManyArgsSchema)]).optional(),
  userInstanceTokens: z.union([z.boolean(),z.lazy(() => UserInstanceTokenFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  sessions: z.boolean().optional(),
  eventLogs: z.boolean().optional(),
  usageLogs: z.boolean().optional(),
  userInstanceTokens: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  username: z.boolean().optional(),
  email: z.boolean().optional(),
  role: z.boolean().optional(),
  image: z.boolean().optional(),
  comment: z.boolean().optional(),
  validUntil: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  hashedPassword: z.boolean().optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  eventLogs: z.union([z.boolean(),z.lazy(() => UserEventLogFindManyArgsSchema)]).optional(),
  usageLogs: z.union([z.boolean(),z.lazy(() => UserResourceUsageLogFindManyArgsSchema)]).optional(),
  userInstanceTokens: z.union([z.boolean(),z.lazy(() => UserInstanceTokenFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// SESSION
//------------------------------------------------------

export const SessionIncludeSchema: z.ZodType<Prisma.SessionInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const SessionArgsSchema: z.ZodType<Prisma.SessionDefaultArgs> = z.object({
  select: z.lazy(() => SessionSelectSchema).optional(),
  include: z.lazy(() => SessionIncludeSchema).optional(),
}).strict();

export const SessionSelectSchema: z.ZodType<Prisma.SessionSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  currentIp: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// SERVICE INSTANCE
//------------------------------------------------------

export const ServiceInstanceIncludeSchema: z.ZodType<Prisma.ServiceInstanceInclude> = z.object({
  usageLogs: z.union([z.boolean(),z.lazy(() => UserResourceUsageLogFindManyArgsSchema)]).optional(),
  userInstanceTokens: z.union([z.boolean(),z.lazy(() => UserInstanceTokenFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ServiceInstanceCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ServiceInstanceArgsSchema: z.ZodType<Prisma.ServiceInstanceDefaultArgs> = z.object({
  select: z.lazy(() => ServiceInstanceSelectSchema).optional(),
  include: z.lazy(() => ServiceInstanceIncludeSchema).optional(),
}).strict();

export const ServiceInstanceCountOutputTypeArgsSchema: z.ZodType<Prisma.ServiceInstanceCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ServiceInstanceCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ServiceInstanceCountOutputTypeSelectSchema: z.ZodType<Prisma.ServiceInstanceCountOutputTypeSelect> = z.object({
  usageLogs: z.boolean().optional(),
  userInstanceTokens: z.boolean().optional(),
}).strict();

export const ServiceInstanceSelectSchema: z.ZodType<Prisma.ServiceInstanceSelect> = z.object({
  id: z.boolean().optional(),
  type: z.boolean().optional(),
  name: z.boolean().optional(),
  description: z.boolean().optional(),
  url: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  usageLogs: z.union([z.boolean(),z.lazy(() => UserResourceUsageLogFindManyArgsSchema)]).optional(),
  userInstanceTokens: z.union([z.boolean(),z.lazy(() => UserInstanceTokenFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ServiceInstanceCountOutputTypeArgsSchema)]).optional(),
}).strict()

// USER INSTANCE TOKEN
//------------------------------------------------------

export const UserInstanceTokenIncludeSchema: z.ZodType<Prisma.UserInstanceTokenInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => ServiceInstanceArgsSchema)]).optional(),
}).strict()

export const UserInstanceTokenArgsSchema: z.ZodType<Prisma.UserInstanceTokenDefaultArgs> = z.object({
  select: z.lazy(() => UserInstanceTokenSelectSchema).optional(),
  include: z.lazy(() => UserInstanceTokenIncludeSchema).optional(),
}).strict();

export const UserInstanceTokenSelectSchema: z.ZodType<Prisma.UserInstanceTokenSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  instanceId: z.boolean().optional(),
  token: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => ServiceInstanceArgsSchema)]).optional(),
}).strict()

// USER EVENT LOG
//------------------------------------------------------

export const UserEventLogIncludeSchema: z.ZodType<Prisma.UserEventLogInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserEventLogArgsSchema: z.ZodType<Prisma.UserEventLogDefaultArgs> = z.object({
  select: z.lazy(() => UserEventLogSelectSchema).optional(),
  include: z.lazy(() => UserEventLogIncludeSchema).optional(),
}).strict();

export const UserEventLogSelectSchema: z.ZodType<Prisma.UserEventLogSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  type: z.boolean().optional(),
  resultType: z.boolean().optional(),
  content: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER RESOURCE USAGE LOG
//------------------------------------------------------

export const UserResourceUsageLogIncludeSchema: z.ZodType<Prisma.UserResourceUsageLogInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => ServiceInstanceArgsSchema)]).optional(),
}).strict()

export const UserResourceUsageLogArgsSchema: z.ZodType<Prisma.UserResourceUsageLogDefaultArgs> = z.object({
  select: z.lazy(() => UserResourceUsageLogSelectSchema).optional(),
  include: z.lazy(() => UserResourceUsageLogIncludeSchema).optional(),
}).strict();

export const UserResourceUsageLogSelectSchema: z.ZodType<Prisma.UserResourceUsageLogSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  instanceId: z.boolean().optional(),
  model: z.boolean().optional(),
  openaiTeamId: z.boolean().optional(),
  text: z.boolean().optional(),
  utf8Length: z.boolean().optional(),
  tokensLength: z.boolean().optional(),
  conversationId: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => ServiceInstanceArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  username: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema),z.lazy(() => UserRoleSchema) ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  comment: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  validUntil: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  hashedPassword: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogListRelationFilterSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogListRelationFilterSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenListRelationFilterSchema).optional()
}).strict() as z.ZodType<Prisma.UserWhereInput>;

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  comment: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  validUntil: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedPassword: z.lazy(() => SortOrderSchema).optional(),
  sessions: z.lazy(() => SessionOrderByRelationAggregateInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogOrderByRelationAggregateInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogOrderByRelationAggregateInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenOrderByRelationAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserOrderByWithRelationInput>;

export const UserWhereUniqueInputSchema: z.ZodType<Omit<Prisma.UserWhereUniqueInput, "createdAt" | "updatedAt">> = z.union([
  z.object({
    id: z.string().cuid(),
    username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email()
  }),
  z.object({
    id: z.string().cuid(),
    username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  }),
  z.object({
    id: z.string().cuid(),
    email: z.string().email(),
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
  }),
  z.object({
    username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  }),
  z.object({
    email: z.string().email(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().email().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string().min(1).max(50) ]).optional(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema),z.lazy(() => UserRoleSchema) ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  comment: z.union([ z.lazy(() => StringNullableFilterSchema),z.string().max(500) ]).optional().nullable(),
  validUntil: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  // omitted: createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  // omitted: updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  hashedPassword: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogListRelationFilterSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogListRelationFilterSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenListRelationFilterSchema).optional()
}).strict()) as z.ZodType<Omit<Prisma.UserWhereUniqueInput, "createdAt" | "updatedAt">>;

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  comment: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  validUntil: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedPassword: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserOrderByWithAggregationInput>;

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  username: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumUserRoleWithAggregatesFilterSchema),z.lazy(() => UserRoleSchema) ]).optional(),
  image: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  comment: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  validUntil: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  hashedPassword: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict() as z.ZodType<Prisma.UserScalarWhereWithAggregatesInput>;

export const SessionWhereInputSchema: z.ZodType<Prisma.SessionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  currentIp: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.SessionWhereInput>;

export const SessionOrderByWithRelationInputSchema: z.ZodType<Prisma.SessionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  currentIp: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict() as z.ZodType<Prisma.SessionOrderByWithRelationInput>;

export const SessionWhereUniqueInputSchema: z.ZodType<Omit<Prisma.SessionWhereUniqueInput, "createdAt">> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date().min(new Date()) ]).optional(),
  currentIp: z.union([ z.lazy(() => StringNullableFilterSchema),z.string().ip() ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict()) as z.ZodType<Omit<Prisma.SessionWhereUniqueInput, "createdAt">>;

export const SessionOrderByWithAggregationInputSchema: z.ZodType<Prisma.SessionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  currentIp: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SessionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SessionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SessionMinOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.SessionOrderByWithAggregationInput>;

export const SessionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SessionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  currentIp: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.SessionScalarWhereWithAggregatesInput>;

export const ServiceInstanceWhereInputSchema: z.ZodType<Prisma.ServiceInstanceWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ServiceInstanceWhereInputSchema),z.lazy(() => ServiceInstanceWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ServiceInstanceWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ServiceInstanceWhereInputSchema),z.lazy(() => ServiceInstanceWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  url: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogListRelationFilterSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenListRelationFilterSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceWhereInput>;

export const ServiceInstanceOrderByWithRelationInputSchema: z.ZodType<Prisma.ServiceInstanceOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  url: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogOrderByRelationAggregateInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenOrderByRelationAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceOrderByWithRelationInput>;

export const ServiceInstanceWhereUniqueInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceWhereUniqueInput, "createdAt" | "updatedAt">> = z.union([
  z.object({
    id: z.string().cuid(),
    name: z.string().min(1).max(100)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    name: z.string().min(1).max(100),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(100).optional(),
  AND: z.union([ z.lazy(() => ServiceInstanceWhereInputSchema),z.lazy(() => ServiceInstanceWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ServiceInstanceWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ServiceInstanceWhereInputSchema),z.lazy(() => ServiceInstanceWhereInputSchema).array() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.lazy(() => ServiceTypeSchema) ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  url: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  // omitted: updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogListRelationFilterSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenListRelationFilterSchema).optional()
}).strict()) as z.ZodType<Omit<Prisma.ServiceInstanceWhereUniqueInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceOrderByWithAggregationInputSchema: z.ZodType<Prisma.ServiceInstanceOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  url: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ServiceInstanceCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ServiceInstanceMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ServiceInstanceMinOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceOrderByWithAggregationInput>;

export const ServiceInstanceScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ServiceInstanceScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ServiceInstanceScalarWhereWithAggregatesInputSchema),z.lazy(() => ServiceInstanceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ServiceInstanceScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ServiceInstanceScalarWhereWithAggregatesInputSchema),z.lazy(() => ServiceInstanceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  url: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceScalarWhereWithAggregatesInput>;

export const UserInstanceTokenWhereInputSchema: z.ZodType<Prisma.UserInstanceTokenWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserInstanceTokenWhereInputSchema),z.lazy(() => UserInstanceTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInstanceTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInstanceTokenWhereInputSchema),z.lazy(() => UserInstanceTokenWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  instance: z.union([ z.lazy(() => ServiceInstanceRelationFilterSchema),z.lazy(() => ServiceInstanceWhereInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenWhereInput>;

export const UserInstanceTokenOrderByWithRelationInputSchema: z.ZodType<Prisma.UserInstanceTokenOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  instance: z.lazy(() => ServiceInstanceOrderByWithRelationInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenOrderByWithRelationInput>;

export const UserInstanceTokenWhereUniqueInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenWhereUniqueInput, "createdAt" | "updatedAt">> = z.union([
  z.object({
    id: z.string().cuid(),
    token: z.string(),
    userId_instanceId: z.lazy(() => UserInstanceTokenUserIdInstanceIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
    token: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
    userId_instanceId: z.lazy(() => UserInstanceTokenUserIdInstanceIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    token: z.string(),
    userId_instanceId: z.lazy(() => UserInstanceTokenUserIdInstanceIdCompoundUniqueInputSchema),
  }),
  z.object({
    token: z.string(),
  }),
  z.object({
    userId_instanceId: z.lazy(() => UserInstanceTokenUserIdInstanceIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  token: z.string().optional(),
  userId_instanceId: z.lazy(() => UserInstanceTokenUserIdInstanceIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => UserInstanceTokenWhereInputSchema),z.lazy(() => UserInstanceTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInstanceTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInstanceTokenWhereInputSchema),z.lazy(() => UserInstanceTokenWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  // omitted: createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  // omitted: updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  instance: z.union([ z.lazy(() => ServiceInstanceRelationFilterSchema),z.lazy(() => ServiceInstanceWhereInputSchema) ]).optional(),
}).strict()) as z.ZodType<Omit<Prisma.UserInstanceTokenWhereUniqueInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserInstanceTokenOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserInstanceTokenCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserInstanceTokenMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserInstanceTokenMinOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenOrderByWithAggregationInput>;

export const UserInstanceTokenScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserInstanceTokenScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserInstanceTokenScalarWhereWithAggregatesInputSchema),z.lazy(() => UserInstanceTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInstanceTokenScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInstanceTokenScalarWhereWithAggregatesInputSchema),z.lazy(() => UserInstanceTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  instanceId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenScalarWhereWithAggregatesInput>;

export const UserEventLogWhereInputSchema: z.ZodType<Prisma.UserEventLogWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserEventLogWhereInputSchema),z.lazy(() => UserEventLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserEventLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserEventLogWhereInputSchema),z.lazy(() => UserEventLogWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  resultType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.lazy(() => JsonFilterSchema).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.UserEventLogWhereInput>;

export const UserEventLogOrderByWithRelationInputSchema: z.ZodType<Prisma.UserEventLogOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  resultType: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserEventLogOrderByWithRelationInput>;

export const UserEventLogWhereUniqueInputSchema: z.ZodType<Prisma.UserEventLogWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => UserEventLogWhereInputSchema),z.lazy(() => UserEventLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserEventLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserEventLogWhereInputSchema),z.lazy(() => UserEventLogWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.lazy(() => EventTypeSchema) ]).optional(),
  resultType: z.union([ z.lazy(() => StringFilterSchema),z.lazy(() => EventResultTypeSchema) ]).optional(),
  content: z.lazy(() => JsonFilterSchema).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict()) as z.ZodType<Prisma.UserEventLogWhereUniqueInput>;

export const UserEventLogOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserEventLogOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  resultType: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserEventLogCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserEventLogMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserEventLogMinOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserEventLogOrderByWithAggregationInput>;

export const UserEventLogScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserEventLogScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserEventLogScalarWhereWithAggregatesInputSchema),z.lazy(() => UserEventLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserEventLogScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserEventLogScalarWhereWithAggregatesInputSchema),z.lazy(() => UserEventLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  resultType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  content: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogScalarWhereWithAggregatesInput>;

export const UserResourceUsageLogWhereInputSchema: z.ZodType<Prisma.UserResourceUsageLogWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserResourceUsageLogWhereInputSchema),z.lazy(() => UserResourceUsageLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserResourceUsageLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserResourceUsageLogWhereInputSchema),z.lazy(() => UserResourceUsageLogWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  model: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  openaiTeamId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  text: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  utf8Length: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  tokensLength: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  conversationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  instance: z.union([ z.lazy(() => ServiceInstanceNullableRelationFilterSchema),z.lazy(() => ServiceInstanceWhereInputSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogWhereInput>;

export const UserResourceUsageLogOrderByWithRelationInputSchema: z.ZodType<Prisma.UserResourceUsageLogOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  instanceId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  openaiTeamId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  text: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  utf8Length: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  tokensLength: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  conversationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  instance: z.lazy(() => ServiceInstanceOrderByWithRelationInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogOrderByWithRelationInput>;

export const UserResourceUsageLogWhereUniqueInputSchema: z.ZodType<Prisma.UserResourceUsageLogWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => UserResourceUsageLogWhereInputSchema),z.lazy(() => UserResourceUsageLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserResourceUsageLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserResourceUsageLogWhereInputSchema),z.lazy(() => UserResourceUsageLogWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  model: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  openaiTeamId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  text: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  utf8Length: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  tokensLength: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  conversationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  instance: z.union([ z.lazy(() => ServiceInstanceNullableRelationFilterSchema),z.lazy(() => ServiceInstanceWhereInputSchema) ]).optional().nullable(),
}).strict()) as z.ZodType<Prisma.UserResourceUsageLogWhereUniqueInput>;

export const UserResourceUsageLogOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserResourceUsageLogOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  instanceId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  openaiTeamId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  text: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  utf8Length: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  tokensLength: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  conversationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserResourceUsageLogCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserResourceUsageLogAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserResourceUsageLogMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserResourceUsageLogMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserResourceUsageLogSumOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogOrderByWithAggregationInput>;

export const UserResourceUsageLogScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserResourceUsageLogScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserResourceUsageLogScalarWhereWithAggregatesInputSchema),z.lazy(() => UserResourceUsageLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserResourceUsageLogScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserResourceUsageLogScalarWhereWithAggregatesInputSchema),z.lazy(() => UserResourceUsageLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  model: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  openaiTeamId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  text: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  utf8Length: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  tokensLength: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  conversationId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogScalarWhereWithAggregatesInput>;

export const UserCreateInputSchema: z.ZodType<Omit<Prisma.UserCreateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogCreateNestedManyWithoutUserInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogCreateNestedManyWithoutUserInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserCreateInput, "createdAt" | "updatedAt">>;

export const UserUncheckedCreateInputSchema: z.ZodType<Omit<Prisma.UserUncheckedCreateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedCreateInput, "createdAt" | "updatedAt">>;

export const UserUpdateInputSchema: z.ZodType<Omit<Prisma.UserUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUpdateManyWithoutUserNestedInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUpdateInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateInput, "createdAt" | "updatedAt">>;

export const UserCreateManyInputSchema: z.ZodType<Omit<Prisma.UserCreateManyInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string()
}).strict() as z.ZodType<Omit<Prisma.UserCreateManyInput, "createdAt" | "updatedAt">>;

export const UserUpdateManyMutationInputSchema: z.ZodType<Omit<Prisma.UserUpdateManyMutationInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserUpdateManyMutationInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateManyInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateManyInput, "createdAt" | "updatedAt">>;

export const SessionCreateInputSchema: z.ZodType<Omit<Prisma.SessionCreateInput, "createdAt">> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date().min(new Date()),
  currentIp: z.string().ip().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutSessionsInputSchema)
}).strict() as z.ZodType<Omit<Prisma.SessionCreateInput, "createdAt">>;

export const SessionUncheckedCreateInputSchema: z.ZodType<Omit<Prisma.SessionUncheckedCreateInput, "createdAt">> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  expiresAt: z.coerce.date().min(new Date()),
  currentIp: z.string().ip().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.SessionUncheckedCreateInput, "createdAt">>;

export const SessionUpdateInputSchema: z.ZodType<Omit<Prisma.SessionUpdateInput, "createdAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date().min(new Date()),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  currentIp: z.union([ z.string().ip(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSessionsNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.SessionUpdateInput, "createdAt">>;

export const SessionUncheckedUpdateInputSchema: z.ZodType<Omit<Prisma.SessionUncheckedUpdateInput, "createdAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date().min(new Date()),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  currentIp: z.union([ z.string().ip(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.SessionUncheckedUpdateInput, "createdAt">>;

export const SessionCreateManyInputSchema: z.ZodType<Omit<Prisma.SessionCreateManyInput, "createdAt">> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  expiresAt: z.coerce.date().min(new Date()),
  currentIp: z.string().ip().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.SessionCreateManyInput, "createdAt">>;

export const SessionUpdateManyMutationInputSchema: z.ZodType<Omit<Prisma.SessionUpdateManyMutationInput, "createdAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date().min(new Date()),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  currentIp: z.union([ z.string().ip(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.SessionUpdateManyMutationInput, "createdAt">>;

export const SessionUncheckedUpdateManyInputSchema: z.ZodType<Omit<Prisma.SessionUncheckedUpdateManyInput, "createdAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date().min(new Date()),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  currentIp: z.union([ z.string().ip(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.SessionUncheckedUpdateManyInput, "createdAt">>;

export const ServiceInstanceCreateInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceCreateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogCreateNestedManyWithoutInstanceInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceCreateInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedCreateInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedCreateNestedManyWithoutInstanceInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUpdateInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUpdateManyWithoutInstanceNestedInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUpdateInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedUpdateInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceCreateManyInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceCreateManyInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceCreateManyInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUpdateManyMutationInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUpdateManyMutationInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUpdateManyMutationInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedUpdateManyInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateManyInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateManyInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenCreateInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  token: z.string(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUserInstanceTokensInputSchema),
  instance: z.lazy(() => ServiceInstanceCreateNestedOneWithoutUserInstanceTokensInputSchema)
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedCreateInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedCreateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  instanceId: z.string(),
  token: z.string(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedCreateInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUpdateInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutUserInstanceTokensNestedInputSchema).optional(),
  instance: z.lazy(() => ServiceInstanceUpdateOneRequiredWithoutUserInstanceTokensNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpdateInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenCreateManyInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  instanceId: z.string(),
  token: z.string(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUpdateManyMutationInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpdateManyMutationInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpdateManyMutationInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateManyInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyInput, "createdAt" | "updatedAt">>;

export const UserEventLogCreateInputSchema: z.ZodType<Prisma.UserEventLogCreateInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => EventTypeSchema),
  resultType: z.lazy(() => EventResultTypeSchema),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]),
  timestamp: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutEventLogsInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserEventLogCreateInput>;

export const UserEventLogUncheckedCreateInputSchema: z.ZodType<Prisma.UserEventLogUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  type: z.lazy(() => EventTypeSchema),
  resultType: z.lazy(() => EventResultTypeSchema),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserEventLogUncheckedCreateInput>;

export const UserEventLogUpdateInputSchema: z.ZodType<Prisma.UserEventLogUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutEventLogsNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserEventLogUpdateInput>;

export const UserEventLogUncheckedUpdateInputSchema: z.ZodType<Prisma.UserEventLogUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogUncheckedUpdateInput>;

export const UserEventLogCreateManyInputSchema: z.ZodType<Prisma.UserEventLogCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  type: z.lazy(() => EventTypeSchema),
  resultType: z.lazy(() => EventResultTypeSchema),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserEventLogCreateManyInput>;

export const UserEventLogUpdateManyMutationInputSchema: z.ZodType<Prisma.UserEventLogUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogUpdateManyMutationInput>;

export const UserEventLogUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserEventLogUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogUncheckedUpdateManyInput>;

export const UserResourceUsageLogCreateInputSchema: z.ZodType<Prisma.UserResourceUsageLogCreateInput> = z.object({
  id: z.string().cuid().optional(),
  model: z.string(),
  openaiTeamId: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  utf8Length: z.number().int().optional().nullable(),
  tokensLength: z.number().int().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  timestamp: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUsageLogsInputSchema).optional(),
  instance: z.lazy(() => ServiceInstanceCreateNestedOneWithoutUsageLogsInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateInput>;

export const UserResourceUsageLogUncheckedCreateInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  instanceId: z.string().optional().nullable(),
  model: z.string(),
  openaiTeamId: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  utf8Length: z.number().int().optional().nullable(),
  tokensLength: z.number().int().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedCreateInput>;

export const UserResourceUsageLogUpdateInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  openaiTeamId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  text: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  utf8Length: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tokensLength: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  conversationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutUsageLogsNestedInputSchema).optional(),
  instance: z.lazy(() => ServiceInstanceUpdateOneWithoutUsageLogsNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateInput>;

export const UserResourceUsageLogUncheckedUpdateInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  openaiTeamId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  text: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  utf8Length: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tokensLength: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  conversationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateInput>;

export const UserResourceUsageLogCreateManyInputSchema: z.ZodType<Prisma.UserResourceUsageLogCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  instanceId: z.string().optional().nullable(),
  model: z.string(),
  openaiTeamId: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  utf8Length: z.number().int().optional().nullable(),
  tokensLength: z.number().int().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateManyInput>;

export const UserResourceUsageLogUpdateManyMutationInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  openaiTeamId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  text: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  utf8Length: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tokensLength: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  conversationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateManyMutationInput>;

export const UserResourceUsageLogUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  openaiTeamId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  text: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  utf8Length: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tokensLength: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  conversationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateManyInput>;

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.StringFilter>;

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.StringNullableFilter>;

export const EnumUserRoleFilterSchema: z.ZodType<Prisma.EnumUserRoleFilter> = z.object({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => NestedEnumUserRoleFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.EnumUserRoleFilter>;

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.DateTimeNullableFilter>;

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.BoolFilter>;

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.DateTimeFilter>;

export const SessionListRelationFilterSchema: z.ZodType<Prisma.SessionListRelationFilter> = z.object({
  every: z.lazy(() => SessionWhereInputSchema).optional(),
  some: z.lazy(() => SessionWhereInputSchema).optional(),
  none: z.lazy(() => SessionWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.SessionListRelationFilter>;

export const UserEventLogListRelationFilterSchema: z.ZodType<Prisma.UserEventLogListRelationFilter> = z.object({
  every: z.lazy(() => UserEventLogWhereInputSchema).optional(),
  some: z.lazy(() => UserEventLogWhereInputSchema).optional(),
  none: z.lazy(() => UserEventLogWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserEventLogListRelationFilter>;

export const UserResourceUsageLogListRelationFilterSchema: z.ZodType<Prisma.UserResourceUsageLogListRelationFilter> = z.object({
  every: z.lazy(() => UserResourceUsageLogWhereInputSchema).optional(),
  some: z.lazy(() => UserResourceUsageLogWhereInputSchema).optional(),
  none: z.lazy(() => UserResourceUsageLogWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogListRelationFilter>;

export const UserInstanceTokenListRelationFilterSchema: z.ZodType<Prisma.UserInstanceTokenListRelationFilter> = z.object({
  every: z.lazy(() => UserInstanceTokenWhereInputSchema).optional(),
  some: z.lazy(() => UserInstanceTokenWhereInputSchema).optional(),
  none: z.lazy(() => UserInstanceTokenWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenListRelationFilter>;

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict() as z.ZodType<Prisma.SortOrderInput>;

export const SessionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SessionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.SessionOrderByRelationAggregateInput>;

export const UserEventLogOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserEventLogOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserEventLogOrderByRelationAggregateInput>;

export const UserResourceUsageLogOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserResourceUsageLogOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogOrderByRelationAggregateInput>;

export const UserInstanceTokenOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserInstanceTokenOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenOrderByRelationAggregateInput>;

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  comment: z.lazy(() => SortOrderSchema).optional(),
  validUntil: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedPassword: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserCountOrderByAggregateInput>;

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  comment: z.lazy(() => SortOrderSchema).optional(),
  validUntil: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedPassword: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserMaxOrderByAggregateInput>;

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  comment: z.lazy(() => SortOrderSchema).optional(),
  validUntil: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedPassword: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserMinOrderByAggregateInput>;

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict() as z.ZodType<Prisma.StringWithAggregatesFilter>;

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict() as z.ZodType<Prisma.StringNullableWithAggregatesFilter>;

export const EnumUserRoleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumUserRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => NestedEnumUserRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserRoleFilterSchema).optional()
}).strict() as z.ZodType<Prisma.EnumUserRoleWithAggregatesFilter>;

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict() as z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter>;

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict() as z.ZodType<Prisma.BoolWithAggregatesFilter>;

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict() as z.ZodType<Prisma.DateTimeWithAggregatesFilter>;

export const UserRelationFilterSchema: z.ZodType<Prisma.UserRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserRelationFilter>;

export const SessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.SessionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  currentIp: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.SessionCountOrderByAggregateInput>;

export const SessionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  currentIp: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.SessionMaxOrderByAggregateInput>;

export const SessionMinOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  currentIp: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.SessionMinOrderByAggregateInput>;

export const ServiceInstanceCountOrderByAggregateInputSchema: z.ZodType<Prisma.ServiceInstanceCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceCountOrderByAggregateInput>;

export const ServiceInstanceMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ServiceInstanceMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceMaxOrderByAggregateInput>;

export const ServiceInstanceMinOrderByAggregateInputSchema: z.ZodType<Prisma.ServiceInstanceMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceMinOrderByAggregateInput>;

export const ServiceInstanceRelationFilterSchema: z.ZodType<Prisma.ServiceInstanceRelationFilter> = z.object({
  is: z.lazy(() => ServiceInstanceWhereInputSchema).optional(),
  isNot: z.lazy(() => ServiceInstanceWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceRelationFilter>;

export const UserInstanceTokenUserIdInstanceIdCompoundUniqueInputSchema: z.ZodType<Prisma.UserInstanceTokenUserIdInstanceIdCompoundUniqueInput> = z.object({
  userId: z.string(),
  instanceId: z.string()
}).strict() as z.ZodType<Prisma.UserInstanceTokenUserIdInstanceIdCompoundUniqueInput>;

export const UserInstanceTokenCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserInstanceTokenCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenCountOrderByAggregateInput>;

export const UserInstanceTokenMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserInstanceTokenMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenMaxOrderByAggregateInput>;

export const UserInstanceTokenMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserInstanceTokenMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenMinOrderByAggregateInput>;

export const JsonFilterSchema: z.ZodType<Prisma.JsonFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict() as z.ZodType<Prisma.JsonFilter>;

export const UserNullableRelationFilterSchema: z.ZodType<Prisma.UserNullableRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserWhereInputSchema).optional().nullable()
}).strict() as z.ZodType<Prisma.UserNullableRelationFilter>;

export const UserEventLogCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserEventLogCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  resultType: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserEventLogCountOrderByAggregateInput>;

export const UserEventLogMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserEventLogMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  resultType: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserEventLogMaxOrderByAggregateInput>;

export const UserEventLogMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserEventLogMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  resultType: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserEventLogMinOrderByAggregateInput>;

export const JsonWithAggregatesFilterSchema: z.ZodType<Prisma.JsonWithAggregatesFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonFilterSchema).optional()
}).strict() as z.ZodType<Prisma.JsonWithAggregatesFilter>;

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.IntNullableFilter>;

export const ServiceInstanceNullableRelationFilterSchema: z.ZodType<Prisma.ServiceInstanceNullableRelationFilter> = z.object({
  is: z.lazy(() => ServiceInstanceWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ServiceInstanceWhereInputSchema).optional().nullable()
}).strict() as z.ZodType<Prisma.ServiceInstanceNullableRelationFilter>;

export const UserResourceUsageLogCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserResourceUsageLogCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  openaiTeamId: z.lazy(() => SortOrderSchema).optional(),
  text: z.lazy(() => SortOrderSchema).optional(),
  utf8Length: z.lazy(() => SortOrderSchema).optional(),
  tokensLength: z.lazy(() => SortOrderSchema).optional(),
  conversationId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCountOrderByAggregateInput>;

export const UserResourceUsageLogAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserResourceUsageLogAvgOrderByAggregateInput> = z.object({
  utf8Length: z.lazy(() => SortOrderSchema).optional(),
  tokensLength: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogAvgOrderByAggregateInput>;

export const UserResourceUsageLogMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserResourceUsageLogMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  openaiTeamId: z.lazy(() => SortOrderSchema).optional(),
  text: z.lazy(() => SortOrderSchema).optional(),
  utf8Length: z.lazy(() => SortOrderSchema).optional(),
  tokensLength: z.lazy(() => SortOrderSchema).optional(),
  conversationId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogMaxOrderByAggregateInput>;

export const UserResourceUsageLogMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserResourceUsageLogMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  openaiTeamId: z.lazy(() => SortOrderSchema).optional(),
  text: z.lazy(() => SortOrderSchema).optional(),
  utf8Length: z.lazy(() => SortOrderSchema).optional(),
  tokensLength: z.lazy(() => SortOrderSchema).optional(),
  conversationId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogMinOrderByAggregateInput>;

export const UserResourceUsageLogSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserResourceUsageLogSumOrderByAggregateInput> = z.object({
  utf8Length: z.lazy(() => SortOrderSchema).optional(),
  tokensLength: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogSumOrderByAggregateInput>;

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict() as z.ZodType<Prisma.IntNullableWithAggregatesFilter>;

export const SessionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SessionCreateNestedManyWithoutUserInput>;

export const UserEventLogCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserEventLogCreateWithoutUserInputSchema),z.lazy(() => UserEventLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserEventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserEventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserEventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserEventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserEventLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserEventLogWhereUniqueInputSchema),z.lazy(() => UserEventLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogCreateNestedManyWithoutUserInput>;

export const UserResourceUsageLogCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceUsageLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateNestedManyWithoutUserInput>;

export const UserInstanceTokenCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserInstanceTokenCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenCreateWithoutUserInputSchema).array(),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInstanceTokenCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserInstanceTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInstanceTokenCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenCreateNestedManyWithoutUserInput>;

export const SessionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SessionUncheckedCreateNestedManyWithoutUserInput>;

export const UserEventLogUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserEventLogCreateWithoutUserInputSchema),z.lazy(() => UserEventLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserEventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserEventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserEventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserEventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserEventLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserEventLogWhereUniqueInputSchema),z.lazy(() => UserEventLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogUncheckedCreateNestedManyWithoutUserInput>;

export const UserResourceUsageLogUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceUsageLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedCreateNestedManyWithoutUserInput>;

export const UserInstanceTokenUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserInstanceTokenUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenCreateWithoutUserInputSchema).array(),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInstanceTokenCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserInstanceTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInstanceTokenCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUncheckedCreateNestedManyWithoutUserInput>;

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict() as z.ZodType<Prisma.StringFieldUpdateOperationsInput>;

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict() as z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput>;

export const EnumUserRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserRoleFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => UserRoleSchema).optional()
}).strict() as z.ZodType<Prisma.EnumUserRoleFieldUpdateOperationsInput>;

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional().nullable()
}).strict() as z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput>;

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict() as z.ZodType<Prisma.BoolFieldUpdateOperationsInput>;

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput>;

export const SessionUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SessionUpdateManyWithoutUserNestedInput>;

export const UserEventLogUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserEventLogUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserEventLogCreateWithoutUserInputSchema),z.lazy(() => UserEventLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserEventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserEventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserEventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserEventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserEventLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserEventLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserEventLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserEventLogWhereUniqueInputSchema),z.lazy(() => UserEventLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserEventLogWhereUniqueInputSchema),z.lazy(() => UserEventLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserEventLogWhereUniqueInputSchema),z.lazy(() => UserEventLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserEventLogWhereUniqueInputSchema),z.lazy(() => UserEventLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserEventLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserEventLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserEventLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserEventLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserEventLogScalarWhereInputSchema),z.lazy(() => UserEventLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogUpdateManyWithoutUserNestedInput>;

export const UserResourceUsageLogUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserResourceUsageLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceUsageLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserResourceUsageLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserResourceUsageLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserResourceUsageLogScalarWhereInputSchema),z.lazy(() => UserResourceUsageLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateManyWithoutUserNestedInput>;

export const UserInstanceTokenUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserInstanceTokenUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenCreateWithoutUserInputSchema).array(),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInstanceTokenCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserInstanceTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserInstanceTokenUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInstanceTokenCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserInstanceTokenUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserInstanceTokenUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserInstanceTokenScalarWhereInputSchema),z.lazy(() => UserInstanceTokenScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUpdateManyWithoutUserNestedInput>;

export const SessionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserNestedInput>;

export const UserEventLogUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserEventLogUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserEventLogCreateWithoutUserInputSchema),z.lazy(() => UserEventLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserEventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserEventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserEventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserEventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserEventLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserEventLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserEventLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserEventLogWhereUniqueInputSchema),z.lazy(() => UserEventLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserEventLogWhereUniqueInputSchema),z.lazy(() => UserEventLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserEventLogWhereUniqueInputSchema),z.lazy(() => UserEventLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserEventLogWhereUniqueInputSchema),z.lazy(() => UserEventLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserEventLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserEventLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserEventLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserEventLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserEventLogScalarWhereInputSchema),z.lazy(() => UserEventLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogUncheckedUpdateManyWithoutUserNestedInput>;

export const UserResourceUsageLogUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserResourceUsageLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceUsageLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserResourceUsageLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserResourceUsageLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserResourceUsageLogScalarWhereInputSchema),z.lazy(() => UserResourceUsageLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateManyWithoutUserNestedInput>;

export const UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenCreateWithoutUserInputSchema).array(),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInstanceTokenCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserInstanceTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserInstanceTokenUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInstanceTokenCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserInstanceTokenUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserInstanceTokenUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserInstanceTokenScalarWhereInputSchema),z.lazy(() => UserInstanceTokenScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInput>;

export const UserCreateNestedOneWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutSessionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateNestedOneWithoutSessionsInput>;

export const UserUpdateOneRequiredWithoutSessionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutSessionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutSessionsInputSchema),z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateOneRequiredWithoutSessionsNestedInput>;

export const UserResourceUsageLogCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceUsageLogCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateNestedManyWithoutInstanceInput>;

export const UserInstanceTokenCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.UserInstanceTokenCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInstanceTokenCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenCreateNestedManyWithoutInstanceInput>;

export const UserResourceUsageLogUncheckedCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceUsageLogCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedCreateNestedManyWithoutInstanceInput>;

export const UserInstanceTokenUncheckedCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.UserInstanceTokenUncheckedCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInstanceTokenCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUncheckedCreateNestedManyWithoutInstanceInput>;

export const UserResourceUsageLogUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserResourceUsageLogUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceUsageLogCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserResourceUsageLogUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserResourceUsageLogUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserResourceUsageLogScalarWhereInputSchema),z.lazy(() => UserResourceUsageLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateManyWithoutInstanceNestedInput>;

export const UserInstanceTokenUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.UserInstanceTokenUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserInstanceTokenUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInstanceTokenCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserInstanceTokenUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserInstanceTokenUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserInstanceTokenScalarWhereInputSchema),z.lazy(() => UserInstanceTokenScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUpdateManyWithoutInstanceNestedInput>;

export const UserResourceUsageLogUncheckedUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserResourceUsageLogUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceUsageLogCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserResourceUsageLogUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserResourceUsageLogUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserResourceUsageLogScalarWhereInputSchema),z.lazy(() => UserResourceUsageLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateManyWithoutInstanceNestedInput>;

export const UserInstanceTokenUncheckedUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserInstanceTokenUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInstanceTokenCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserInstanceTokenUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserInstanceTokenUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserInstanceTokenScalarWhereInputSchema),z.lazy(() => UserInstanceTokenScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutInstanceNestedInput>;

export const UserCreateNestedOneWithoutUserInstanceTokensInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserInstanceTokensInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserInstanceTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserInstanceTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserInstanceTokensInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateNestedOneWithoutUserInstanceTokensInput>;

export const ServiceInstanceCreateNestedOneWithoutUserInstanceTokensInputSchema: z.ZodType<Prisma.ServiceInstanceCreateNestedOneWithoutUserInstanceTokensInput> = z.object({
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserInstanceTokensInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserInstanceTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ServiceInstanceCreateOrConnectWithoutUserInstanceTokensInputSchema).optional(),
  connect: z.lazy(() => ServiceInstanceWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceCreateNestedOneWithoutUserInstanceTokensInput>;

export const UserUpdateOneRequiredWithoutUserInstanceTokensNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserInstanceTokensNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserInstanceTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserInstanceTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserInstanceTokensInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserInstanceTokensInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserInstanceTokensInputSchema),z.lazy(() => UserUpdateWithoutUserInstanceTokensInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserInstanceTokensInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserInstanceTokensNestedInput>;

export const ServiceInstanceUpdateOneRequiredWithoutUserInstanceTokensNestedInputSchema: z.ZodType<Prisma.ServiceInstanceUpdateOneRequiredWithoutUserInstanceTokensNestedInput> = z.object({
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserInstanceTokensInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserInstanceTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ServiceInstanceCreateOrConnectWithoutUserInstanceTokensInputSchema).optional(),
  upsert: z.lazy(() => ServiceInstanceUpsertWithoutUserInstanceTokensInputSchema).optional(),
  connect: z.lazy(() => ServiceInstanceWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ServiceInstanceUpdateToOneWithWhereWithoutUserInstanceTokensInputSchema),z.lazy(() => ServiceInstanceUpdateWithoutUserInstanceTokensInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUserInstanceTokensInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceUpdateOneRequiredWithoutUserInstanceTokensNestedInput>;

export const UserCreateNestedOneWithoutEventLogsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutEventLogsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEventLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutEventLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEventLogsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateNestedOneWithoutEventLogsInput>;

export const UserUpdateOneWithoutEventLogsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutEventLogsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEventLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutEventLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEventLogsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutEventLogsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutEventLogsInputSchema),z.lazy(() => UserUpdateWithoutEventLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEventLogsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateOneWithoutEventLogsNestedInput>;

export const UserCreateNestedOneWithoutUsageLogsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUsageLogsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUsageLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUsageLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUsageLogsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateNestedOneWithoutUsageLogsInput>;

export const ServiceInstanceCreateNestedOneWithoutUsageLogsInputSchema: z.ZodType<Prisma.ServiceInstanceCreateNestedOneWithoutUsageLogsInput> = z.object({
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUsageLogsInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUsageLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ServiceInstanceCreateOrConnectWithoutUsageLogsInputSchema).optional(),
  connect: z.lazy(() => ServiceInstanceWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceCreateNestedOneWithoutUsageLogsInput>;

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict() as z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput>;

export const UserUpdateOneWithoutUsageLogsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutUsageLogsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUsageLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUsageLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUsageLogsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUsageLogsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUsageLogsInputSchema),z.lazy(() => UserUpdateWithoutUsageLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUsageLogsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateOneWithoutUsageLogsNestedInput>;

export const ServiceInstanceUpdateOneWithoutUsageLogsNestedInputSchema: z.ZodType<Prisma.ServiceInstanceUpdateOneWithoutUsageLogsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUsageLogsInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUsageLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ServiceInstanceCreateOrConnectWithoutUsageLogsInputSchema).optional(),
  upsert: z.lazy(() => ServiceInstanceUpsertWithoutUsageLogsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ServiceInstanceWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ServiceInstanceWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ServiceInstanceWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ServiceInstanceUpdateToOneWithWhereWithoutUsageLogsInputSchema),z.lazy(() => ServiceInstanceUpdateWithoutUsageLogsInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUsageLogsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceUpdateOneWithoutUsageLogsNestedInput>;

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.NestedStringFilter>;

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.NestedStringNullableFilter>;

export const NestedEnumUserRoleFilterSchema: z.ZodType<Prisma.NestedEnumUserRoleFilter> = z.object({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => NestedEnumUserRoleFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.NestedEnumUserRoleFilter>;

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.NestedDateTimeNullableFilter>;

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.NestedBoolFilter>;

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.NestedDateTimeFilter>;

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedStringWithAggregatesFilter>;

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.NestedIntFilter>;

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter>;

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.NestedIntNullableFilter>;

export const NestedEnumUserRoleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumUserRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => NestedEnumUserRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserRoleFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedEnumUserRoleWithAggregatesFilter>;

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter>;

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedBoolWithAggregatesFilter>;

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter>;

export const NestedJsonFilterSchema: z.ZodType<Prisma.NestedJsonFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict() as z.ZodType<Prisma.NestedJsonFilter>;

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter>;

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.NestedFloatNullableFilter>;

export const SessionCreateWithoutUserInputSchema: z.ZodType<Omit<Prisma.SessionCreateWithoutUserInput, "createdAt">> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date().min(new Date()),
  currentIp: z.string().ip().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.SessionCreateWithoutUserInput, "createdAt">>;

export const SessionUncheckedCreateWithoutUserInputSchema: z.ZodType<Omit<Prisma.SessionUncheckedCreateWithoutUserInput, "createdAt">> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date().min(new Date()),
  currentIp: z.string().ip().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.SessionUncheckedCreateWithoutUserInput, "createdAt">>;

export const SessionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.SessionCreateOrConnectWithoutUserInput>;

export const SessionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.SessionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SessionCreateManyUserInputSchema),z.lazy(() => SessionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.SessionCreateManyUserInputEnvelope>;

export const UserEventLogCreateWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => EventTypeSchema),
  resultType: z.lazy(() => EventResultTypeSchema),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserEventLogCreateWithoutUserInput>;

export const UserEventLogUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => EventTypeSchema),
  resultType: z.lazy(() => EventResultTypeSchema),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserEventLogUncheckedCreateWithoutUserInput>;

export const UserEventLogCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserEventLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserEventLogCreateWithoutUserInputSchema),z.lazy(() => UserEventLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserEventLogCreateOrConnectWithoutUserInput>;

export const UserEventLogCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserEventLogCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserEventLogCreateManyUserInputSchema),z.lazy(() => UserEventLogCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.UserEventLogCreateManyUserInputEnvelope>;

export const UserResourceUsageLogCreateWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  model: z.string(),
  openaiTeamId: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  utf8Length: z.number().int().optional().nullable(),
  tokensLength: z.number().int().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  timestamp: z.coerce.date().optional(),
  instance: z.lazy(() => ServiceInstanceCreateNestedOneWithoutUsageLogsInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateWithoutUserInput>;

export const UserResourceUsageLogUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  instanceId: z.string().optional().nullable(),
  model: z.string(),
  openaiTeamId: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  utf8Length: z.number().int().optional().nullable(),
  tokensLength: z.number().int().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedCreateWithoutUserInput>;

export const UserResourceUsageLogCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateOrConnectWithoutUserInput>;

export const UserResourceUsageLogCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserResourceUsageLogCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserResourceUsageLogCreateManyUserInputSchema),z.lazy(() => UserResourceUsageLogCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateManyUserInputEnvelope>;

export const UserInstanceTokenCreateWithoutUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateWithoutUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  token: z.string(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  instance: z.lazy(() => ServiceInstanceCreateNestedOneWithoutUserInstanceTokensInputSchema)
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateWithoutUserInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedCreateWithoutUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedCreateWithoutUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  token: z.string(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedCreateWithoutUserInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserInstanceTokenCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserInstanceTokenCreateOrConnectWithoutUserInput>;

export const UserInstanceTokenCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserInstanceTokenCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserInstanceTokenCreateManyUserInputSchema),z.lazy(() => UserInstanceTokenCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenCreateManyUserInputEnvelope>;

export const SessionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.SessionUpsertWithWhereUniqueWithoutUserInput>;

export const SessionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.SessionUpdateWithWhereUniqueWithoutUserInput>;

export const SessionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => SessionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateManyMutationInputSchema),z.lazy(() => SessionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.SessionUpdateManyWithWhereWithoutUserInput>;

export const SessionScalarWhereInputSchema: z.ZodType<Prisma.SessionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  currentIp: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.SessionScalarWhereInput>;

export const UserEventLogUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserEventLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserEventLogUpdateWithoutUserInputSchema),z.lazy(() => UserEventLogUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserEventLogCreateWithoutUserInputSchema),z.lazy(() => UserEventLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserEventLogUpsertWithWhereUniqueWithoutUserInput>;

export const UserEventLogUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserEventLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserEventLogUpdateWithoutUserInputSchema),z.lazy(() => UserEventLogUncheckedUpdateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserEventLogUpdateWithWhereUniqueWithoutUserInput>;

export const UserEventLogUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserEventLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserEventLogUpdateManyMutationInputSchema),z.lazy(() => UserEventLogUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserEventLogUpdateManyWithWhereWithoutUserInput>;

export const UserEventLogScalarWhereInputSchema: z.ZodType<Prisma.UserEventLogScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserEventLogScalarWhereInputSchema),z.lazy(() => UserEventLogScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserEventLogScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserEventLogScalarWhereInputSchema),z.lazy(() => UserEventLogScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  resultType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.lazy(() => JsonFilterSchema).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogScalarWhereInput>;

export const UserResourceUsageLogUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserResourceUsageLogUpdateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpsertWithWhereUniqueWithoutUserInput>;

export const UserResourceUsageLogUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserResourceUsageLogUpdateWithoutUserInputSchema),z.lazy(() => UserResourceUsageLogUncheckedUpdateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateWithWhereUniqueWithoutUserInput>;

export const UserResourceUsageLogUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserResourceUsageLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserResourceUsageLogUpdateManyMutationInputSchema),z.lazy(() => UserResourceUsageLogUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateManyWithWhereWithoutUserInput>;

export const UserResourceUsageLogScalarWhereInputSchema: z.ZodType<Prisma.UserResourceUsageLogScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserResourceUsageLogScalarWhereInputSchema),z.lazy(() => UserResourceUsageLogScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserResourceUsageLogScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserResourceUsageLogScalarWhereInputSchema),z.lazy(() => UserResourceUsageLogScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  model: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  openaiTeamId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  text: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  utf8Length: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  tokensLength: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  conversationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogScalarWhereInput>;

export const UserInstanceTokenUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserInstanceTokenUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserInstanceTokenUpdateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUpsertWithWhereUniqueWithoutUserInput>;

export const UserInstanceTokenUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserInstanceTokenUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserInstanceTokenUpdateWithoutUserInputSchema),z.lazy(() => UserInstanceTokenUncheckedUpdateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUpdateWithWhereUniqueWithoutUserInput>;

export const UserInstanceTokenUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserInstanceTokenUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserInstanceTokenScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserInstanceTokenUpdateManyMutationInputSchema),z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUpdateManyWithWhereWithoutUserInput>;

export const UserInstanceTokenScalarWhereInputSchema: z.ZodType<Prisma.UserInstanceTokenScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserInstanceTokenScalarWhereInputSchema),z.lazy(() => UserInstanceTokenScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInstanceTokenScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInstanceTokenScalarWhereInputSchema),z.lazy(() => UserInstanceTokenScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenScalarWhereInput>;

export const UserCreateWithoutSessionsInputSchema: z.ZodType<Omit<Prisma.UserCreateWithoutSessionsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  eventLogs: z.lazy(() => UserEventLogCreateNestedManyWithoutUserInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogCreateNestedManyWithoutUserInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserCreateWithoutSessionsInput, "createdAt" | "updatedAt">>;

export const UserUncheckedCreateWithoutSessionsInputSchema: z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutSessionsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  eventLogs: z.lazy(() => UserEventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutSessionsInput, "createdAt" | "updatedAt">>;

export const UserCreateOrConnectWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutSessionsInput>;

export const UserUpsertWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutSessionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpsertWithoutSessionsInput>;

export const UserUpdateToOneWithWhereWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutSessionsInput>;

export const UserUpdateWithoutSessionsInputSchema: z.ZodType<Omit<Prisma.UserUpdateWithoutSessionsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  eventLogs: z.lazy(() => UserEventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUpdateManyWithoutUserNestedInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUpdateWithoutSessionsInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateWithoutSessionsInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutSessionsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  eventLogs: z.lazy(() => UserEventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutSessionsInput, "createdAt" | "updatedAt">>;

export const UserResourceUsageLogCreateWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogCreateWithoutInstanceInput> = z.object({
  id: z.string().cuid().optional(),
  model: z.string(),
  openaiTeamId: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  utf8Length: z.number().int().optional().nullable(),
  tokensLength: z.number().int().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  timestamp: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUsageLogsInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateWithoutInstanceInput>;

export const UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedCreateWithoutInstanceInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  model: z.string(),
  openaiTeamId: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  utf8Length: z.number().int().optional().nullable(),
  tokensLength: z.number().int().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedCreateWithoutInstanceInput>;

export const UserResourceUsageLogCreateOrConnectWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogCreateOrConnectWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateOrConnectWithoutInstanceInput>;

export const UserResourceUsageLogCreateManyInstanceInputEnvelopeSchema: z.ZodType<Prisma.UserResourceUsageLogCreateManyInstanceInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserResourceUsageLogCreateManyInstanceInputSchema),z.lazy(() => UserResourceUsageLogCreateManyInstanceInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateManyInstanceInputEnvelope>;

export const UserInstanceTokenCreateWithoutInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateWithoutInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  token: z.string(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUserInstanceTokensInputSchema)
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateWithoutInstanceInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedCreateWithoutInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  token: z.string(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedCreateWithoutInstanceInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema: z.ZodType<Prisma.UserInstanceTokenCreateOrConnectWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserInstanceTokenCreateOrConnectWithoutInstanceInput>;

export const UserInstanceTokenCreateManyInstanceInputEnvelopeSchema: z.ZodType<Prisma.UserInstanceTokenCreateManyInstanceInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserInstanceTokenCreateManyInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateManyInstanceInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenCreateManyInstanceInputEnvelope>;

export const UserResourceUsageLogUpsertWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpsertWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserResourceUsageLogUpdateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUncheckedUpdateWithoutInstanceInputSchema) ]),
  create: z.union([ z.lazy(() => UserResourceUsageLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpsertWithWhereUniqueWithoutInstanceInput>;

export const UserResourceUsageLogUpdateWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserResourceUsageLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserResourceUsageLogUpdateWithoutInstanceInputSchema),z.lazy(() => UserResourceUsageLogUncheckedUpdateWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateWithWhereUniqueWithoutInstanceInput>;

export const UserResourceUsageLogUpdateManyWithWhereWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateManyWithWhereWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserResourceUsageLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserResourceUsageLogUpdateManyMutationInputSchema),z.lazy(() => UserResourceUsageLogUncheckedUpdateManyWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateManyWithWhereWithoutInstanceInput>;

export const UserInstanceTokenUpsertWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.UserInstanceTokenUpsertWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserInstanceTokenUpdateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUncheckedUpdateWithoutInstanceInputSchema) ]),
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUpsertWithWhereUniqueWithoutInstanceInput>;

export const UserInstanceTokenUpdateWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.UserInstanceTokenUpdateWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserInstanceTokenUpdateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUncheckedUpdateWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUpdateWithWhereUniqueWithoutInstanceInput>;

export const UserInstanceTokenUpdateManyWithWhereWithoutInstanceInputSchema: z.ZodType<Prisma.UserInstanceTokenUpdateManyWithWhereWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserInstanceTokenScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserInstanceTokenUpdateManyMutationInputSchema),z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUpdateManyWithWhereWithoutInstanceInput>;

export const UserCreateWithoutUserInstanceTokensInputSchema: z.ZodType<Omit<Prisma.UserCreateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogCreateNestedManyWithoutUserInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserCreateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">>;

export const UserUncheckedCreateWithoutUserInstanceTokensInputSchema: z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">>;

export const UserCreateOrConnectWithoutUserInstanceTokensInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserInstanceTokensInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserInstanceTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserInstanceTokensInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutUserInstanceTokensInput>;

export const ServiceInstanceCreateWithoutUserInstanceTokensInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceCreateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceCreateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedCreateWithoutUserInstanceTokensInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceCreateOrConnectWithoutUserInstanceTokensInputSchema: z.ZodType<Prisma.ServiceInstanceCreateOrConnectWithoutUserInstanceTokensInput> = z.object({
  where: z.lazy(() => ServiceInstanceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserInstanceTokensInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserInstanceTokensInputSchema) ]),
}).strict() as z.ZodType<Prisma.ServiceInstanceCreateOrConnectWithoutUserInstanceTokensInput>;

export const UserUpsertWithoutUserInstanceTokensInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserInstanceTokensInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserInstanceTokensInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserInstanceTokensInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserInstanceTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserInstanceTokensInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpsertWithoutUserInstanceTokensInput>;

export const UserUpdateToOneWithWhereWithoutUserInstanceTokensInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserInstanceTokensInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserInstanceTokensInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserInstanceTokensInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserInstanceTokensInput>;

export const UserUpdateWithoutUserInstanceTokensInputSchema: z.ZodType<Omit<Prisma.UserUpdateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUpdateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateWithoutUserInstanceTokensInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUpsertWithoutUserInstanceTokensInputSchema: z.ZodType<Prisma.ServiceInstanceUpsertWithoutUserInstanceTokensInput> = z.object({
  update: z.union([ z.lazy(() => ServiceInstanceUpdateWithoutUserInstanceTokensInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUserInstanceTokensInputSchema) ]),
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserInstanceTokensInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserInstanceTokensInputSchema) ]),
  where: z.lazy(() => ServiceInstanceWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceUpsertWithoutUserInstanceTokensInput>;

export const ServiceInstanceUpdateToOneWithWhereWithoutUserInstanceTokensInputSchema: z.ZodType<Prisma.ServiceInstanceUpdateToOneWithWhereWithoutUserInstanceTokensInput> = z.object({
  where: z.lazy(() => ServiceInstanceWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ServiceInstanceUpdateWithoutUserInstanceTokensInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUserInstanceTokensInputSchema) ]),
}).strict() as z.ZodType<Prisma.ServiceInstanceUpdateToOneWithWhereWithoutUserInstanceTokensInput>;

export const ServiceInstanceUpdateWithoutUserInstanceTokensInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUpdateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUpdateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedUpdateWithoutUserInstanceTokensInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateWithoutUserInstanceTokensInput, "createdAt" | "updatedAt">>;

export const UserCreateWithoutEventLogsInputSchema: z.ZodType<Omit<Prisma.UserCreateWithoutEventLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogCreateNestedManyWithoutUserInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserCreateWithoutEventLogsInput, "createdAt" | "updatedAt">>;

export const UserUncheckedCreateWithoutEventLogsInputSchema: z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutEventLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutEventLogsInput, "createdAt" | "updatedAt">>;

export const UserCreateOrConnectWithoutEventLogsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutEventLogsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutEventLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutEventLogsInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutEventLogsInput>;

export const UserUpsertWithoutEventLogsInputSchema: z.ZodType<Prisma.UserUpsertWithoutEventLogsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutEventLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEventLogsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutEventLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutEventLogsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpsertWithoutEventLogsInput>;

export const UserUpdateToOneWithWhereWithoutEventLogsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutEventLogsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutEventLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEventLogsInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutEventLogsInput>;

export const UserUpdateWithoutEventLogsInputSchema: z.ZodType<Omit<Prisma.UserUpdateWithoutEventLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUpdateManyWithoutUserNestedInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUpdateWithoutEventLogsInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateWithoutEventLogsInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutEventLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  usageLogs: z.lazy(() => UserResourceUsageLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutEventLogsInput, "createdAt" | "updatedAt">>;

export const UserCreateWithoutUsageLogsInputSchema: z.ZodType<Omit<Prisma.UserCreateWithoutUsageLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogCreateNestedManyWithoutUserInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserCreateWithoutUsageLogsInput, "createdAt" | "updatedAt">>;

export const UserUncheckedCreateWithoutUsageLogsInputSchema: z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutUsageLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutUsageLogsInput, "createdAt" | "updatedAt">>;

export const UserCreateOrConnectWithoutUsageLogsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUsageLogsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUsageLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUsageLogsInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutUsageLogsInput>;

export const ServiceInstanceCreateWithoutUsageLogsInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceCreateWithoutUsageLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceCreateWithoutUsageLogsInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedCreateWithoutUsageLogsInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateWithoutUsageLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateWithoutUsageLogsInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceCreateOrConnectWithoutUsageLogsInputSchema: z.ZodType<Prisma.ServiceInstanceCreateOrConnectWithoutUsageLogsInput> = z.object({
  where: z.lazy(() => ServiceInstanceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUsageLogsInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUsageLogsInputSchema) ]),
}).strict() as z.ZodType<Prisma.ServiceInstanceCreateOrConnectWithoutUsageLogsInput>;

export const UserUpsertWithoutUsageLogsInputSchema: z.ZodType<Prisma.UserUpsertWithoutUsageLogsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUsageLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUsageLogsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUsageLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUsageLogsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpsertWithoutUsageLogsInput>;

export const UserUpdateToOneWithWhereWithoutUsageLogsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUsageLogsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUsageLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUsageLogsInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUsageLogsInput>;

export const UserUpdateWithoutUsageLogsInputSchema: z.ZodType<Omit<Prisma.UserUpdateWithoutUsageLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUpdateWithoutUsageLogsInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateWithoutUsageLogsInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutUsageLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(32).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  eventLogs: z.lazy(() => UserEventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutUsageLogsInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUpsertWithoutUsageLogsInputSchema: z.ZodType<Prisma.ServiceInstanceUpsertWithoutUsageLogsInput> = z.object({
  update: z.union([ z.lazy(() => ServiceInstanceUpdateWithoutUsageLogsInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUsageLogsInputSchema) ]),
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUsageLogsInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUsageLogsInputSchema) ]),
  where: z.lazy(() => ServiceInstanceWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceUpsertWithoutUsageLogsInput>;

export const ServiceInstanceUpdateToOneWithWhereWithoutUsageLogsInputSchema: z.ZodType<Prisma.ServiceInstanceUpdateToOneWithWhereWithoutUsageLogsInput> = z.object({
  where: z.lazy(() => ServiceInstanceWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ServiceInstanceUpdateWithoutUsageLogsInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUsageLogsInputSchema) ]),
}).strict() as z.ZodType<Prisma.ServiceInstanceUpdateToOneWithWhereWithoutUsageLogsInput>;

export const ServiceInstanceUpdateWithoutUsageLogsInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUpdateWithoutUsageLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUpdateWithoutUsageLogsInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedUpdateWithoutUsageLogsInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateWithoutUsageLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userInstanceTokens: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateWithoutUsageLogsInput, "createdAt" | "updatedAt">>;

export const SessionCreateManyUserInputSchema: z.ZodType<Omit<Prisma.SessionCreateManyUserInput, "createdAt">> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date().min(new Date()),
  currentIp: z.string().ip().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.SessionCreateManyUserInput, "createdAt">>;

export const UserEventLogCreateManyUserInputSchema: z.ZodType<Prisma.UserEventLogCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => EventTypeSchema),
  resultType: z.lazy(() => EventResultTypeSchema),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserEventLogCreateManyUserInput>;

export const UserResourceUsageLogCreateManyUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  instanceId: z.string().optional().nullable(),
  model: z.string(),
  openaiTeamId: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  utf8Length: z.number().int().optional().nullable(),
  tokensLength: z.number().int().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateManyUserInput>;

export const UserInstanceTokenCreateManyUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  token: z.string(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyUserInput, "createdAt" | "updatedAt">>;

export const SessionUpdateWithoutUserInputSchema: z.ZodType<Omit<Prisma.SessionUpdateWithoutUserInput, "createdAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date().min(new Date()),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  currentIp: z.union([ z.string().ip(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.SessionUpdateWithoutUserInput, "createdAt">>;

export const SessionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Omit<Prisma.SessionUncheckedUpdateWithoutUserInput, "createdAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date().min(new Date()),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  currentIp: z.union([ z.string().ip(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.SessionUncheckedUpdateWithoutUserInput, "createdAt">>;

export const SessionUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Omit<Prisma.SessionUncheckedUpdateManyWithoutUserInput, "createdAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date().min(new Date()),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  currentIp: z.union([ z.string().ip(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.SessionUncheckedUpdateManyWithoutUserInput, "createdAt">>;

export const UserEventLogUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogUpdateWithoutUserInput>;

export const UserEventLogUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogUncheckedUpdateWithoutUserInput>;

export const UserEventLogUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserEventLogUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),z.lazy(() => EventContentSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogUncheckedUpdateManyWithoutUserInput>;

export const UserResourceUsageLogUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  openaiTeamId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  text: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  utf8Length: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tokensLength: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  conversationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  instance: z.lazy(() => ServiceInstanceUpdateOneWithoutUsageLogsNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateWithoutUserInput>;

export const UserResourceUsageLogUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  openaiTeamId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  text: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  utf8Length: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tokensLength: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  conversationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateWithoutUserInput>;

export const UserResourceUsageLogUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  openaiTeamId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  text: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  utf8Length: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tokensLength: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  conversationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateManyWithoutUserInput>;

export const UserInstanceTokenUpdateWithoutUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpdateWithoutUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  instance: z.lazy(() => ServiceInstanceUpdateOneRequiredWithoutUserInstanceTokensNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpdateWithoutUserInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateWithoutUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateWithoutUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateWithoutUserInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutUserInput, "createdAt" | "updatedAt">>;

export const UserResourceUsageLogCreateManyInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogCreateManyInstanceInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  model: z.string(),
  openaiTeamId: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  utf8Length: z.number().int().optional().nullable(),
  tokensLength: z.number().int().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateManyInstanceInput>;

export const UserInstanceTokenCreateManyInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  token: z.string(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyInstanceInput, "createdAt" | "updatedAt">>;

export const UserResourceUsageLogUpdateWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateWithoutInstanceInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  openaiTeamId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  text: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  utf8Length: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tokensLength: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  conversationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutUsageLogsNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateWithoutInstanceInput>;

export const UserResourceUsageLogUncheckedUpdateWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateWithoutInstanceInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  openaiTeamId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  text: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  utf8Length: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tokensLength: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  conversationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateWithoutInstanceInput>;

export const UserResourceUsageLogUncheckedUpdateManyWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateManyWithoutInstanceInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  openaiTeamId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  text: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  utf8Length: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tokensLength: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  conversationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUncheckedUpdateManyWithoutInstanceInput>;

export const UserInstanceTokenUpdateWithoutInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpdateWithoutInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutUserInstanceTokensNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpdateWithoutInstanceInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateWithoutInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateWithoutInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateWithoutInstanceInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateManyWithoutInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutInstanceInput, "createdAt" | "updatedAt">>;

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserFindFirstArgs>;

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserFindFirstOrThrowArgs>;

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserFindManyArgs>;

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserAggregateArgs>;

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserGroupByArgs>;

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserFindUniqueArgs>;

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserFindUniqueOrThrowArgs>;

export const SessionFindFirstArgsSchema: z.ZodType<Prisma.SessionFindFirstArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.SessionFindFirstArgs>;

export const SessionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SessionFindFirstOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.SessionFindFirstOrThrowArgs>;

export const SessionFindManyArgsSchema: z.ZodType<Prisma.SessionFindManyArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.SessionFindManyArgs>;

export const SessionAggregateArgsSchema: z.ZodType<Prisma.SessionAggregateArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.SessionAggregateArgs>;

export const SessionGroupByArgsSchema: z.ZodType<Prisma.SessionGroupByArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithAggregationInputSchema.array(),SessionOrderByWithAggregationInputSchema ]).optional(),
  by: SessionScalarFieldEnumSchema.array(),
  having: SessionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.SessionGroupByArgs>;

export const SessionFindUniqueArgsSchema: z.ZodType<Prisma.SessionFindUniqueArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.SessionFindUniqueArgs>;

export const SessionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.SessionFindUniqueOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.SessionFindUniqueOrThrowArgs>;

export const ServiceInstanceFindFirstArgsSchema: z.ZodType<Prisma.ServiceInstanceFindFirstArgs> = z.object({
  select: ServiceInstanceSelectSchema.optional(),
  include: ServiceInstanceIncludeSchema.optional(),
  where: ServiceInstanceWhereInputSchema.optional(),
  orderBy: z.union([ ServiceInstanceOrderByWithRelationInputSchema.array(),ServiceInstanceOrderByWithRelationInputSchema ]).optional(),
  cursor: ServiceInstanceWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ServiceInstanceScalarFieldEnumSchema,ServiceInstanceScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceFindFirstArgs>;

export const ServiceInstanceFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ServiceInstanceFindFirstOrThrowArgs> = z.object({
  select: ServiceInstanceSelectSchema.optional(),
  include: ServiceInstanceIncludeSchema.optional(),
  where: ServiceInstanceWhereInputSchema.optional(),
  orderBy: z.union([ ServiceInstanceOrderByWithRelationInputSchema.array(),ServiceInstanceOrderByWithRelationInputSchema ]).optional(),
  cursor: ServiceInstanceWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ServiceInstanceScalarFieldEnumSchema,ServiceInstanceScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceFindFirstOrThrowArgs>;

export const ServiceInstanceFindManyArgsSchema: z.ZodType<Prisma.ServiceInstanceFindManyArgs> = z.object({
  select: ServiceInstanceSelectSchema.optional(),
  include: ServiceInstanceIncludeSchema.optional(),
  where: ServiceInstanceWhereInputSchema.optional(),
  orderBy: z.union([ ServiceInstanceOrderByWithRelationInputSchema.array(),ServiceInstanceOrderByWithRelationInputSchema ]).optional(),
  cursor: ServiceInstanceWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ServiceInstanceScalarFieldEnumSchema,ServiceInstanceScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceFindManyArgs>;

export const ServiceInstanceAggregateArgsSchema: z.ZodType<Prisma.ServiceInstanceAggregateArgs> = z.object({
  where: ServiceInstanceWhereInputSchema.optional(),
  orderBy: z.union([ ServiceInstanceOrderByWithRelationInputSchema.array(),ServiceInstanceOrderByWithRelationInputSchema ]).optional(),
  cursor: ServiceInstanceWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceAggregateArgs>;

export const ServiceInstanceGroupByArgsSchema: z.ZodType<Prisma.ServiceInstanceGroupByArgs> = z.object({
  where: ServiceInstanceWhereInputSchema.optional(),
  orderBy: z.union([ ServiceInstanceOrderByWithAggregationInputSchema.array(),ServiceInstanceOrderByWithAggregationInputSchema ]).optional(),
  by: ServiceInstanceScalarFieldEnumSchema.array(),
  having: ServiceInstanceScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceGroupByArgs>;

export const ServiceInstanceFindUniqueArgsSchema: z.ZodType<Prisma.ServiceInstanceFindUniqueArgs> = z.object({
  select: ServiceInstanceSelectSchema.optional(),
  include: ServiceInstanceIncludeSchema.optional(),
  where: ServiceInstanceWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.ServiceInstanceFindUniqueArgs>;

export const ServiceInstanceFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ServiceInstanceFindUniqueOrThrowArgs> = z.object({
  select: ServiceInstanceSelectSchema.optional(),
  include: ServiceInstanceIncludeSchema.optional(),
  where: ServiceInstanceWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.ServiceInstanceFindUniqueOrThrowArgs>;

export const UserInstanceTokenFindFirstArgsSchema: z.ZodType<Prisma.UserInstanceTokenFindFirstArgs> = z.object({
  select: UserInstanceTokenSelectSchema.optional(),
  include: UserInstanceTokenIncludeSchema.optional(),
  where: UserInstanceTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserInstanceTokenOrderByWithRelationInputSchema.array(),UserInstanceTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: UserInstanceTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserInstanceTokenScalarFieldEnumSchema,UserInstanceTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenFindFirstArgs>;

export const UserInstanceTokenFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserInstanceTokenFindFirstOrThrowArgs> = z.object({
  select: UserInstanceTokenSelectSchema.optional(),
  include: UserInstanceTokenIncludeSchema.optional(),
  where: UserInstanceTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserInstanceTokenOrderByWithRelationInputSchema.array(),UserInstanceTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: UserInstanceTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserInstanceTokenScalarFieldEnumSchema,UserInstanceTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenFindFirstOrThrowArgs>;

export const UserInstanceTokenFindManyArgsSchema: z.ZodType<Prisma.UserInstanceTokenFindManyArgs> = z.object({
  select: UserInstanceTokenSelectSchema.optional(),
  include: UserInstanceTokenIncludeSchema.optional(),
  where: UserInstanceTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserInstanceTokenOrderByWithRelationInputSchema.array(),UserInstanceTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: UserInstanceTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserInstanceTokenScalarFieldEnumSchema,UserInstanceTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenFindManyArgs>;

export const UserInstanceTokenAggregateArgsSchema: z.ZodType<Prisma.UserInstanceTokenAggregateArgs> = z.object({
  where: UserInstanceTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserInstanceTokenOrderByWithRelationInputSchema.array(),UserInstanceTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: UserInstanceTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenAggregateArgs>;

export const UserInstanceTokenGroupByArgsSchema: z.ZodType<Prisma.UserInstanceTokenGroupByArgs> = z.object({
  where: UserInstanceTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserInstanceTokenOrderByWithAggregationInputSchema.array(),UserInstanceTokenOrderByWithAggregationInputSchema ]).optional(),
  by: UserInstanceTokenScalarFieldEnumSchema.array(),
  having: UserInstanceTokenScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenGroupByArgs>;

export const UserInstanceTokenFindUniqueArgsSchema: z.ZodType<Prisma.UserInstanceTokenFindUniqueArgs> = z.object({
  select: UserInstanceTokenSelectSchema.optional(),
  include: UserInstanceTokenIncludeSchema.optional(),
  where: UserInstanceTokenWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserInstanceTokenFindUniqueArgs>;

export const UserInstanceTokenFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserInstanceTokenFindUniqueOrThrowArgs> = z.object({
  select: UserInstanceTokenSelectSchema.optional(),
  include: UserInstanceTokenIncludeSchema.optional(),
  where: UserInstanceTokenWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserInstanceTokenFindUniqueOrThrowArgs>;

export const UserEventLogFindFirstArgsSchema: z.ZodType<Prisma.UserEventLogFindFirstArgs> = z.object({
  select: UserEventLogSelectSchema.optional(),
  include: UserEventLogIncludeSchema.optional(),
  where: UserEventLogWhereInputSchema.optional(),
  orderBy: z.union([ UserEventLogOrderByWithRelationInputSchema.array(),UserEventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserEventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserEventLogScalarFieldEnumSchema,UserEventLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogFindFirstArgs>;

export const UserEventLogFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserEventLogFindFirstOrThrowArgs> = z.object({
  select: UserEventLogSelectSchema.optional(),
  include: UserEventLogIncludeSchema.optional(),
  where: UserEventLogWhereInputSchema.optional(),
  orderBy: z.union([ UserEventLogOrderByWithRelationInputSchema.array(),UserEventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserEventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserEventLogScalarFieldEnumSchema,UserEventLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogFindFirstOrThrowArgs>;

export const UserEventLogFindManyArgsSchema: z.ZodType<Prisma.UserEventLogFindManyArgs> = z.object({
  select: UserEventLogSelectSchema.optional(),
  include: UserEventLogIncludeSchema.optional(),
  where: UserEventLogWhereInputSchema.optional(),
  orderBy: z.union([ UserEventLogOrderByWithRelationInputSchema.array(),UserEventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserEventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserEventLogScalarFieldEnumSchema,UserEventLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserEventLogFindManyArgs>;

export const UserEventLogAggregateArgsSchema: z.ZodType<Prisma.UserEventLogAggregateArgs> = z.object({
  where: UserEventLogWhereInputSchema.optional(),
  orderBy: z.union([ UserEventLogOrderByWithRelationInputSchema.array(),UserEventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserEventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserEventLogAggregateArgs>;

export const UserEventLogGroupByArgsSchema: z.ZodType<Prisma.UserEventLogGroupByArgs> = z.object({
  where: UserEventLogWhereInputSchema.optional(),
  orderBy: z.union([ UserEventLogOrderByWithAggregationInputSchema.array(),UserEventLogOrderByWithAggregationInputSchema ]).optional(),
  by: UserEventLogScalarFieldEnumSchema.array(),
  having: UserEventLogScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserEventLogGroupByArgs>;

export const UserEventLogFindUniqueArgsSchema: z.ZodType<Prisma.UserEventLogFindUniqueArgs> = z.object({
  select: UserEventLogSelectSchema.optional(),
  include: UserEventLogIncludeSchema.optional(),
  where: UserEventLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserEventLogFindUniqueArgs>;

export const UserEventLogFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserEventLogFindUniqueOrThrowArgs> = z.object({
  select: UserEventLogSelectSchema.optional(),
  include: UserEventLogIncludeSchema.optional(),
  where: UserEventLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserEventLogFindUniqueOrThrowArgs>;

export const UserResourceUsageLogFindFirstArgsSchema: z.ZodType<Prisma.UserResourceUsageLogFindFirstArgs> = z.object({
  select: UserResourceUsageLogSelectSchema.optional(),
  include: UserResourceUsageLogIncludeSchema.optional(),
  where: UserResourceUsageLogWhereInputSchema.optional(),
  orderBy: z.union([ UserResourceUsageLogOrderByWithRelationInputSchema.array(),UserResourceUsageLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserResourceUsageLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserResourceUsageLogScalarFieldEnumSchema,UserResourceUsageLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogFindFirstArgs>;

export const UserResourceUsageLogFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserResourceUsageLogFindFirstOrThrowArgs> = z.object({
  select: UserResourceUsageLogSelectSchema.optional(),
  include: UserResourceUsageLogIncludeSchema.optional(),
  where: UserResourceUsageLogWhereInputSchema.optional(),
  orderBy: z.union([ UserResourceUsageLogOrderByWithRelationInputSchema.array(),UserResourceUsageLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserResourceUsageLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserResourceUsageLogScalarFieldEnumSchema,UserResourceUsageLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogFindFirstOrThrowArgs>;

export const UserResourceUsageLogFindManyArgsSchema: z.ZodType<Prisma.UserResourceUsageLogFindManyArgs> = z.object({
  select: UserResourceUsageLogSelectSchema.optional(),
  include: UserResourceUsageLogIncludeSchema.optional(),
  where: UserResourceUsageLogWhereInputSchema.optional(),
  orderBy: z.union([ UserResourceUsageLogOrderByWithRelationInputSchema.array(),UserResourceUsageLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserResourceUsageLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserResourceUsageLogScalarFieldEnumSchema,UserResourceUsageLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogFindManyArgs>;

export const UserResourceUsageLogAggregateArgsSchema: z.ZodType<Prisma.UserResourceUsageLogAggregateArgs> = z.object({
  where: UserResourceUsageLogWhereInputSchema.optional(),
  orderBy: z.union([ UserResourceUsageLogOrderByWithRelationInputSchema.array(),UserResourceUsageLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserResourceUsageLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogAggregateArgs>;

export const UserResourceUsageLogGroupByArgsSchema: z.ZodType<Prisma.UserResourceUsageLogGroupByArgs> = z.object({
  where: UserResourceUsageLogWhereInputSchema.optional(),
  orderBy: z.union([ UserResourceUsageLogOrderByWithAggregationInputSchema.array(),UserResourceUsageLogOrderByWithAggregationInputSchema ]).optional(),
  by: UserResourceUsageLogScalarFieldEnumSchema.array(),
  having: UserResourceUsageLogScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogGroupByArgs>;

export const UserResourceUsageLogFindUniqueArgsSchema: z.ZodType<Prisma.UserResourceUsageLogFindUniqueArgs> = z.object({
  select: UserResourceUsageLogSelectSchema.optional(),
  include: UserResourceUsageLogIncludeSchema.optional(),
  where: UserResourceUsageLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserResourceUsageLogFindUniqueArgs>;

export const UserResourceUsageLogFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserResourceUsageLogFindUniqueOrThrowArgs> = z.object({
  select: UserResourceUsageLogSelectSchema.optional(),
  include: UserResourceUsageLogIncludeSchema.optional(),
  where: UserResourceUsageLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserResourceUsageLogFindUniqueOrThrowArgs>;

export const UserCreateArgsSchema: z.ZodType<Omit<Prisma.UserCreateArgs, "data"> & { data: z.infer<typeof UserCreateInputSchema> | z.infer<typeof UserUncheckedCreateInputSchema> }> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Omit<Prisma.UserCreateArgs, "data"> & { data: z.infer<typeof UserCreateInputSchema> | z.infer<typeof UserUncheckedCreateInputSchema> }>;

export const UserUpsertArgsSchema: z.ZodType<Omit<Prisma.UserUpsertArgs, "create" | "update"> & { create: z.infer<typeof UserCreateInputSchema> | z.infer<typeof UserUncheckedCreateInputSchema>, update: z.infer<typeof UserUpdateInputSchema> | z.infer<typeof UserUncheckedUpdateInputSchema> }> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Omit<Prisma.UserUpsertArgs, "create" | "update"> & { create: z.infer<typeof UserCreateInputSchema> | z.infer<typeof UserUncheckedCreateInputSchema>, update: z.infer<typeof UserUpdateInputSchema> | z.infer<typeof UserUncheckedUpdateInputSchema> }>;

export const UserCreateManyArgsSchema: z.ZodType<Omit<Prisma.UserCreateManyArgs, "data"> & { data: z.infer<typeof UserCreateManyInputSchema> | z.infer<typeof UserCreateManyInputSchema>[] }> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Omit<Prisma.UserCreateManyArgs, "data"> & { data: z.infer<typeof UserCreateManyInputSchema> | z.infer<typeof UserCreateManyInputSchema>[] }>;

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserDeleteArgs>;

export const UserUpdateArgsSchema: z.ZodType<Omit<Prisma.UserUpdateArgs, "data"> & { data: z.infer<typeof UserUpdateInputSchema> | z.infer<typeof UserUncheckedUpdateInputSchema> }> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict() as z.ZodType<Omit<Prisma.UserUpdateArgs, "data"> & { data: z.infer<typeof UserUpdateInputSchema> | z.infer<typeof UserUncheckedUpdateInputSchema> }>;

export const UserUpdateManyArgsSchema: z.ZodType<Omit<Prisma.UserUpdateManyArgs, "data"> & { data: z.infer<typeof UserUpdateManyMutationInputSchema> | z.infer<typeof UserUncheckedUpdateManyInputSchema> }> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
}).strict() as z.ZodType<Omit<Prisma.UserUpdateManyArgs, "data"> & { data: z.infer<typeof UserUpdateManyMutationInputSchema> | z.infer<typeof UserUncheckedUpdateManyInputSchema> }>;

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserDeleteManyArgs>;

export const SessionCreateArgsSchema: z.ZodType<Omit<Prisma.SessionCreateArgs, "data"> & { data: z.infer<typeof SessionCreateInputSchema> | z.infer<typeof SessionUncheckedCreateInputSchema> }> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  data: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Omit<Prisma.SessionCreateArgs, "data"> & { data: z.infer<typeof SessionCreateInputSchema> | z.infer<typeof SessionUncheckedCreateInputSchema> }>;

export const SessionUpsertArgsSchema: z.ZodType<Omit<Prisma.SessionUpsertArgs, "create" | "update"> & { create: z.infer<typeof SessionCreateInputSchema> | z.infer<typeof SessionUncheckedCreateInputSchema>, update: z.infer<typeof SessionUpdateInputSchema> | z.infer<typeof SessionUncheckedUpdateInputSchema> }> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
  create: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
  update: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Omit<Prisma.SessionUpsertArgs, "create" | "update"> & { create: z.infer<typeof SessionCreateInputSchema> | z.infer<typeof SessionUncheckedCreateInputSchema>, update: z.infer<typeof SessionUpdateInputSchema> | z.infer<typeof SessionUncheckedUpdateInputSchema> }>;

export const SessionCreateManyArgsSchema: z.ZodType<Omit<Prisma.SessionCreateManyArgs, "data"> & { data: z.infer<typeof SessionCreateManyInputSchema> | z.infer<typeof SessionCreateManyInputSchema>[] }> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Omit<Prisma.SessionCreateManyArgs, "data"> & { data: z.infer<typeof SessionCreateManyInputSchema> | z.infer<typeof SessionCreateManyInputSchema>[] }>;

export const SessionDeleteArgsSchema: z.ZodType<Prisma.SessionDeleteArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.SessionDeleteArgs>;

export const SessionUpdateArgsSchema: z.ZodType<Omit<Prisma.SessionUpdateArgs, "data"> & { data: z.infer<typeof SessionUpdateInputSchema> | z.infer<typeof SessionUncheckedUpdateInputSchema> }> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  data: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
  where: SessionWhereUniqueInputSchema,
}).strict() as z.ZodType<Omit<Prisma.SessionUpdateArgs, "data"> & { data: z.infer<typeof SessionUpdateInputSchema> | z.infer<typeof SessionUncheckedUpdateInputSchema> }>;

export const SessionUpdateManyArgsSchema: z.ZodType<Omit<Prisma.SessionUpdateManyArgs, "data"> & { data: z.infer<typeof SessionUpdateManyMutationInputSchema> | z.infer<typeof SessionUncheckedUpdateManyInputSchema> }> = z.object({
  data: z.union([ SessionUpdateManyMutationInputSchema,SessionUncheckedUpdateManyInputSchema ]),
  where: SessionWhereInputSchema.optional(),
}).strict() as z.ZodType<Omit<Prisma.SessionUpdateManyArgs, "data"> & { data: z.infer<typeof SessionUpdateManyMutationInputSchema> | z.infer<typeof SessionUncheckedUpdateManyInputSchema> }>;

export const SessionDeleteManyArgsSchema: z.ZodType<Prisma.SessionDeleteManyArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.SessionDeleteManyArgs>;

export const ServiceInstanceCreateArgsSchema: z.ZodType<Omit<Prisma.ServiceInstanceCreateArgs, "data"> & { data: z.infer<typeof ServiceInstanceCreateInputSchema> | z.infer<typeof ServiceInstanceUncheckedCreateInputSchema> }> = z.object({
  select: ServiceInstanceSelectSchema.optional(),
  include: ServiceInstanceIncludeSchema.optional(),
  data: z.union([ ServiceInstanceCreateInputSchema,ServiceInstanceUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceCreateArgs, "data"> & { data: z.infer<typeof ServiceInstanceCreateInputSchema> | z.infer<typeof ServiceInstanceUncheckedCreateInputSchema> }>;

export const ServiceInstanceUpsertArgsSchema: z.ZodType<Omit<Prisma.ServiceInstanceUpsertArgs, "create" | "update"> & { create: z.infer<typeof ServiceInstanceCreateInputSchema> | z.infer<typeof ServiceInstanceUncheckedCreateInputSchema>, update: z.infer<typeof ServiceInstanceUpdateInputSchema> | z.infer<typeof ServiceInstanceUncheckedUpdateInputSchema> }> = z.object({
  select: ServiceInstanceSelectSchema.optional(),
  include: ServiceInstanceIncludeSchema.optional(),
  where: ServiceInstanceWhereUniqueInputSchema,
  create: z.union([ ServiceInstanceCreateInputSchema,ServiceInstanceUncheckedCreateInputSchema ]),
  update: z.union([ ServiceInstanceUpdateInputSchema,ServiceInstanceUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUpsertArgs, "create" | "update"> & { create: z.infer<typeof ServiceInstanceCreateInputSchema> | z.infer<typeof ServiceInstanceUncheckedCreateInputSchema>, update: z.infer<typeof ServiceInstanceUpdateInputSchema> | z.infer<typeof ServiceInstanceUncheckedUpdateInputSchema> }>;

export const ServiceInstanceCreateManyArgsSchema: z.ZodType<Omit<Prisma.ServiceInstanceCreateManyArgs, "data"> & { data: z.infer<typeof ServiceInstanceCreateManyInputSchema> | z.infer<typeof ServiceInstanceCreateManyInputSchema>[] }> = z.object({
  data: z.union([ ServiceInstanceCreateManyInputSchema,ServiceInstanceCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceCreateManyArgs, "data"> & { data: z.infer<typeof ServiceInstanceCreateManyInputSchema> | z.infer<typeof ServiceInstanceCreateManyInputSchema>[] }>;

export const ServiceInstanceDeleteArgsSchema: z.ZodType<Prisma.ServiceInstanceDeleteArgs> = z.object({
  select: ServiceInstanceSelectSchema.optional(),
  include: ServiceInstanceIncludeSchema.optional(),
  where: ServiceInstanceWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.ServiceInstanceDeleteArgs>;

export const ServiceInstanceUpdateArgsSchema: z.ZodType<Omit<Prisma.ServiceInstanceUpdateArgs, "data"> & { data: z.infer<typeof ServiceInstanceUpdateInputSchema> | z.infer<typeof ServiceInstanceUncheckedUpdateInputSchema> }> = z.object({
  select: ServiceInstanceSelectSchema.optional(),
  include: ServiceInstanceIncludeSchema.optional(),
  data: z.union([ ServiceInstanceUpdateInputSchema,ServiceInstanceUncheckedUpdateInputSchema ]),
  where: ServiceInstanceWhereUniqueInputSchema,
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUpdateArgs, "data"> & { data: z.infer<typeof ServiceInstanceUpdateInputSchema> | z.infer<typeof ServiceInstanceUncheckedUpdateInputSchema> }>;

export const ServiceInstanceUpdateManyArgsSchema: z.ZodType<Omit<Prisma.ServiceInstanceUpdateManyArgs, "data"> & { data: z.infer<typeof ServiceInstanceUpdateManyMutationInputSchema> | z.infer<typeof ServiceInstanceUncheckedUpdateManyInputSchema> }> = z.object({
  data: z.union([ ServiceInstanceUpdateManyMutationInputSchema,ServiceInstanceUncheckedUpdateManyInputSchema ]),
  where: ServiceInstanceWhereInputSchema.optional(),
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUpdateManyArgs, "data"> & { data: z.infer<typeof ServiceInstanceUpdateManyMutationInputSchema> | z.infer<typeof ServiceInstanceUncheckedUpdateManyInputSchema> }>;

export const ServiceInstanceDeleteManyArgsSchema: z.ZodType<Prisma.ServiceInstanceDeleteManyArgs> = z.object({
  where: ServiceInstanceWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceDeleteManyArgs>;

export const UserInstanceTokenCreateArgsSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateArgs, "data"> & { data: z.infer<typeof UserInstanceTokenCreateInputSchema> | z.infer<typeof UserInstanceTokenUncheckedCreateInputSchema> }> = z.object({
  select: UserInstanceTokenSelectSchema.optional(),
  include: UserInstanceTokenIncludeSchema.optional(),
  data: z.union([ UserInstanceTokenCreateInputSchema,UserInstanceTokenUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateArgs, "data"> & { data: z.infer<typeof UserInstanceTokenCreateInputSchema> | z.infer<typeof UserInstanceTokenUncheckedCreateInputSchema> }>;

export const UserInstanceTokenUpsertArgsSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpsertArgs, "create" | "update"> & { create: z.infer<typeof UserInstanceTokenCreateInputSchema> | z.infer<typeof UserInstanceTokenUncheckedCreateInputSchema>, update: z.infer<typeof UserInstanceTokenUpdateInputSchema> | z.infer<typeof UserInstanceTokenUncheckedUpdateInputSchema> }> = z.object({
  select: UserInstanceTokenSelectSchema.optional(),
  include: UserInstanceTokenIncludeSchema.optional(),
  where: UserInstanceTokenWhereUniqueInputSchema,
  create: z.union([ UserInstanceTokenCreateInputSchema,UserInstanceTokenUncheckedCreateInputSchema ]),
  update: z.union([ UserInstanceTokenUpdateInputSchema,UserInstanceTokenUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpsertArgs, "create" | "update"> & { create: z.infer<typeof UserInstanceTokenCreateInputSchema> | z.infer<typeof UserInstanceTokenUncheckedCreateInputSchema>, update: z.infer<typeof UserInstanceTokenUpdateInputSchema> | z.infer<typeof UserInstanceTokenUncheckedUpdateInputSchema> }>;

export const UserInstanceTokenCreateManyArgsSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyArgs, "data"> & { data: z.infer<typeof UserInstanceTokenCreateManyInputSchema> | z.infer<typeof UserInstanceTokenCreateManyInputSchema>[] }> = z.object({
  data: z.union([ UserInstanceTokenCreateManyInputSchema,UserInstanceTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyArgs, "data"> & { data: z.infer<typeof UserInstanceTokenCreateManyInputSchema> | z.infer<typeof UserInstanceTokenCreateManyInputSchema>[] }>;

export const UserInstanceTokenDeleteArgsSchema: z.ZodType<Prisma.UserInstanceTokenDeleteArgs> = z.object({
  select: UserInstanceTokenSelectSchema.optional(),
  include: UserInstanceTokenIncludeSchema.optional(),
  where: UserInstanceTokenWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserInstanceTokenDeleteArgs>;

export const UserInstanceTokenUpdateArgsSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpdateArgs, "data"> & { data: z.infer<typeof UserInstanceTokenUpdateInputSchema> | z.infer<typeof UserInstanceTokenUncheckedUpdateInputSchema> }> = z.object({
  select: UserInstanceTokenSelectSchema.optional(),
  include: UserInstanceTokenIncludeSchema.optional(),
  data: z.union([ UserInstanceTokenUpdateInputSchema,UserInstanceTokenUncheckedUpdateInputSchema ]),
  where: UserInstanceTokenWhereUniqueInputSchema,
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpdateArgs, "data"> & { data: z.infer<typeof UserInstanceTokenUpdateInputSchema> | z.infer<typeof UserInstanceTokenUncheckedUpdateInputSchema> }>;

export const UserInstanceTokenUpdateManyArgsSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpdateManyArgs, "data"> & { data: z.infer<typeof UserInstanceTokenUpdateManyMutationInputSchema> | z.infer<typeof UserInstanceTokenUncheckedUpdateManyInputSchema> }> = z.object({
  data: z.union([ UserInstanceTokenUpdateManyMutationInputSchema,UserInstanceTokenUncheckedUpdateManyInputSchema ]),
  where: UserInstanceTokenWhereInputSchema.optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpdateManyArgs, "data"> & { data: z.infer<typeof UserInstanceTokenUpdateManyMutationInputSchema> | z.infer<typeof UserInstanceTokenUncheckedUpdateManyInputSchema> }>;

export const UserInstanceTokenDeleteManyArgsSchema: z.ZodType<Prisma.UserInstanceTokenDeleteManyArgs> = z.object({
  where: UserInstanceTokenWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenDeleteManyArgs>;

export const UserEventLogCreateArgsSchema: z.ZodType<Prisma.UserEventLogCreateArgs> = z.object({
  select: UserEventLogSelectSchema.optional(),
  include: UserEventLogIncludeSchema.optional(),
  data: z.union([ UserEventLogCreateInputSchema,UserEventLogUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Prisma.UserEventLogCreateArgs>;

export const UserEventLogUpsertArgsSchema: z.ZodType<Prisma.UserEventLogUpsertArgs> = z.object({
  select: UserEventLogSelectSchema.optional(),
  include: UserEventLogIncludeSchema.optional(),
  where: UserEventLogWhereUniqueInputSchema,
  create: z.union([ UserEventLogCreateInputSchema,UserEventLogUncheckedCreateInputSchema ]),
  update: z.union([ UserEventLogUpdateInputSchema,UserEventLogUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.UserEventLogUpsertArgs>;

export const UserEventLogCreateManyArgsSchema: z.ZodType<Prisma.UserEventLogCreateManyArgs> = z.object({
  data: z.union([ UserEventLogCreateManyInputSchema,UserEventLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.UserEventLogCreateManyArgs>;

export const UserEventLogDeleteArgsSchema: z.ZodType<Prisma.UserEventLogDeleteArgs> = z.object({
  select: UserEventLogSelectSchema.optional(),
  include: UserEventLogIncludeSchema.optional(),
  where: UserEventLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserEventLogDeleteArgs>;

export const UserEventLogUpdateArgsSchema: z.ZodType<Prisma.UserEventLogUpdateArgs> = z.object({
  select: UserEventLogSelectSchema.optional(),
  include: UserEventLogIncludeSchema.optional(),
  data: z.union([ UserEventLogUpdateInputSchema,UserEventLogUncheckedUpdateInputSchema ]),
  where: UserEventLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserEventLogUpdateArgs>;

export const UserEventLogUpdateManyArgsSchema: z.ZodType<Prisma.UserEventLogUpdateManyArgs> = z.object({
  data: z.union([ UserEventLogUpdateManyMutationInputSchema,UserEventLogUncheckedUpdateManyInputSchema ]),
  where: UserEventLogWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserEventLogUpdateManyArgs>;

export const UserEventLogDeleteManyArgsSchema: z.ZodType<Prisma.UserEventLogDeleteManyArgs> = z.object({
  where: UserEventLogWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserEventLogDeleteManyArgs>;

export const UserResourceUsageLogCreateArgsSchema: z.ZodType<Prisma.UserResourceUsageLogCreateArgs> = z.object({
  select: UserResourceUsageLogSelectSchema.optional(),
  include: UserResourceUsageLogIncludeSchema.optional(),
  data: z.union([ UserResourceUsageLogCreateInputSchema,UserResourceUsageLogUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateArgs>;

export const UserResourceUsageLogUpsertArgsSchema: z.ZodType<Prisma.UserResourceUsageLogUpsertArgs> = z.object({
  select: UserResourceUsageLogSelectSchema.optional(),
  include: UserResourceUsageLogIncludeSchema.optional(),
  where: UserResourceUsageLogWhereUniqueInputSchema,
  create: z.union([ UserResourceUsageLogCreateInputSchema,UserResourceUsageLogUncheckedCreateInputSchema ]),
  update: z.union([ UserResourceUsageLogUpdateInputSchema,UserResourceUsageLogUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpsertArgs>;

export const UserResourceUsageLogCreateManyArgsSchema: z.ZodType<Prisma.UserResourceUsageLogCreateManyArgs> = z.object({
  data: z.union([ UserResourceUsageLogCreateManyInputSchema,UserResourceUsageLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogCreateManyArgs>;

export const UserResourceUsageLogDeleteArgsSchema: z.ZodType<Prisma.UserResourceUsageLogDeleteArgs> = z.object({
  select: UserResourceUsageLogSelectSchema.optional(),
  include: UserResourceUsageLogIncludeSchema.optional(),
  where: UserResourceUsageLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserResourceUsageLogDeleteArgs>;

export const UserResourceUsageLogUpdateArgsSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateArgs> = z.object({
  select: UserResourceUsageLogSelectSchema.optional(),
  include: UserResourceUsageLogIncludeSchema.optional(),
  data: z.union([ UserResourceUsageLogUpdateInputSchema,UserResourceUsageLogUncheckedUpdateInputSchema ]),
  where: UserResourceUsageLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateArgs>;

export const UserResourceUsageLogUpdateManyArgsSchema: z.ZodType<Prisma.UserResourceUsageLogUpdateManyArgs> = z.object({
  data: z.union([ UserResourceUsageLogUpdateManyMutationInputSchema,UserResourceUsageLogUncheckedUpdateManyInputSchema ]),
  where: UserResourceUsageLogWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogUpdateManyArgs>;

export const UserResourceUsageLogDeleteManyArgsSchema: z.ZodType<Prisma.UserResourceUsageLogDeleteManyArgs> = z.object({
  where: UserResourceUsageLogWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserResourceUsageLogDeleteManyArgs>;