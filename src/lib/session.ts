import "server-only";

import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import {getSessionData} from "@/server/auth";

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
  const userAttr = session.userAttr;
  if (!userAttr) {
    redirect("/auth/login");
  }
  return userAttr;
}

export async function getCurrentUserOrRedirect() {
  await getSessionUserAttrOrRedirect(); // Redirects if not logged in
  const user = api.user.getSelf();
  return user;
}
