import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const booleanEnv = z.preprocess((val) => {
  val = String(val).toLowerCase().trim();
  if (val === "true" || val === "1") return true;
  if (val === "false" || val === "0") return false;
  return undefined;
}, z.boolean().optional());

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    IS_BUILDING: booleanEnv.default(false),

    DATABASE_TYPE: z.enum(["postgres", "neon"]),
    POSTGRES_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    ADMIN_USERNAME: z.string().optional().default("admin"),
    ADMIN_EMAIL: z.string().email().optional().default("admin@example.com"),
    ADMIN_PASSWORD: z.string().optional().default("adminadmin"),

    COOKIE_PREFIX: z.string().optional().default("easy_cock"),
    ENABLE_PASSWORD_LOGIN: booleanEnv.default(true),

    // SECRET_KEY: z.string().length(64), // run: openssl rand -hex 32

    BASE_URL: z.string(),
    ENABLE_OIDC_LOGIN: booleanEnv.default(false),

    GRANT_ALL_INSTANCES_FOR_OIDC_USER: booleanEnv.default(true),

    OIDC_CLIENT_ID: z.string().optional(),
    OIDC_CLIENT_SECRET: z.string().optional(),
    OIDC_AUTH_URI: z.string().optional(),
    OIDC_TOKEN_URI: z.string().optional(),
    OIDC_USERINFO_URI: z.string().optional(),
    OIDC_LOGOUT_URI: z.string().optional(),
    OIDC_USERNAME_CLAIM: z.string().optional().default("preferred_username"),
    OIDC_DISPLAY_NAME: z.string().optional().default("OIDC Connect"),
    OIDC_SCOPES: z.string().optional().default("openid profile email"),

    // develop
    TRPC_TIME_LOGGING: booleanEnv.default(false),
    SITE_NAME: z.string().optional().default("Easy Panel"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    IS_BUILDING: process.env.IS_BUILDING,

    DATABASE_TYPE: process.env.DATABASE_TYPE,
    POSTGRES_URL: process.env.POSTGRES_URL,
    NODE_ENV: process.env.NODE_ENV,

    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

    COOKIE_PREFIX: process.env.COOKIE_PREFIX,
    BASE_URL: process.env.BASE_URL,
    ENABLE_PASSWORD_LOGIN: process.env.ENABLE_PASSWORD_LOGIN,

    ENABLE_OIDC_LOGIN: process.env.ENABLE_OIDC_LOGIN,
    GRANT_ALL_INSTANCES_FOR_OIDC_USER: process.env.GRANT_ALL_INSTANCES_FOR_OIDC_USER,

    OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID,
    OIDC_CLIENT_SECRET: process.env.OIDC_CLIENT_SECRET,
    OIDC_AUTH_URI: process.env.OIDC_AUTH_URI,
    OIDC_TOKEN_URI: process.env.OIDC_TOKEN_URI,
    OIDC_USERINFO_URI: process.env.OIDC_USERINFO_URI,
    OIDC_LOGOUT_URI: process.env.OIDC_LOGOUT_URI,
    OIDC_USERNAME_CLAIM: process.env.OIDC_USERNAME_CLAIM,
    OIDC_DISPLAY_NAME: process.env.OIDC_DISPLAY_NAME,
    OIDC_SCOPES: process.env.OIDC_SCOPES,

    SITE_NAME: process.env.SITE_NAME,

    TRPC_TIME_LOGGING: process.env.TRPC_TIME_LOGGING,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
