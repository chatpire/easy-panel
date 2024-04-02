import { Lucia, type Session as LuciaSession, TimeSpan, type User } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { db } from "@/server/db";
import { cookies } from "next/headers";
import { cache } from "react";
import { type UserRole } from "@prisma/client";

const adapter = new PrismaAdapter(db.session, db.user);

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

export const getSessionData = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return null;
  const { user, session } = await lucia.validateSession(sessionId);
  try {
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
    if (session?.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
  } catch {
    // Next.js throws error when attempting to set cookies when rendering page
  }
  return {
    ...session,
    userAttr: user,
  } as SessionData;
});
