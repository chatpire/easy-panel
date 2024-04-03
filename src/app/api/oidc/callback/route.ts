import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/server/oidc";
import { cookies } from "next/headers";
import { env } from "@/env";
import { z } from "zod";
import { OAuth2RequestError } from "oslo/oauth2";
import { db } from "@/server/db";
import { UserCreateSchema, createUser } from "@/server/api/routers/user";
import { UserRole } from "@prisma/client";
import { lucia } from "@/server/auth";

const OIDCUserInfoSchema = z.object({
  sub: z.string(),
  email: z.string(),
  email_verified: z.boolean().optional(),
  name: z.string().optional(),
  [env.OIDC_USERNAME_CLAIM]: z.string(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state");
  const code = searchParams.get("code");
  const storedState = cookies().get(env.COOKIE_PREFIX + "_oidc_state")?.value;

  console.debug("OIDC callback", { state, code, storedState });

  if (!storedState || !state || storedState !== state || !code) {
    return NextResponse.json({ error: "Invalid callback parameters" }, { status: 400 });
  }

  const client = getOAuth2Client();

  try {
    const tokenResponse = await client.validateAuthorizationCode(code, {
      credentials: env.OIDC_CLIENT_SECRET!,
      authenticateWith: "http_basic_auth",
    });

    cookies().delete(env.COOKIE_PREFIX + "_oidc_state");

    console.debug("OIDC Token Response:", tokenResponse);

    const accessToken = tokenResponse.access_token;

    const response = await fetch(env.OIDC_USERINFO_URI!, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userInfo = OIDCUserInfoSchema.parse(await response.json());
    console.debug("OIDC UserInfo:", userInfo);

    const email = userInfo.email;
    let user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      const username = userInfo[env.OIDC_USERNAME_CLAIM];

      const instancesIds = [];
      if (env.GRANT_ALL_INSTANCES_FOR_OIDC_USER) {
        const instances = await db.serviceInstance.findMany();
        for (const instance of instances) {
          instancesIds.push(instance.id);
        }
      }

      // Create a new user if not exists
      user = await createUser(
        db,
        UserCreateSchema.parse({
          username,
          image: null,
          comment: null,
          validUntil: null,
          name: userInfo.name ?? username,
          email,
          role: UserRole.USER,
        }),
        instancesIds,
      );
    }

    const session = await lucia.createSession(user.id, {
      currentIp: request.ip ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for") ?? undefined,
    });
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie);

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error in OIDC callback:", error);
    if (error instanceof OAuth2RequestError) {
      return NextResponse.json({ error: "OAuth2RequestError: " + error.message }, { status: 400 });
    } else if (error instanceof z.ZodError) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
