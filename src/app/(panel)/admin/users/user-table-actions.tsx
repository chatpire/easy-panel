"use client";

import { popup } from "@/components/popup";
import { Button } from "@/components/ui/button";
import { type UserSchemaWithAdmin } from "@/schema/user.schema";

export function banUser(user: Pick<UserSchemaWithAdmin, "id" | "username">) {
  popup({
    title: `Ban User`,
    description:
      "Set user.isActive to false. User cannot login to panel, but can still use Chat until session expires.",
    content: (closePopup) => (
      <Button variant={"default"} className="my-2 w-full">
        Confirm
      </Button>
    ),
  });
}

export function deleteUser(user: Pick<UserSchemaWithAdmin, "id" | "username">) {
  popup({
    title: `Delete User`,
    description: "Delete user from database. This action cannot be undone.",
    content: (closePopup) => (
      <Button variant={"destructive"} className="my-2 w-full">
        Confirm
      </Button>
    ),
  });
}
