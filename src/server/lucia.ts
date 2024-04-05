import { Lucia, type Session as LuciaSession, TimeSpan, type User } from "lucia";
import { db } from "@/server/db";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions, users } from "./db/schema";
import { type UserRole } from "@/schema/user.schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "w"),
  sessionCookie: {
    name: "cock-panel-session",
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
      // TODO set sameSite and domain
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      name: attributes.name,
      email: attributes.email,
      image: attributes.image,
      username: attributes.username,
      role: attributes.role,
    };
  },
  getSessionAttributes: (attributes) => {
    return {
      currentIp: attributes.currentIp,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }

  interface DatabaseUserAttributes {
    name: string;
    image?: string;
    email?: string;
    username: string;
    role: UserRole;
  }

  interface DatabaseSessionAttributes {
    currentIp?: string;
  }
}

export type SessionUser = User;

export interface SessionData extends LuciaSession {
  userAttr: SessionUser;
}
