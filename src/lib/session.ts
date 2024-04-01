import "server-only";

import { getSessionData } from "@/server/auth";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";


export async function getSessionOrRedirect() {
  const session = await getSessionData();
  if (!session) {
    redirect("/auth/login");
  }
  return session;
}

// Get the current user attributes from the session cookie
export async function getSessionUserAttrOrRedirect() {
  const session = await getSessionOrRedirect();
  return session.userAttr;
}

export async function getCurrentUserOrRedirect() {
  await getSessionUserAttrOrRedirect(); // Redirects if not logged in
  const user = api.user.getSelf();
  return user;
}
