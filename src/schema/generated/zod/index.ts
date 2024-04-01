import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ServiceTypeSchema, ResourceTypeSchema, DurationWindowSchema, ServiceInstanceAttributesSchema, EventTypeSchema, EventResultTypeSchema, ResourceEventTypeSchema } from '@/schema/json.schema'

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','username','email','emailVerified','role','image','comment','validUntil','isActive','createdAt','updatedAt','hashedPassword']);

export const SessionScalarFieldEnumSchema = z.enum(['id','userId','expiresAt','currentIp','createdAt']);

export const ServiceInstanceScalarFieldEnumSchema = z.enum(['id','type','name','description','url','createdAt','updatedAt']);

export const UserInstanceTokenScalarFieldEnumSchema = z.enum(['id','userId','instanceId','token','validUntil','isActive','createdAt','updatedAt']);

export const UserSystemLogScalarFieldEnumSchema = z.enum(['id','userId','type','detail','resultType','timestamp']);

export const UserResourceEventLogScalarFieldEnumSchema = z.enum(['id','userId','instanceId','resourceType','type','unit','amount','timestamp']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const UserRoleSchema = z.enum(['USER','ADMIN']);

export type UserRoleType = `${z.infer<typeof UserRoleSchema>}`

export const ResourceUnitSchema = z.enum(['COUNT','TOKEN','CHARACTER']);

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
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().nullable(),
  emailVerified: z.boolean().nullable(),
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
  logs: UserSystemLogWithRelations[];
  UserResourceEventLog: UserResourceEventLogWithRelations[];
  UserInstanceToken: UserInstanceTokenWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(z.object({
  sessions: z.lazy(() => SessionWithRelationsSchema).array(),
  logs: z.lazy(() => UserSystemLogWithRelationsSchema).array(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogWithRelationsSchema).array(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenWithRelationsSchema).array(),
}))

// USER OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserOptionalDefaultsRelations = {
  sessions: SessionOptionalDefaultsWithRelations[];
  logs: UserSystemLogOptionalDefaultsWithRelations[];
  UserResourceEventLog: UserResourceEventLogOptionalDefaultsWithRelations[];
  UserInstanceToken: UserInstanceTokenOptionalDefaultsWithRelations[];
};

export type UserOptionalDefaultsWithRelations = z.infer<typeof UserOptionalDefaultsSchema> & UserOptionalDefaultsRelations

export const UserOptionalDefaultsWithRelationsSchema: z.ZodType<UserOptionalDefaultsWithRelations> = UserOptionalDefaultsSchema.merge(z.object({
  sessions: z.lazy(() => SessionOptionalDefaultsWithRelationsSchema).array(),
  logs: z.lazy(() => UserSystemLogOptionalDefaultsWithRelationsSchema).array(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogOptionalDefaultsWithRelationsSchema).array(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenOptionalDefaultsWithRelationsSchema).array(),
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
  UserResourceEventLog: UserResourceEventLogWithRelations[];
  UserInstanceToken: UserInstanceTokenWithRelations[];
};

export type ServiceInstanceWithRelations = z.infer<typeof ServiceInstanceSchema> & ServiceInstanceRelations

export const ServiceInstanceWithRelationsSchema: z.ZodType<ServiceInstanceWithRelations> = ServiceInstanceSchema.merge(z.object({
  UserResourceEventLog: z.lazy(() => UserResourceEventLogWithRelationsSchema).array(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenWithRelationsSchema).array(),
}))

// SERVICE INSTANCE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type ServiceInstanceOptionalDefaultsRelations = {
  UserResourceEventLog: UserResourceEventLogOptionalDefaultsWithRelations[];
  UserInstanceToken: UserInstanceTokenOptionalDefaultsWithRelations[];
};

export type ServiceInstanceOptionalDefaultsWithRelations = z.infer<typeof ServiceInstanceOptionalDefaultsSchema> & ServiceInstanceOptionalDefaultsRelations

export const ServiceInstanceOptionalDefaultsWithRelationsSchema: z.ZodType<ServiceInstanceOptionalDefaultsWithRelations> = ServiceInstanceOptionalDefaultsSchema.merge(z.object({
  UserResourceEventLog: z.lazy(() => UserResourceEventLogOptionalDefaultsWithRelationsSchema).array(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// USER INSTANCE TOKEN SCHEMA
/////////////////////////////////////////

export const UserInstanceTokenSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  instanceId: z.string(),
  token: z.string(),
  validUntil: z.coerce.date(),
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
// USER SYSTEM LOG SCHEMA
/////////////////////////////////////////

export const UserSystemLogSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().nullable(),
  /**
   * [EventType]
   */
  type: z.lazy(() => EventTypeSchema),
  detail: z.string().max(1000).nullable(),
  /**
   * [EventResultType]
   */
  resultType: z.lazy(() => EventResultTypeSchema),
  timestamp: z.coerce.date(),
})

export type UserSystemLog = z.infer<typeof UserSystemLogSchema>

// USER SYSTEM LOG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserSystemLogOptionalDefaultsSchema = UserSystemLogSchema.merge(z.object({
  id: z.string().cuid().optional(),
  timestamp: z.coerce.date().optional(),
}))

export type UserSystemLogOptionalDefaults = z.infer<typeof UserSystemLogOptionalDefaultsSchema>

// USER SYSTEM LOG RELATION SCHEMA
//------------------------------------------------------

export type UserSystemLogRelations = {
  user?: UserWithRelations | null;
};

export type UserSystemLogWithRelations = z.infer<typeof UserSystemLogSchema> & UserSystemLogRelations

export const UserSystemLogWithRelationsSchema: z.ZodType<UserSystemLogWithRelations> = UserSystemLogSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema).nullable(),
}))

// USER SYSTEM LOG OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserSystemLogOptionalDefaultsRelations = {
  user?: UserOptionalDefaultsWithRelations | null;
};

export type UserSystemLogOptionalDefaultsWithRelations = z.infer<typeof UserSystemLogOptionalDefaultsSchema> & UserSystemLogOptionalDefaultsRelations

export const UserSystemLogOptionalDefaultsWithRelationsSchema: z.ZodType<UserSystemLogOptionalDefaultsWithRelations> = UserSystemLogOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema).nullable(),
}))

/////////////////////////////////////////
// USER RESOURCE EVENT LOG SCHEMA
/////////////////////////////////////////

export const UserResourceEventLogSchema = z.object({
  unit: ResourceUnitSchema,
  id: z.string().cuid(),
  userId: z.string().nullable(),
  instanceId: z.string().nullable(),
  /**
   * [ResourceType]
   */
  resourceType: z.lazy(() => ResourceTypeSchema),
  /**
   * [ResourceEventType]
   */
  type: z.lazy(() => ResourceEventTypeSchema),
  amount: z.number().int(),
  timestamp: z.coerce.date(),
})

export type UserResourceEventLog = z.infer<typeof UserResourceEventLogSchema>

// USER RESOURCE EVENT LOG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserResourceEventLogOptionalDefaultsSchema = UserResourceEventLogSchema.merge(z.object({
  id: z.string().cuid().optional(),
  timestamp: z.coerce.date().optional(),
}))

export type UserResourceEventLogOptionalDefaults = z.infer<typeof UserResourceEventLogOptionalDefaultsSchema>

// USER RESOURCE EVENT LOG RELATION SCHEMA
//------------------------------------------------------

export type UserResourceEventLogRelations = {
  user?: UserWithRelations | null;
  instance?: ServiceInstanceWithRelations | null;
};

export type UserResourceEventLogWithRelations = z.infer<typeof UserResourceEventLogSchema> & UserResourceEventLogRelations

export const UserResourceEventLogWithRelationsSchema: z.ZodType<UserResourceEventLogWithRelations> = UserResourceEventLogSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema).nullable(),
  instance: z.lazy(() => ServiceInstanceWithRelationsSchema).nullable(),
}))

// USER RESOURCE EVENT LOG OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserResourceEventLogOptionalDefaultsRelations = {
  user?: UserOptionalDefaultsWithRelations | null;
  instance?: ServiceInstanceOptionalDefaultsWithRelations | null;
};

export type UserResourceEventLogOptionalDefaultsWithRelations = z.infer<typeof UserResourceEventLogOptionalDefaultsSchema> & UserResourceEventLogOptionalDefaultsRelations

export const UserResourceEventLogOptionalDefaultsWithRelationsSchema: z.ZodType<UserResourceEventLogOptionalDefaultsWithRelations> = UserResourceEventLogOptionalDefaultsSchema.merge(z.object({
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
  logs: z.union([z.boolean(),z.lazy(() => UserSystemLogFindManyArgsSchema)]).optional(),
  UserResourceEventLog: z.union([z.boolean(),z.lazy(() => UserResourceEventLogFindManyArgsSchema)]).optional(),
  UserInstanceToken: z.union([z.boolean(),z.lazy(() => UserInstanceTokenFindManyArgsSchema)]).optional(),
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
  logs: z.boolean().optional(),
  UserResourceEventLog: z.boolean().optional(),
  UserInstanceToken: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  username: z.boolean().optional(),
  email: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  role: z.boolean().optional(),
  image: z.boolean().optional(),
  comment: z.boolean().optional(),
  validUntil: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  hashedPassword: z.boolean().optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  logs: z.union([z.boolean(),z.lazy(() => UserSystemLogFindManyArgsSchema)]).optional(),
  UserResourceEventLog: z.union([z.boolean(),z.lazy(() => UserResourceEventLogFindManyArgsSchema)]).optional(),
  UserInstanceToken: z.union([z.boolean(),z.lazy(() => UserInstanceTokenFindManyArgsSchema)]).optional(),
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
  UserResourceEventLog: z.union([z.boolean(),z.lazy(() => UserResourceEventLogFindManyArgsSchema)]).optional(),
  UserInstanceToken: z.union([z.boolean(),z.lazy(() => UserInstanceTokenFindManyArgsSchema)]).optional(),
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
  UserResourceEventLog: z.boolean().optional(),
  UserInstanceToken: z.boolean().optional(),
}).strict();

export const ServiceInstanceSelectSchema: z.ZodType<Prisma.ServiceInstanceSelect> = z.object({
  id: z.boolean().optional(),
  type: z.boolean().optional(),
  name: z.boolean().optional(),
  description: z.boolean().optional(),
  url: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  UserResourceEventLog: z.union([z.boolean(),z.lazy(() => UserResourceEventLogFindManyArgsSchema)]).optional(),
  UserInstanceToken: z.union([z.boolean(),z.lazy(() => UserInstanceTokenFindManyArgsSchema)]).optional(),
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
  validUntil: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => ServiceInstanceArgsSchema)]).optional(),
}).strict()

// USER SYSTEM LOG
//------------------------------------------------------

export const UserSystemLogIncludeSchema: z.ZodType<Prisma.UserSystemLogInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserSystemLogArgsSchema: z.ZodType<Prisma.UserSystemLogDefaultArgs> = z.object({
  select: z.lazy(() => UserSystemLogSelectSchema).optional(),
  include: z.lazy(() => UserSystemLogIncludeSchema).optional(),
}).strict();

export const UserSystemLogSelectSchema: z.ZodType<Prisma.UserSystemLogSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  type: z.boolean().optional(),
  detail: z.boolean().optional(),
  resultType: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER RESOURCE EVENT LOG
//------------------------------------------------------

export const UserResourceEventLogIncludeSchema: z.ZodType<Prisma.UserResourceEventLogInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => ServiceInstanceArgsSchema)]).optional(),
}).strict()

export const UserResourceEventLogArgsSchema: z.ZodType<Prisma.UserResourceEventLogDefaultArgs> = z.object({
  select: z.lazy(() => UserResourceEventLogSelectSchema).optional(),
  include: z.lazy(() => UserResourceEventLogIncludeSchema).optional(),
}).strict();

export const UserResourceEventLogSelectSchema: z.ZodType<Prisma.UserResourceEventLogSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  instanceId: z.boolean().optional(),
  resourceType: z.boolean().optional(),
  type: z.boolean().optional(),
  unit: z.boolean().optional(),
  amount: z.boolean().optional(),
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
  emailVerified: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema),z.lazy(() => UserRoleSchema) ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  comment: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  validUntil: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  hashedPassword: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  logs: z.lazy(() => UserSystemLogListRelationFilterSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogListRelationFilterSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenListRelationFilterSchema).optional()
}).strict() as z.ZodType<Prisma.UserWhereInput>;

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  emailVerified: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  comment: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  validUntil: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedPassword: z.lazy(() => SortOrderSchema).optional(),
  sessions: z.lazy(() => SessionOrderByRelationAggregateInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogOrderByRelationAggregateInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogOrderByRelationAggregateInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenOrderByRelationAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserOrderByWithRelationInput>;

export const UserWhereUniqueInputSchema: z.ZodType<Omit<Prisma.UserWhereUniqueInput, "createdAt" | "updatedAt">> = z.union([
  z.object({
    id: z.string().cuid(),
    username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email()
  }),
  z.object({
    id: z.string().cuid(),
    username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  }),
  z.object({
    id: z.string().cuid(),
    email: z.string().email(),
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
  }),
  z.object({
    username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  }),
  z.object({
    email: z.string().email(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().email().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string().min(1).max(50) ]).optional(),
  emailVerified: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema),z.lazy(() => UserRoleSchema) ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  comment: z.union([ z.lazy(() => StringNullableFilterSchema),z.string().max(500) ]).optional().nullable(),
  validUntil: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  // omitted: createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  // omitted: updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  hashedPassword: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  logs: z.lazy(() => UserSystemLogListRelationFilterSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogListRelationFilterSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenListRelationFilterSchema).optional()
}).strict()) as z.ZodType<Omit<Prisma.UserWhereUniqueInput, "createdAt" | "updatedAt">>;

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  emailVerified: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
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
  emailVerified: z.union([ z.lazy(() => BoolNullableWithAggregatesFilterSchema),z.boolean() ]).optional().nullable(),
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
  UserResourceEventLog: z.lazy(() => UserResourceEventLogListRelationFilterSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenListRelationFilterSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceWhereInput>;

export const ServiceInstanceOrderByWithRelationInputSchema: z.ZodType<Prisma.ServiceInstanceOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  url: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogOrderByRelationAggregateInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenOrderByRelationAggregateInputSchema).optional()
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
  UserResourceEventLog: z.lazy(() => UserResourceEventLogListRelationFilterSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenListRelationFilterSchema).optional()
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
  validUntil: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
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
  validUntil: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  instance: z.lazy(() => ServiceInstanceOrderByWithRelationInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenOrderByWithRelationInput>;

export const UserInstanceTokenWhereUniqueInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenWhereUniqueInput, "createdAt" | "updatedAt">> = z.union([
  z.object({
    id: z.string().cuid(),
    token: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    token: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  token: z.string().optional(),
  AND: z.union([ z.lazy(() => UserInstanceTokenWhereInputSchema),z.lazy(() => UserInstanceTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInstanceTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInstanceTokenWhereInputSchema),z.lazy(() => UserInstanceTokenWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  validUntil: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
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
  validUntil: z.lazy(() => SortOrderSchema).optional(),
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
  validUntil: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenScalarWhereWithAggregatesInput>;

export const UserSystemLogWhereInputSchema: z.ZodType<Prisma.UserSystemLogWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserSystemLogWhereInputSchema),z.lazy(() => UserSystemLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserSystemLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserSystemLogWhereInputSchema),z.lazy(() => UserSystemLogWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  detail: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.UserSystemLogWhereInput>;

export const UserSystemLogOrderByWithRelationInputSchema: z.ZodType<Prisma.UserSystemLogOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  detail: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  resultType: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserSystemLogOrderByWithRelationInput>;

export const UserSystemLogWhereUniqueInputSchema: z.ZodType<Prisma.UserSystemLogWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => UserSystemLogWhereInputSchema),z.lazy(() => UserSystemLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserSystemLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserSystemLogWhereInputSchema),z.lazy(() => UserSystemLogWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.lazy(() => EventTypeSchema) ]).optional(),
  detail: z.union([ z.lazy(() => StringNullableFilterSchema),z.string().max(1000) ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => StringFilterSchema),z.lazy(() => EventResultTypeSchema) ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict()) as z.ZodType<Prisma.UserSystemLogWhereUniqueInput>;

export const UserSystemLogOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserSystemLogOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  detail: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  resultType: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserSystemLogCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserSystemLogMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserSystemLogMinOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserSystemLogOrderByWithAggregationInput>;

export const UserSystemLogScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserSystemLogScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserSystemLogScalarWhereWithAggregatesInputSchema),z.lazy(() => UserSystemLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserSystemLogScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserSystemLogScalarWhereWithAggregatesInputSchema),z.lazy(() => UserSystemLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  detail: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogScalarWhereWithAggregatesInput>;

export const UserResourceEventLogWhereInputSchema: z.ZodType<Prisma.UserResourceEventLogWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserResourceEventLogWhereInputSchema),z.lazy(() => UserResourceEventLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserResourceEventLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserResourceEventLogWhereInputSchema),z.lazy(() => UserResourceEventLogWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  resourceType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  unit: z.union([ z.lazy(() => EnumResourceUnitFilterSchema),z.lazy(() => ResourceUnitSchema) ]).optional(),
  amount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  instance: z.union([ z.lazy(() => ServiceInstanceNullableRelationFilterSchema),z.lazy(() => ServiceInstanceWhereInputSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogWhereInput>;

export const UserResourceEventLogOrderByWithRelationInputSchema: z.ZodType<Prisma.UserResourceEventLogOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  instanceId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  resourceType: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  unit: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  instance: z.lazy(() => ServiceInstanceOrderByWithRelationInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogOrderByWithRelationInput>;

export const UserResourceEventLogWhereUniqueInputSchema: z.ZodType<Prisma.UserResourceEventLogWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => UserResourceEventLogWhereInputSchema),z.lazy(() => UserResourceEventLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserResourceEventLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserResourceEventLogWhereInputSchema),z.lazy(() => UserResourceEventLogWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  resourceType: z.union([ z.lazy(() => StringFilterSchema),z.lazy(() => ResourceTypeSchema) ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.lazy(() => ResourceEventTypeSchema) ]).optional(),
  unit: z.union([ z.lazy(() => EnumResourceUnitFilterSchema),z.lazy(() => ResourceUnitSchema) ]).optional(),
  amount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  instance: z.union([ z.lazy(() => ServiceInstanceNullableRelationFilterSchema),z.lazy(() => ServiceInstanceWhereInputSchema) ]).optional().nullable(),
}).strict()) as z.ZodType<Prisma.UserResourceEventLogWhereUniqueInput>;

export const UserResourceEventLogOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserResourceEventLogOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  instanceId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  resourceType: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  unit: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserResourceEventLogCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserResourceEventLogAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserResourceEventLogMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserResourceEventLogMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserResourceEventLogSumOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogOrderByWithAggregationInput>;

export const UserResourceEventLogScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserResourceEventLogScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserResourceEventLogScalarWhereWithAggregatesInputSchema),z.lazy(() => UserResourceEventLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserResourceEventLogScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserResourceEventLogScalarWhereWithAggregatesInputSchema),z.lazy(() => UserResourceEventLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  resourceType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  unit: z.union([ z.lazy(() => EnumResourceUnitWithAggregatesFilterSchema),z.lazy(() => ResourceUnitSchema) ]).optional(),
  amount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogScalarWhereWithAggregatesInput>;

export const UserCreateInputSchema: z.ZodType<Omit<Prisma.UserCreateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogCreateNestedManyWithoutUserInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogCreateNestedManyWithoutUserInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserCreateInput, "createdAt" | "updatedAt">>;

export const UserUncheckedCreateInputSchema: z.ZodType<Omit<Prisma.UserUncheckedCreateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedCreateInput, "createdAt" | "updatedAt">>;

export const UserUpdateInputSchema: z.ZodType<Omit<Prisma.UserUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogUpdateManyWithoutUserNestedInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUpdateInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateInput, "createdAt" | "updatedAt">>;

export const UserCreateManyInputSchema: z.ZodType<Omit<Prisma.UserCreateManyInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
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
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
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
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
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
  UserResourceEventLog: z.lazy(() => UserResourceEventLogCreateNestedManyWithoutInstanceInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceCreateInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedCreateInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedCreateNestedManyWithoutInstanceInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUpdateInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUpdateManyWithoutInstanceNestedInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUpdateInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedUpdateInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
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
  validUntil: z.coerce.date(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUserInstanceTokenInputSchema),
  instance: z.lazy(() => ServiceInstanceCreateNestedOneWithoutUserInstanceTokenInputSchema)
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedCreateInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedCreateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  instanceId: z.string(),
  token: z.string(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedCreateInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUpdateInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutUserInstanceTokenNestedInputSchema).optional(),
  instance: z.lazy(() => ServiceInstanceUpdateOneRequiredWithoutUserInstanceTokenNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpdateInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenCreateManyInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  instanceId: z.string(),
  token: z.string(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUpdateManyMutationInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpdateManyMutationInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpdateManyMutationInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateManyInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyInput, "createdAt" | "updatedAt">>;

export const UserSystemLogCreateInputSchema: z.ZodType<Prisma.UserSystemLogCreateInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => EventTypeSchema),
  detail: z.string().max(1000).optional().nullable(),
  resultType: z.lazy(() => EventResultTypeSchema),
  timestamp: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutLogsInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserSystemLogCreateInput>;

export const UserSystemLogUncheckedCreateInputSchema: z.ZodType<Prisma.UserSystemLogUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  type: z.lazy(() => EventTypeSchema),
  detail: z.string().max(1000).optional().nullable(),
  resultType: z.lazy(() => EventResultTypeSchema),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserSystemLogUncheckedCreateInput>;

export const UserSystemLogUpdateInputSchema: z.ZodType<Prisma.UserSystemLogUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  detail: z.union([ z.string().max(1000),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutLogsNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserSystemLogUpdateInput>;

export const UserSystemLogUncheckedUpdateInputSchema: z.ZodType<Prisma.UserSystemLogUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  detail: z.union([ z.string().max(1000),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogUncheckedUpdateInput>;

export const UserSystemLogCreateManyInputSchema: z.ZodType<Prisma.UserSystemLogCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  type: z.lazy(() => EventTypeSchema),
  detail: z.string().max(1000).optional().nullable(),
  resultType: z.lazy(() => EventResultTypeSchema),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserSystemLogCreateManyInput>;

export const UserSystemLogUpdateManyMutationInputSchema: z.ZodType<Prisma.UserSystemLogUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  detail: z.union([ z.string().max(1000),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogUpdateManyMutationInput>;

export const UserSystemLogUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserSystemLogUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  detail: z.union([ z.string().max(1000),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogUncheckedUpdateManyInput>;

export const UserResourceEventLogCreateInputSchema: z.ZodType<Prisma.UserResourceEventLogCreateInput> = z.object({
  id: z.string().cuid().optional(),
  resourceType: z.lazy(() => ResourceTypeSchema),
  type: z.lazy(() => ResourceEventTypeSchema),
  unit: z.lazy(() => ResourceUnitSchema),
  amount: z.number().int(),
  timestamp: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUserResourceEventLogInputSchema).optional(),
  instance: z.lazy(() => ServiceInstanceCreateNestedOneWithoutUserResourceEventLogInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateInput>;

export const UserResourceEventLogUncheckedCreateInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  instanceId: z.string().optional().nullable(),
  resourceType: z.lazy(() => ResourceTypeSchema),
  type: z.lazy(() => ResourceEventTypeSchema),
  unit: z.lazy(() => ResourceUnitSchema),
  amount: z.number().int(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedCreateInput>;

export const UserResourceEventLogUpdateInputSchema: z.ZodType<Prisma.UserResourceEventLogUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resourceType: z.union([ z.lazy(() => ResourceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ResourceEventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => EnumResourceUnitFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutUserResourceEventLogNestedInputSchema).optional(),
  instance: z.lazy(() => ServiceInstanceUpdateOneWithoutUserResourceEventLogNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateInput>;

export const UserResourceEventLogUncheckedUpdateInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resourceType: z.union([ z.lazy(() => ResourceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ResourceEventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => EnumResourceUnitFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateInput>;

export const UserResourceEventLogCreateManyInputSchema: z.ZodType<Prisma.UserResourceEventLogCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  instanceId: z.string().optional().nullable(),
  resourceType: z.lazy(() => ResourceTypeSchema),
  type: z.lazy(() => ResourceEventTypeSchema),
  unit: z.lazy(() => ResourceUnitSchema),
  amount: z.number().int(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateManyInput>;

export const UserResourceEventLogUpdateManyMutationInputSchema: z.ZodType<Prisma.UserResourceEventLogUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resourceType: z.union([ z.lazy(() => ResourceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ResourceEventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => EnumResourceUnitFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateManyMutationInput>;

export const UserResourceEventLogUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resourceType: z.union([ z.lazy(() => ResourceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ResourceEventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => EnumResourceUnitFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateManyInput>;

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

export const BoolNullableFilterSchema: z.ZodType<Prisma.BoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.BoolNullableFilter>;

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

export const UserSystemLogListRelationFilterSchema: z.ZodType<Prisma.UserSystemLogListRelationFilter> = z.object({
  every: z.lazy(() => UserSystemLogWhereInputSchema).optional(),
  some: z.lazy(() => UserSystemLogWhereInputSchema).optional(),
  none: z.lazy(() => UserSystemLogWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserSystemLogListRelationFilter>;

export const UserResourceEventLogListRelationFilterSchema: z.ZodType<Prisma.UserResourceEventLogListRelationFilter> = z.object({
  every: z.lazy(() => UserResourceEventLogWhereInputSchema).optional(),
  some: z.lazy(() => UserResourceEventLogWhereInputSchema).optional(),
  none: z.lazy(() => UserResourceEventLogWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogListRelationFilter>;

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

export const UserSystemLogOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserSystemLogOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserSystemLogOrderByRelationAggregateInput>;

export const UserResourceEventLogOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserResourceEventLogOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogOrderByRelationAggregateInput>;

export const UserInstanceTokenOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserInstanceTokenOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenOrderByRelationAggregateInput>;

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
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
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
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
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
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

export const BoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.BoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict() as z.ZodType<Prisma.BoolNullableWithAggregatesFilter>;

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

export const UserInstanceTokenCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserInstanceTokenCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  validUntil: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenCountOrderByAggregateInput>;

export const UserInstanceTokenMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserInstanceTokenMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  validUntil: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenMaxOrderByAggregateInput>;

export const UserInstanceTokenMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserInstanceTokenMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  validUntil: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserInstanceTokenMinOrderByAggregateInput>;

export const UserNullableRelationFilterSchema: z.ZodType<Prisma.UserNullableRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserWhereInputSchema).optional().nullable()
}).strict() as z.ZodType<Prisma.UserNullableRelationFilter>;

export const UserSystemLogCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserSystemLogCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  detail: z.lazy(() => SortOrderSchema).optional(),
  resultType: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserSystemLogCountOrderByAggregateInput>;

export const UserSystemLogMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserSystemLogMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  detail: z.lazy(() => SortOrderSchema).optional(),
  resultType: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserSystemLogMaxOrderByAggregateInput>;

export const UserSystemLogMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserSystemLogMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  detail: z.lazy(() => SortOrderSchema).optional(),
  resultType: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserSystemLogMinOrderByAggregateInput>;

export const EnumResourceUnitFilterSchema: z.ZodType<Prisma.EnumResourceUnitFilter> = z.object({
  equals: z.lazy(() => ResourceUnitSchema).optional(),
  in: z.lazy(() => ResourceUnitSchema).array().optional(),
  notIn: z.lazy(() => ResourceUnitSchema).array().optional(),
  not: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => NestedEnumResourceUnitFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.EnumResourceUnitFilter>;

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.IntFilter>;

export const ServiceInstanceNullableRelationFilterSchema: z.ZodType<Prisma.ServiceInstanceNullableRelationFilter> = z.object({
  is: z.lazy(() => ServiceInstanceWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ServiceInstanceWhereInputSchema).optional().nullable()
}).strict() as z.ZodType<Prisma.ServiceInstanceNullableRelationFilter>;

export const UserResourceEventLogCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserResourceEventLogCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  resourceType: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  unit: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogCountOrderByAggregateInput>;

export const UserResourceEventLogAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserResourceEventLogAvgOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogAvgOrderByAggregateInput>;

export const UserResourceEventLogMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserResourceEventLogMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  resourceType: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  unit: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogMaxOrderByAggregateInput>;

export const UserResourceEventLogMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserResourceEventLogMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  resourceType: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  unit: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogMinOrderByAggregateInput>;

export const UserResourceEventLogSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserResourceEventLogSumOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogSumOrderByAggregateInput>;

export const EnumResourceUnitWithAggregatesFilterSchema: z.ZodType<Prisma.EnumResourceUnitWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ResourceUnitSchema).optional(),
  in: z.lazy(() => ResourceUnitSchema).array().optional(),
  notIn: z.lazy(() => ResourceUnitSchema).array().optional(),
  not: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => NestedEnumResourceUnitWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumResourceUnitFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumResourceUnitFilterSchema).optional()
}).strict() as z.ZodType<Prisma.EnumResourceUnitWithAggregatesFilter>;

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict() as z.ZodType<Prisma.IntWithAggregatesFilter>;

export const SessionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SessionCreateNestedManyWithoutUserInput>;

export const UserSystemLogCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserSystemLogCreateWithoutUserInputSchema),z.lazy(() => UserSystemLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserSystemLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserSystemLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSystemLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserSystemLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSystemLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserSystemLogWhereUniqueInputSchema),z.lazy(() => UserSystemLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogCreateNestedManyWithoutUserInput>;

export const UserResourceEventLogCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceEventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserResourceEventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceEventLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateNestedManyWithoutUserInput>;

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

export const UserSystemLogUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserSystemLogCreateWithoutUserInputSchema),z.lazy(() => UserSystemLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserSystemLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserSystemLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSystemLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserSystemLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSystemLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserSystemLogWhereUniqueInputSchema),z.lazy(() => UserSystemLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogUncheckedCreateNestedManyWithoutUserInput>;

export const UserResourceEventLogUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceEventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserResourceEventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceEventLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedCreateNestedManyWithoutUserInput>;

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

export const NullableBoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableBoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional().nullable()
}).strict() as z.ZodType<Prisma.NullableBoolFieldUpdateOperationsInput>;

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

export const UserSystemLogUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserSystemLogUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserSystemLogCreateWithoutUserInputSchema),z.lazy(() => UserSystemLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserSystemLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserSystemLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSystemLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserSystemLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserSystemLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserSystemLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSystemLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserSystemLogWhereUniqueInputSchema),z.lazy(() => UserSystemLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserSystemLogWhereUniqueInputSchema),z.lazy(() => UserSystemLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserSystemLogWhereUniqueInputSchema),z.lazy(() => UserSystemLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserSystemLogWhereUniqueInputSchema),z.lazy(() => UserSystemLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserSystemLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserSystemLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserSystemLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserSystemLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserSystemLogScalarWhereInputSchema),z.lazy(() => UserSystemLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogUpdateManyWithoutUserNestedInput>;

export const UserResourceEventLogUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserResourceEventLogUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceEventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserResourceEventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserResourceEventLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceEventLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserResourceEventLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserResourceEventLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserResourceEventLogScalarWhereInputSchema),z.lazy(() => UserResourceEventLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateManyWithoutUserNestedInput>;

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

export const UserSystemLogUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserSystemLogUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserSystemLogCreateWithoutUserInputSchema),z.lazy(() => UserSystemLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserSystemLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserSystemLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSystemLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserSystemLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserSystemLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserSystemLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSystemLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserSystemLogWhereUniqueInputSchema),z.lazy(() => UserSystemLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserSystemLogWhereUniqueInputSchema),z.lazy(() => UserSystemLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserSystemLogWhereUniqueInputSchema),z.lazy(() => UserSystemLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserSystemLogWhereUniqueInputSchema),z.lazy(() => UserSystemLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserSystemLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserSystemLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserSystemLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserSystemLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserSystemLogScalarWhereInputSchema),z.lazy(() => UserSystemLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogUncheckedUpdateManyWithoutUserNestedInput>;

export const UserResourceEventLogUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogCreateWithoutUserInputSchema).array(),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceEventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserResourceEventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserResourceEventLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceEventLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserResourceEventLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserResourceEventLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserResourceEventLogScalarWhereInputSchema),z.lazy(() => UserResourceEventLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateManyWithoutUserNestedInput>;

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

export const UserResourceEventLogCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceEventLogCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceEventLogCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateNestedManyWithoutInstanceInput>;

export const UserInstanceTokenCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.UserInstanceTokenCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInstanceTokenCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenCreateNestedManyWithoutInstanceInput>;

export const UserResourceEventLogUncheckedCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceEventLogCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceEventLogCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedCreateNestedManyWithoutInstanceInput>;

export const UserInstanceTokenUncheckedCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.UserInstanceTokenUncheckedCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserInstanceTokenCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInstanceTokenCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserInstanceTokenWhereUniqueInputSchema),z.lazy(() => UserInstanceTokenWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenUncheckedCreateNestedManyWithoutInstanceInput>;

export const UserResourceEventLogUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.UserResourceEventLogUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceEventLogCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserResourceEventLogUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceEventLogCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserResourceEventLogUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserResourceEventLogUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserResourceEventLogScalarWhereInputSchema),z.lazy(() => UserResourceEventLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateManyWithoutInstanceNestedInput>;

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

export const UserResourceEventLogUncheckedUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogCreateWithoutInstanceInputSchema).array(),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserResourceEventLogCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserResourceEventLogUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserResourceEventLogCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),z.lazy(() => UserResourceEventLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserResourceEventLogUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserResourceEventLogUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserResourceEventLogScalarWhereInputSchema),z.lazy(() => UserResourceEventLogScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateManyWithoutInstanceNestedInput>;

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

export const UserCreateNestedOneWithoutUserInstanceTokenInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserInstanceTokenInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserInstanceTokenInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserInstanceTokenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserInstanceTokenInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateNestedOneWithoutUserInstanceTokenInput>;

export const ServiceInstanceCreateNestedOneWithoutUserInstanceTokenInputSchema: z.ZodType<Prisma.ServiceInstanceCreateNestedOneWithoutUserInstanceTokenInput> = z.object({
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserInstanceTokenInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserInstanceTokenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ServiceInstanceCreateOrConnectWithoutUserInstanceTokenInputSchema).optional(),
  connect: z.lazy(() => ServiceInstanceWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceCreateNestedOneWithoutUserInstanceTokenInput>;

export const UserUpdateOneRequiredWithoutUserInstanceTokenNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserInstanceTokenNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserInstanceTokenInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserInstanceTokenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserInstanceTokenInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserInstanceTokenInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserInstanceTokenInputSchema),z.lazy(() => UserUpdateWithoutUserInstanceTokenInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserInstanceTokenInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserInstanceTokenNestedInput>;

export const ServiceInstanceUpdateOneRequiredWithoutUserInstanceTokenNestedInputSchema: z.ZodType<Prisma.ServiceInstanceUpdateOneRequiredWithoutUserInstanceTokenNestedInput> = z.object({
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserInstanceTokenInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserInstanceTokenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ServiceInstanceCreateOrConnectWithoutUserInstanceTokenInputSchema).optional(),
  upsert: z.lazy(() => ServiceInstanceUpsertWithoutUserInstanceTokenInputSchema).optional(),
  connect: z.lazy(() => ServiceInstanceWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ServiceInstanceUpdateToOneWithWhereWithoutUserInstanceTokenInputSchema),z.lazy(() => ServiceInstanceUpdateWithoutUserInstanceTokenInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUserInstanceTokenInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceUpdateOneRequiredWithoutUserInstanceTokenNestedInput>;

export const UserCreateNestedOneWithoutLogsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutLogsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutLogsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateNestedOneWithoutLogsInput>;

export const UserUpdateOneWithoutLogsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutLogsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutLogsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutLogsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutLogsInputSchema),z.lazy(() => UserUpdateWithoutLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutLogsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateOneWithoutLogsNestedInput>;

export const UserCreateNestedOneWithoutUserResourceEventLogInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserResourceEventLogInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserResourceEventLogInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserResourceEventLogInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserResourceEventLogInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateNestedOneWithoutUserResourceEventLogInput>;

export const ServiceInstanceCreateNestedOneWithoutUserResourceEventLogInputSchema: z.ZodType<Prisma.ServiceInstanceCreateNestedOneWithoutUserResourceEventLogInput> = z.object({
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserResourceEventLogInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserResourceEventLogInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ServiceInstanceCreateOrConnectWithoutUserResourceEventLogInputSchema).optional(),
  connect: z.lazy(() => ServiceInstanceWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceCreateNestedOneWithoutUserResourceEventLogInput>;

export const EnumResourceUnitFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumResourceUnitFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ResourceUnitSchema).optional()
}).strict() as z.ZodType<Prisma.EnumResourceUnitFieldUpdateOperationsInput>;

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict() as z.ZodType<Prisma.IntFieldUpdateOperationsInput>;

export const UserUpdateOneWithoutUserResourceEventLogNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutUserResourceEventLogNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserResourceEventLogInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserResourceEventLogInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserResourceEventLogInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserResourceEventLogInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserResourceEventLogInputSchema),z.lazy(() => UserUpdateWithoutUserResourceEventLogInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserResourceEventLogInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateOneWithoutUserResourceEventLogNestedInput>;

export const ServiceInstanceUpdateOneWithoutUserResourceEventLogNestedInputSchema: z.ZodType<Prisma.ServiceInstanceUpdateOneWithoutUserResourceEventLogNestedInput> = z.object({
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserResourceEventLogInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserResourceEventLogInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ServiceInstanceCreateOrConnectWithoutUserResourceEventLogInputSchema).optional(),
  upsert: z.lazy(() => ServiceInstanceUpsertWithoutUserResourceEventLogInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ServiceInstanceWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ServiceInstanceWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ServiceInstanceWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ServiceInstanceUpdateToOneWithWhereWithoutUserResourceEventLogInputSchema),z.lazy(() => ServiceInstanceUpdateWithoutUserResourceEventLogInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUserResourceEventLogInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.ServiceInstanceUpdateOneWithoutUserResourceEventLogNestedInput>;

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

export const NestedBoolNullableFilterSchema: z.ZodType<Prisma.NestedBoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.NestedBoolNullableFilter>;

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

export const NestedBoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedBoolNullableWithAggregatesFilter>;

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

export const NestedEnumResourceUnitFilterSchema: z.ZodType<Prisma.NestedEnumResourceUnitFilter> = z.object({
  equals: z.lazy(() => ResourceUnitSchema).optional(),
  in: z.lazy(() => ResourceUnitSchema).array().optional(),
  notIn: z.lazy(() => ResourceUnitSchema).array().optional(),
  not: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => NestedEnumResourceUnitFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.NestedEnumResourceUnitFilter>;

export const NestedEnumResourceUnitWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumResourceUnitWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ResourceUnitSchema).optional(),
  in: z.lazy(() => ResourceUnitSchema).array().optional(),
  notIn: z.lazy(() => ResourceUnitSchema).array().optional(),
  not: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => NestedEnumResourceUnitWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumResourceUnitFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumResourceUnitFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedEnumResourceUnitWithAggregatesFilter>;

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedIntWithAggregatesFilter>;

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.NestedFloatFilter>;

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

export const UserSystemLogCreateWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => EventTypeSchema),
  detail: z.string().max(1000).optional().nullable(),
  resultType: z.lazy(() => EventResultTypeSchema),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserSystemLogCreateWithoutUserInput>;

export const UserSystemLogUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => EventTypeSchema),
  detail: z.string().max(1000).optional().nullable(),
  resultType: z.lazy(() => EventResultTypeSchema),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserSystemLogUncheckedCreateWithoutUserInput>;

export const UserSystemLogCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserSystemLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserSystemLogCreateWithoutUserInputSchema),z.lazy(() => UserSystemLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserSystemLogCreateOrConnectWithoutUserInput>;

export const UserSystemLogCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserSystemLogCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserSystemLogCreateManyUserInputSchema),z.lazy(() => UserSystemLogCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.UserSystemLogCreateManyUserInputEnvelope>;

export const UserResourceEventLogCreateWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  resourceType: z.lazy(() => ResourceTypeSchema),
  type: z.lazy(() => ResourceEventTypeSchema),
  unit: z.lazy(() => ResourceUnitSchema),
  amount: z.number().int(),
  timestamp: z.coerce.date().optional(),
  instance: z.lazy(() => ServiceInstanceCreateNestedOneWithoutUserResourceEventLogInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateWithoutUserInput>;

export const UserResourceEventLogUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  instanceId: z.string().optional().nullable(),
  resourceType: z.lazy(() => ResourceTypeSchema),
  type: z.lazy(() => ResourceEventTypeSchema),
  unit: z.lazy(() => ResourceUnitSchema),
  amount: z.number().int(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedCreateWithoutUserInput>;

export const UserResourceEventLogCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateOrConnectWithoutUserInput>;

export const UserResourceEventLogCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserResourceEventLogCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserResourceEventLogCreateManyUserInputSchema),z.lazy(() => UserResourceEventLogCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateManyUserInputEnvelope>;

export const UserInstanceTokenCreateWithoutUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateWithoutUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  token: z.string(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  instance: z.lazy(() => ServiceInstanceCreateNestedOneWithoutUserInstanceTokenInputSchema)
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateWithoutUserInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedCreateWithoutUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedCreateWithoutUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  token: z.string(),
  validUntil: z.coerce.date(),
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

export const UserSystemLogUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserSystemLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserSystemLogUpdateWithoutUserInputSchema),z.lazy(() => UserSystemLogUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserSystemLogCreateWithoutUserInputSchema),z.lazy(() => UserSystemLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserSystemLogUpsertWithWhereUniqueWithoutUserInput>;

export const UserSystemLogUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserSystemLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserSystemLogUpdateWithoutUserInputSchema),z.lazy(() => UserSystemLogUncheckedUpdateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserSystemLogUpdateWithWhereUniqueWithoutUserInput>;

export const UserSystemLogUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserSystemLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserSystemLogUpdateManyMutationInputSchema),z.lazy(() => UserSystemLogUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserSystemLogUpdateManyWithWhereWithoutUserInput>;

export const UserSystemLogScalarWhereInputSchema: z.ZodType<Prisma.UserSystemLogScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserSystemLogScalarWhereInputSchema),z.lazy(() => UserSystemLogScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserSystemLogScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserSystemLogScalarWhereInputSchema),z.lazy(() => UserSystemLogScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  detail: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogScalarWhereInput>;

export const UserResourceEventLogUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserResourceEventLogUpdateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpsertWithWhereUniqueWithoutUserInput>;

export const UserResourceEventLogUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserResourceEventLogUpdateWithoutUserInputSchema),z.lazy(() => UserResourceEventLogUncheckedUpdateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateWithWhereUniqueWithoutUserInput>;

export const UserResourceEventLogUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserResourceEventLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserResourceEventLogUpdateManyMutationInputSchema),z.lazy(() => UserResourceEventLogUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateManyWithWhereWithoutUserInput>;

export const UserResourceEventLogScalarWhereInputSchema: z.ZodType<Prisma.UserResourceEventLogScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserResourceEventLogScalarWhereInputSchema),z.lazy(() => UserResourceEventLogScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserResourceEventLogScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserResourceEventLogScalarWhereInputSchema),z.lazy(() => UserResourceEventLogScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  resourceType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  unit: z.union([ z.lazy(() => EnumResourceUnitFilterSchema),z.lazy(() => ResourceUnitSchema) ]).optional(),
  amount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogScalarWhereInput>;

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
  validUntil: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict() as z.ZodType<Prisma.UserInstanceTokenScalarWhereInput>;

export const UserCreateWithoutSessionsInputSchema: z.ZodType<Omit<Prisma.UserCreateWithoutSessionsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  logs: z.lazy(() => UserSystemLogCreateNestedManyWithoutUserInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogCreateNestedManyWithoutUserInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserCreateWithoutSessionsInput, "createdAt" | "updatedAt">>;

export const UserUncheckedCreateWithoutSessionsInputSchema: z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutSessionsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  logs: z.lazy(() => UserSystemLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional()
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
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  logs: z.lazy(() => UserSystemLogUpdateManyWithoutUserNestedInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUpdateWithoutSessionsInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateWithoutSessionsInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutSessionsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  logs: z.lazy(() => UserSystemLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutSessionsInput, "createdAt" | "updatedAt">>;

export const UserResourceEventLogCreateWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogCreateWithoutInstanceInput> = z.object({
  id: z.string().cuid().optional(),
  resourceType: z.lazy(() => ResourceTypeSchema),
  type: z.lazy(() => ResourceEventTypeSchema),
  unit: z.lazy(() => ResourceUnitSchema),
  amount: z.number().int(),
  timestamp: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUserResourceEventLogInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateWithoutInstanceInput>;

export const UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedCreateWithoutInstanceInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  resourceType: z.lazy(() => ResourceTypeSchema),
  type: z.lazy(() => ResourceEventTypeSchema),
  unit: z.lazy(() => ResourceUnitSchema),
  amount: z.number().int(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedCreateWithoutInstanceInput>;

export const UserResourceEventLogCreateOrConnectWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogCreateOrConnectWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateOrConnectWithoutInstanceInput>;

export const UserResourceEventLogCreateManyInstanceInputEnvelopeSchema: z.ZodType<Prisma.UserResourceEventLogCreateManyInstanceInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserResourceEventLogCreateManyInstanceInputSchema),z.lazy(() => UserResourceEventLogCreateManyInstanceInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateManyInstanceInputEnvelope>;

export const UserInstanceTokenCreateWithoutInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateWithoutInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  token: z.string(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUserInstanceTokenInputSchema)
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateWithoutInstanceInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedCreateWithoutInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedCreateWithoutInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  token: z.string(),
  validUntil: z.coerce.date(),
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

export const UserResourceEventLogUpsertWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogUpsertWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserResourceEventLogUpdateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUncheckedUpdateWithoutInstanceInputSchema) ]),
  create: z.union([ z.lazy(() => UserResourceEventLogCreateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpsertWithWhereUniqueWithoutInstanceInput>;

export const UserResourceEventLogUpdateWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogUpdateWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserResourceEventLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserResourceEventLogUpdateWithoutInstanceInputSchema),z.lazy(() => UserResourceEventLogUncheckedUpdateWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateWithWhereUniqueWithoutInstanceInput>;

export const UserResourceEventLogUpdateManyWithWhereWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogUpdateManyWithWhereWithoutInstanceInput> = z.object({
  where: z.lazy(() => UserResourceEventLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserResourceEventLogUpdateManyMutationInputSchema),z.lazy(() => UserResourceEventLogUncheckedUpdateManyWithoutInstanceInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateManyWithWhereWithoutInstanceInput>;

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

export const UserCreateWithoutUserInstanceTokenInputSchema: z.ZodType<Omit<Prisma.UserCreateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogCreateNestedManyWithoutUserInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserCreateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">>;

export const UserUncheckedCreateWithoutUserInstanceTokenInputSchema: z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">>;

export const UserCreateOrConnectWithoutUserInstanceTokenInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserInstanceTokenInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserInstanceTokenInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserInstanceTokenInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutUserInstanceTokenInput>;

export const ServiceInstanceCreateWithoutUserInstanceTokenInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceCreateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceCreateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedCreateWithoutUserInstanceTokenInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceCreateOrConnectWithoutUserInstanceTokenInputSchema: z.ZodType<Prisma.ServiceInstanceCreateOrConnectWithoutUserInstanceTokenInput> = z.object({
  where: z.lazy(() => ServiceInstanceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserInstanceTokenInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserInstanceTokenInputSchema) ]),
}).strict() as z.ZodType<Prisma.ServiceInstanceCreateOrConnectWithoutUserInstanceTokenInput>;

export const UserUpsertWithoutUserInstanceTokenInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserInstanceTokenInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserInstanceTokenInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserInstanceTokenInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserInstanceTokenInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserInstanceTokenInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpsertWithoutUserInstanceTokenInput>;

export const UserUpdateToOneWithWhereWithoutUserInstanceTokenInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserInstanceTokenInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserInstanceTokenInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserInstanceTokenInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserInstanceTokenInput>;

export const UserUpdateWithoutUserInstanceTokenInputSchema: z.ZodType<Omit<Prisma.UserUpdateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogUpdateManyWithoutUserNestedInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUpdateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateWithoutUserInstanceTokenInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUpsertWithoutUserInstanceTokenInputSchema: z.ZodType<Prisma.ServiceInstanceUpsertWithoutUserInstanceTokenInput> = z.object({
  update: z.union([ z.lazy(() => ServiceInstanceUpdateWithoutUserInstanceTokenInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUserInstanceTokenInputSchema) ]),
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserInstanceTokenInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserInstanceTokenInputSchema) ]),
  where: z.lazy(() => ServiceInstanceWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceUpsertWithoutUserInstanceTokenInput>;

export const ServiceInstanceUpdateToOneWithWhereWithoutUserInstanceTokenInputSchema: z.ZodType<Prisma.ServiceInstanceUpdateToOneWithWhereWithoutUserInstanceTokenInput> = z.object({
  where: z.lazy(() => ServiceInstanceWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ServiceInstanceUpdateWithoutUserInstanceTokenInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUserInstanceTokenInputSchema) ]),
}).strict() as z.ZodType<Prisma.ServiceInstanceUpdateToOneWithWhereWithoutUserInstanceTokenInput>;

export const ServiceInstanceUpdateWithoutUserInstanceTokenInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUpdateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUpdateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedUpdateWithoutUserInstanceTokenInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateWithoutUserInstanceTokenInput, "createdAt" | "updatedAt">>;

export const UserCreateWithoutLogsInputSchema: z.ZodType<Omit<Prisma.UserCreateWithoutLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogCreateNestedManyWithoutUserInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserCreateWithoutLogsInput, "createdAt" | "updatedAt">>;

export const UserUncheckedCreateWithoutLogsInputSchema: z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutLogsInput, "createdAt" | "updatedAt">>;

export const UserCreateOrConnectWithoutLogsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutLogsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutLogsInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutLogsInput>;

export const UserUpsertWithoutLogsInputSchema: z.ZodType<Prisma.UserUpsertWithoutLogsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutLogsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutLogsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpsertWithoutLogsInput>;

export const UserUpdateToOneWithWhereWithoutLogsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutLogsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutLogsInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutLogsInput>;

export const UserUpdateWithoutLogsInputSchema: z.ZodType<Omit<Prisma.UserUpdateWithoutLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUpdateWithoutLogsInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateWithoutLogsInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutLogsInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserResourceEventLog: z.lazy(() => UserResourceEventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutLogsInput, "createdAt" | "updatedAt">>;

export const UserCreateWithoutUserResourceEventLogInputSchema: z.ZodType<Omit<Prisma.UserCreateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogCreateNestedManyWithoutUserInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserCreateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">>;

export const UserUncheckedCreateWithoutUserResourceEventLogInputSchema: z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  image: z.string().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  hashedPassword: z.string(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedCreateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">>;

export const UserCreateOrConnectWithoutUserResourceEventLogInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserResourceEventLogInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserResourceEventLogInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserResourceEventLogInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutUserResourceEventLogInput>;

export const ServiceInstanceCreateWithoutUserResourceEventLogInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceCreateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceCreateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedCreateWithoutUserResourceEventLogInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => ServiceTypeSchema),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedCreateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceCreateOrConnectWithoutUserResourceEventLogInputSchema: z.ZodType<Prisma.ServiceInstanceCreateOrConnectWithoutUserResourceEventLogInput> = z.object({
  where: z.lazy(() => ServiceInstanceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserResourceEventLogInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserResourceEventLogInputSchema) ]),
}).strict() as z.ZodType<Prisma.ServiceInstanceCreateOrConnectWithoutUserResourceEventLogInput>;

export const UserUpsertWithoutUserResourceEventLogInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserResourceEventLogInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserResourceEventLogInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserResourceEventLogInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserResourceEventLogInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserResourceEventLogInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpsertWithoutUserResourceEventLogInput>;

export const UserUpdateToOneWithWhereWithoutUserResourceEventLogInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserResourceEventLogInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserResourceEventLogInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserResourceEventLogInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserResourceEventLogInput>;

export const UserUpdateWithoutUserResourceEventLogInputSchema: z.ZodType<Omit<Prisma.UserUpdateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogUpdateManyWithoutUserNestedInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUpdateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">>;

export const UserUncheckedUpdateWithoutUserResourceEventLogInputSchema: z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(50),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.union([ z.string().max(500),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedPassword: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  logs: z.lazy(() => UserSystemLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserUncheckedUpdateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUpsertWithoutUserResourceEventLogInputSchema: z.ZodType<Prisma.ServiceInstanceUpsertWithoutUserResourceEventLogInput> = z.object({
  update: z.union([ z.lazy(() => ServiceInstanceUpdateWithoutUserResourceEventLogInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUserResourceEventLogInputSchema) ]),
  create: z.union([ z.lazy(() => ServiceInstanceCreateWithoutUserResourceEventLogInputSchema),z.lazy(() => ServiceInstanceUncheckedCreateWithoutUserResourceEventLogInputSchema) ]),
  where: z.lazy(() => ServiceInstanceWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.ServiceInstanceUpsertWithoutUserResourceEventLogInput>;

export const ServiceInstanceUpdateToOneWithWhereWithoutUserResourceEventLogInputSchema: z.ZodType<Prisma.ServiceInstanceUpdateToOneWithWhereWithoutUserResourceEventLogInput> = z.object({
  where: z.lazy(() => ServiceInstanceWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ServiceInstanceUpdateWithoutUserResourceEventLogInputSchema),z.lazy(() => ServiceInstanceUncheckedUpdateWithoutUserResourceEventLogInputSchema) ]),
}).strict() as z.ZodType<Prisma.ServiceInstanceUpdateToOneWithWhereWithoutUserResourceEventLogInput>;

export const ServiceInstanceUpdateWithoutUserResourceEventLogInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUpdateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUpdateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">>;

export const ServiceInstanceUncheckedUpdateWithoutUserResourceEventLogInputSchema: z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ServiceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(1).max(100),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserInstanceToken: z.lazy(() => UserInstanceTokenUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.ServiceInstanceUncheckedUpdateWithoutUserResourceEventLogInput, "createdAt" | "updatedAt">>;

export const SessionCreateManyUserInputSchema: z.ZodType<Omit<Prisma.SessionCreateManyUserInput, "createdAt">> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date().min(new Date()),
  currentIp: z.string().ip().optional().nullable(),
  // omitted: createdAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.SessionCreateManyUserInput, "createdAt">>;

export const UserSystemLogCreateManyUserInputSchema: z.ZodType<Prisma.UserSystemLogCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => EventTypeSchema),
  detail: z.string().max(1000).optional().nullable(),
  resultType: z.lazy(() => EventResultTypeSchema),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserSystemLogCreateManyUserInput>;

export const UserResourceEventLogCreateManyUserInputSchema: z.ZodType<Prisma.UserResourceEventLogCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  instanceId: z.string().optional().nullable(),
  resourceType: z.lazy(() => ResourceTypeSchema),
  type: z.lazy(() => ResourceEventTypeSchema),
  unit: z.lazy(() => ResourceUnitSchema),
  amount: z.number().int(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateManyUserInput>;

export const UserInstanceTokenCreateManyUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  token: z.string(),
  validUntil: z.coerce.date(),
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

export const UserSystemLogUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  detail: z.union([ z.string().max(1000),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogUpdateWithoutUserInput>;

export const UserSystemLogUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  detail: z.union([ z.string().max(1000),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogUncheckedUpdateWithoutUserInput>;

export const UserSystemLogUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserSystemLogUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  detail: z.union([ z.string().max(1000),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resultType: z.union([ z.lazy(() => EventResultTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogUncheckedUpdateManyWithoutUserInput>;

export const UserResourceEventLogUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resourceType: z.union([ z.lazy(() => ResourceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ResourceEventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => EnumResourceUnitFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  instance: z.lazy(() => ServiceInstanceUpdateOneWithoutUserResourceEventLogNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateWithoutUserInput>;

export const UserResourceEventLogUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resourceType: z.union([ z.lazy(() => ResourceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ResourceEventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => EnumResourceUnitFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateWithoutUserInput>;

export const UserResourceEventLogUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resourceType: z.union([ z.lazy(() => ResourceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ResourceEventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => EnumResourceUnitFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateManyWithoutUserInput>;

export const UserInstanceTokenUpdateWithoutUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpdateWithoutUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  instance: z.lazy(() => ServiceInstanceUpdateOneRequiredWithoutUserInstanceTokenNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpdateWithoutUserInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateWithoutUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateWithoutUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateWithoutUserInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutUserInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutUserInput, "createdAt" | "updatedAt">>;

export const UserResourceEventLogCreateManyInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogCreateManyInstanceInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  resourceType: z.lazy(() => ResourceTypeSchema),
  type: z.lazy(() => ResourceEventTypeSchema),
  unit: z.lazy(() => ResourceUnitSchema),
  amount: z.number().int(),
  timestamp: z.coerce.date().optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateManyInstanceInput>;

export const UserInstanceTokenCreateManyInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  token: z.string(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenCreateManyInstanceInput, "createdAt" | "updatedAt">>;

export const UserResourceEventLogUpdateWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogUpdateWithoutInstanceInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  resourceType: z.union([ z.lazy(() => ResourceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ResourceEventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => EnumResourceUnitFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutUserResourceEventLogNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateWithoutInstanceInput>;

export const UserResourceEventLogUncheckedUpdateWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateWithoutInstanceInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resourceType: z.union([ z.lazy(() => ResourceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ResourceEventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => EnumResourceUnitFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateWithoutInstanceInput>;

export const UserResourceEventLogUncheckedUpdateManyWithoutInstanceInputSchema: z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateManyWithoutInstanceInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  resourceType: z.union([ z.lazy(() => ResourceTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ResourceEventTypeSchema),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ResourceUnitSchema),z.lazy(() => EnumResourceUnitFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUncheckedUpdateManyWithoutInstanceInput>;

export const UserInstanceTokenUpdateWithoutInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUpdateWithoutInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutUserInstanceTokenNestedInputSchema).optional()
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUpdateWithoutInstanceInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateWithoutInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateWithoutInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateWithoutInstanceInput, "createdAt" | "updatedAt">>;

export const UserInstanceTokenUncheckedUpdateManyWithoutInstanceInputSchema: z.ZodType<Omit<Prisma.UserInstanceTokenUncheckedUpdateManyWithoutInstanceInput, "createdAt" | "updatedAt">> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  validUntil: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
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

export const UserSystemLogFindFirstArgsSchema: z.ZodType<Prisma.UserSystemLogFindFirstArgs> = z.object({
  select: UserSystemLogSelectSchema.optional(),
  include: UserSystemLogIncludeSchema.optional(),
  where: UserSystemLogWhereInputSchema.optional(),
  orderBy: z.union([ UserSystemLogOrderByWithRelationInputSchema.array(),UserSystemLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserSystemLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserSystemLogScalarFieldEnumSchema,UserSystemLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogFindFirstArgs>;

export const UserSystemLogFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserSystemLogFindFirstOrThrowArgs> = z.object({
  select: UserSystemLogSelectSchema.optional(),
  include: UserSystemLogIncludeSchema.optional(),
  where: UserSystemLogWhereInputSchema.optional(),
  orderBy: z.union([ UserSystemLogOrderByWithRelationInputSchema.array(),UserSystemLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserSystemLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserSystemLogScalarFieldEnumSchema,UserSystemLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogFindFirstOrThrowArgs>;

export const UserSystemLogFindManyArgsSchema: z.ZodType<Prisma.UserSystemLogFindManyArgs> = z.object({
  select: UserSystemLogSelectSchema.optional(),
  include: UserSystemLogIncludeSchema.optional(),
  where: UserSystemLogWhereInputSchema.optional(),
  orderBy: z.union([ UserSystemLogOrderByWithRelationInputSchema.array(),UserSystemLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserSystemLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserSystemLogScalarFieldEnumSchema,UserSystemLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogFindManyArgs>;

export const UserSystemLogAggregateArgsSchema: z.ZodType<Prisma.UserSystemLogAggregateArgs> = z.object({
  where: UserSystemLogWhereInputSchema.optional(),
  orderBy: z.union([ UserSystemLogOrderByWithRelationInputSchema.array(),UserSystemLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserSystemLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogAggregateArgs>;

export const UserSystemLogGroupByArgsSchema: z.ZodType<Prisma.UserSystemLogGroupByArgs> = z.object({
  where: UserSystemLogWhereInputSchema.optional(),
  orderBy: z.union([ UserSystemLogOrderByWithAggregationInputSchema.array(),UserSystemLogOrderByWithAggregationInputSchema ]).optional(),
  by: UserSystemLogScalarFieldEnumSchema.array(),
  having: UserSystemLogScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogGroupByArgs>;

export const UserSystemLogFindUniqueArgsSchema: z.ZodType<Prisma.UserSystemLogFindUniqueArgs> = z.object({
  select: UserSystemLogSelectSchema.optional(),
  include: UserSystemLogIncludeSchema.optional(),
  where: UserSystemLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserSystemLogFindUniqueArgs>;

export const UserSystemLogFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserSystemLogFindUniqueOrThrowArgs> = z.object({
  select: UserSystemLogSelectSchema.optional(),
  include: UserSystemLogIncludeSchema.optional(),
  where: UserSystemLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserSystemLogFindUniqueOrThrowArgs>;

export const UserResourceEventLogFindFirstArgsSchema: z.ZodType<Prisma.UserResourceEventLogFindFirstArgs> = z.object({
  select: UserResourceEventLogSelectSchema.optional(),
  include: UserResourceEventLogIncludeSchema.optional(),
  where: UserResourceEventLogWhereInputSchema.optional(),
  orderBy: z.union([ UserResourceEventLogOrderByWithRelationInputSchema.array(),UserResourceEventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserResourceEventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserResourceEventLogScalarFieldEnumSchema,UserResourceEventLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogFindFirstArgs>;

export const UserResourceEventLogFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserResourceEventLogFindFirstOrThrowArgs> = z.object({
  select: UserResourceEventLogSelectSchema.optional(),
  include: UserResourceEventLogIncludeSchema.optional(),
  where: UserResourceEventLogWhereInputSchema.optional(),
  orderBy: z.union([ UserResourceEventLogOrderByWithRelationInputSchema.array(),UserResourceEventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserResourceEventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserResourceEventLogScalarFieldEnumSchema,UserResourceEventLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogFindFirstOrThrowArgs>;

export const UserResourceEventLogFindManyArgsSchema: z.ZodType<Prisma.UserResourceEventLogFindManyArgs> = z.object({
  select: UserResourceEventLogSelectSchema.optional(),
  include: UserResourceEventLogIncludeSchema.optional(),
  where: UserResourceEventLogWhereInputSchema.optional(),
  orderBy: z.union([ UserResourceEventLogOrderByWithRelationInputSchema.array(),UserResourceEventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserResourceEventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserResourceEventLogScalarFieldEnumSchema,UserResourceEventLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogFindManyArgs>;

export const UserResourceEventLogAggregateArgsSchema: z.ZodType<Prisma.UserResourceEventLogAggregateArgs> = z.object({
  where: UserResourceEventLogWhereInputSchema.optional(),
  orderBy: z.union([ UserResourceEventLogOrderByWithRelationInputSchema.array(),UserResourceEventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: UserResourceEventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogAggregateArgs>;

export const UserResourceEventLogGroupByArgsSchema: z.ZodType<Prisma.UserResourceEventLogGroupByArgs> = z.object({
  where: UserResourceEventLogWhereInputSchema.optional(),
  orderBy: z.union([ UserResourceEventLogOrderByWithAggregationInputSchema.array(),UserResourceEventLogOrderByWithAggregationInputSchema ]).optional(),
  by: UserResourceEventLogScalarFieldEnumSchema.array(),
  having: UserResourceEventLogScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogGroupByArgs>;

export const UserResourceEventLogFindUniqueArgsSchema: z.ZodType<Prisma.UserResourceEventLogFindUniqueArgs> = z.object({
  select: UserResourceEventLogSelectSchema.optional(),
  include: UserResourceEventLogIncludeSchema.optional(),
  where: UserResourceEventLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserResourceEventLogFindUniqueArgs>;

export const UserResourceEventLogFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserResourceEventLogFindUniqueOrThrowArgs> = z.object({
  select: UserResourceEventLogSelectSchema.optional(),
  include: UserResourceEventLogIncludeSchema.optional(),
  where: UserResourceEventLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserResourceEventLogFindUniqueOrThrowArgs>;

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

export const UserSystemLogCreateArgsSchema: z.ZodType<Prisma.UserSystemLogCreateArgs> = z.object({
  select: UserSystemLogSelectSchema.optional(),
  include: UserSystemLogIncludeSchema.optional(),
  data: z.union([ UserSystemLogCreateInputSchema,UserSystemLogUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Prisma.UserSystemLogCreateArgs>;

export const UserSystemLogUpsertArgsSchema: z.ZodType<Prisma.UserSystemLogUpsertArgs> = z.object({
  select: UserSystemLogSelectSchema.optional(),
  include: UserSystemLogIncludeSchema.optional(),
  where: UserSystemLogWhereUniqueInputSchema,
  create: z.union([ UserSystemLogCreateInputSchema,UserSystemLogUncheckedCreateInputSchema ]),
  update: z.union([ UserSystemLogUpdateInputSchema,UserSystemLogUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.UserSystemLogUpsertArgs>;

export const UserSystemLogCreateManyArgsSchema: z.ZodType<Prisma.UserSystemLogCreateManyArgs> = z.object({
  data: z.union([ UserSystemLogCreateManyInputSchema,UserSystemLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogCreateManyArgs>;

export const UserSystemLogDeleteArgsSchema: z.ZodType<Prisma.UserSystemLogDeleteArgs> = z.object({
  select: UserSystemLogSelectSchema.optional(),
  include: UserSystemLogIncludeSchema.optional(),
  where: UserSystemLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserSystemLogDeleteArgs>;

export const UserSystemLogUpdateArgsSchema: z.ZodType<Prisma.UserSystemLogUpdateArgs> = z.object({
  select: UserSystemLogSelectSchema.optional(),
  include: UserSystemLogIncludeSchema.optional(),
  data: z.union([ UserSystemLogUpdateInputSchema,UserSystemLogUncheckedUpdateInputSchema ]),
  where: UserSystemLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserSystemLogUpdateArgs>;

export const UserSystemLogUpdateManyArgsSchema: z.ZodType<Prisma.UserSystemLogUpdateManyArgs> = z.object({
  data: z.union([ UserSystemLogUpdateManyMutationInputSchema,UserSystemLogUncheckedUpdateManyInputSchema ]),
  where: UserSystemLogWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogUpdateManyArgs>;

export const UserSystemLogDeleteManyArgsSchema: z.ZodType<Prisma.UserSystemLogDeleteManyArgs> = z.object({
  where: UserSystemLogWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserSystemLogDeleteManyArgs>;

export const UserResourceEventLogCreateArgsSchema: z.ZodType<Prisma.UserResourceEventLogCreateArgs> = z.object({
  select: UserResourceEventLogSelectSchema.optional(),
  include: UserResourceEventLogIncludeSchema.optional(),
  data: z.union([ UserResourceEventLogCreateInputSchema,UserResourceEventLogUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateArgs>;

export const UserResourceEventLogUpsertArgsSchema: z.ZodType<Prisma.UserResourceEventLogUpsertArgs> = z.object({
  select: UserResourceEventLogSelectSchema.optional(),
  include: UserResourceEventLogIncludeSchema.optional(),
  where: UserResourceEventLogWhereUniqueInputSchema,
  create: z.union([ UserResourceEventLogCreateInputSchema,UserResourceEventLogUncheckedCreateInputSchema ]),
  update: z.union([ UserResourceEventLogUpdateInputSchema,UserResourceEventLogUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpsertArgs>;

export const UserResourceEventLogCreateManyArgsSchema: z.ZodType<Prisma.UserResourceEventLogCreateManyArgs> = z.object({
  data: z.union([ UserResourceEventLogCreateManyInputSchema,UserResourceEventLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogCreateManyArgs>;

export const UserResourceEventLogDeleteArgsSchema: z.ZodType<Prisma.UserResourceEventLogDeleteArgs> = z.object({
  select: UserResourceEventLogSelectSchema.optional(),
  include: UserResourceEventLogIncludeSchema.optional(),
  where: UserResourceEventLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserResourceEventLogDeleteArgs>;

export const UserResourceEventLogUpdateArgsSchema: z.ZodType<Prisma.UserResourceEventLogUpdateArgs> = z.object({
  select: UserResourceEventLogSelectSchema.optional(),
  include: UserResourceEventLogIncludeSchema.optional(),
  data: z.union([ UserResourceEventLogUpdateInputSchema,UserResourceEventLogUncheckedUpdateInputSchema ]),
  where: UserResourceEventLogWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateArgs>;

export const UserResourceEventLogUpdateManyArgsSchema: z.ZodType<Prisma.UserResourceEventLogUpdateManyArgs> = z.object({
  data: z.union([ UserResourceEventLogUpdateManyMutationInputSchema,UserResourceEventLogUncheckedUpdateManyInputSchema ]),
  where: UserResourceEventLogWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogUpdateManyArgs>;

export const UserResourceEventLogDeleteManyArgsSchema: z.ZodType<Prisma.UserResourceEventLogDeleteManyArgs> = z.object({
  where: UserResourceEventLogWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserResourceEventLogDeleteManyArgs>;