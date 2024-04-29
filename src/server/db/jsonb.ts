// see https://github.com/drizzle-team/drizzle-orm/pull/666

import { customType } from "drizzle-orm/pg-core";

export function createJsonbType<T>(name: string) {
  return customType<{ data: T; notNull: false }>({
    dataType() {
      return "jsonb";
    },
    toDriver(val) {
      return val;
    },
    fromDriver(value) {
      if (typeof value === "string") {
        try {
          return JSON.parse(value) as T;
        } catch {}
      }
      return value as T;
    },
  })(name);
}
