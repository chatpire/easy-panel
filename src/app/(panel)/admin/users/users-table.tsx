"use client";

import * as React from "react";
import { type UserReadAdmin, UserReadAdminSchema, UserReadAdminWithLastLoginSchema } from "@/schema/user.schema";
import { api } from "@/trpc/react";
import { popupEditPasswordForm } from "@/app/(panel)/_components/edit-password-popup";
import { DataTable, type DataTableDropdownAction } from "@/components/data-table";
import { popup } from "@/components/popup";
import { FunctionButton } from "@/components/loading-button";
import { popupGenerateTokensForm } from "@/app/(panel)/admin/users/edit-intance-ability-popup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { popupUserInstanceTokensViewer } from "./view-tokens-popup";

export function UsersTable() {
  const router = useRouter();
  const getAllUserQuery = api.user.getAll.useQuery();
  const updateUsersMutation = api.user.update.useMutation();
  const deleteUserMutation = api.user.delete.useMutation();

  const rowDropdownActions: DataTableDropdownAction<UserReadAdmin>[] = [
    {
      key: "Edit Instance Abilities",
      content: "Edit Instance Abilities",
      type: "item",
      onClick: (row) => popupGenerateTokensForm(row.original.id, row.original.username),
    },
    {
      key: "view-instance-tokens",
      content: "View Tokens",
      type: "item",
      onClick: (row) => popupUserInstanceTokensViewer(row.original.id, row.original.username),
    },
    {
      key: "separator",
      content: null,
      type: "separator",
    },
    {
      key: "edit-user",
      content: "Edit User",
      type: "item",
      onClick: (row) => router.push(`/admin/users/update/${row.original.id}`),
    },
    {
      key: "edit-password",
      content: "Edit Password",
      type: "item",
      onClick: (row) => popupEditPasswordForm(row.original.id, row.original.username),
    },
    {
      key: "ban-user",
      content: <span className="text-red-500">Ban User</span>,
      type: "item",
      onClick: (row) =>
        popup({
          title: `Ban User`,
          description:
            "Set user.isActive to false. User cannot login to panel, but can still use Chat until session expires.",
          content: (closePopup) => (
            <FunctionButton
              variant={"default"}
              className="my-2 w-full"
              onClick={async () => {
                await updateUsersMutation.mutateAsync({ id: row.original.id, isActive: false });
                closePopup();
                toast.success("User has been banned.");
              }}
            >
              Confirm
            </FunctionButton>
          ),
        }),
    },
    {
      key: "delete-user",
      content: <span className="text-red-500">Delete User</span>,
      type: "item",
      onClick: (row) =>
        popup({
          title: `Delete User`,
          description: "Delete user from database. This action cannot be undone.",
          content: (closePopup) => (
            <FunctionButton
              variant={"destructive"}
              className="my-2 w-full"
              onClick={async () => {
                await deleteUserMutation.mutateAsync({ id: row.original.id });
                closePopup();
                toast.success("User has been deleted.");
              }}
            >
              Confirm
            </FunctionButton>
          ),
        }),
    },
  ];

  return (
    <div className="w-full">
      <DataTable
        data={getAllUserQuery.data ?? []}
        filterSearchField={"username"}
        schema={UserReadAdminWithLastLoginSchema}
        rowDropdownActions={rowDropdownActions}
        defaultPageSize={30}
      />
    </div>
  );
}
