import { env } from "@/env";
import { OAuth2Client } from "oslo/oauth2";

const clientId = env.OIDC_CLIENT_ID;
const authorizeEndpoint = env.OIDC_AUTH_URI;
const tokenEndpoint = env.OIDC_TOKEN_URI;
const redirectURI = `${env.BASE_URL}/api/oidc/callback`;

let client = undefined as OAuth2Client | undefined;
if (clientId && authorizeEndpoint && tokenEndpoint) {
  client = new OAuth2Client(clientId, authorizeEndpoint, tokenEndpoint, {
    redirectURI,
  });
}

export function getOAuth2Client() {
  if (env.ENABLE_OIDC_LOGIN === false) {
    throw new Error("OpenID Connect login is disabled");
  }
  if (!clientId || !authorizeEndpoint || !tokenEndpoint) {
    throw new Error("Missing required OpenID Connect configuration");
  }
  if (!client) {
    throw new Error("Failed to create OAuth2 client");
  }
  return client;
}
