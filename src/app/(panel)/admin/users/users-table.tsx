"use client";

import * as React from "react";
import { type UserReadAdmin, UserReadAdminSchema } from "@/schema/user.schema";
import { api } from "@/trpc/react";
import { popupEditPasswordForm } from "@/app/_helpers/edit-password-popup";
import { banUser, deleteUser } from "./user-table-actions";
import { DataTable, type DataTableDropdownAction } from "@/components/data-table";

export function UsersTable() {
  const getAllUserQuery = api.user.getAll.useQuery();

  const rowDropdownActions: DataTableDropdownAction<UserReadAdmin>[] = [
    {
      key: "view-tokens",
      content: "View Tokens (TODO)",
      type: "item",
    },
    {
      key: "edit-password",
      content: "Edit Password",
      type: "item",
      onClick: (row) => popupEditPasswordForm(row.original.id, row.original.username),
    },
    {
      key: "separator",
      content: null,
      type: "separator",
    },
    {
      key: "ban-user",
      content: <span className="text-red-500">Ban User</span>,
      type: "item",
      onClick: (row) => banUser(row.original),
    },
    {
      key: "delete-user",
      content: <span className="text-red-500">Delete User</span>,
      type: "item",
      onClick: (row) => deleteUser(row.original),
    },
  ];

  return (
    <div className="w-full">
      <DataTable
        data={getAllUserQuery.data ?? []}
        schema={UserReadAdminSchema}
        rowDropdownActions={rowDropdownActions}
      />
    </div>
  );
}
