"use client";

import { createContext, useContext } from "react";
import {type getSessionData} from "@/server/auth";

type ContextType = Awaited<ReturnType<typeof getSessionData>>;

const SessionContext = createContext<ContextType>(null);

// TODO: unused
export const useSession = () => {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("Unreachable: session not provided");
  }
  return session;
};

export const useUserAttr = () => {
  const session = useSession();
  return session?.userAttr;
};

export default function SessionProvider({ children, value }: { children: React.ReactNode; value: ContextType }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
