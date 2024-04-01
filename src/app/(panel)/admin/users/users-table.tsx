"use client";

import * as React from "react";
import { ChevronDownIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  type RowSelectionState,
  DeepKeys,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type UserReadAdmin, UserReadAdminSchema } from "@/schema/user.schema";
import { api } from "@/trpc/react";
import { DataTableColumnHeader, getDataTableCheckboxColumn } from "@/app/_helpers/data-table-helper";
import { camelCaseToTitleCase, formatUserDataTableCellValue } from "@/app/_helpers/data-table-cell-formatter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { popupEditPasswordForm } from "@/app/_helpers/edit-password-popup";
import { copyToClipBoard } from "@/app/_helpers/copy-to-clipboard";
import { banUser, deleteUser } from "./user-table-actions";
import { extractKeysFromSchema } from "@/lib/utils";

const columnHelper = createColumnHelper<UserReadAdmin>();

export function UsersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    role: false,
    createdAt: false,
    updatedAt: false,
    userToken: false,
    groupId: false,
    group: false,
    group_id: false,
    group_createdAt: false,
    group_updatedAt: false,
    group_description: false,
  });
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const getAllUserQuery = api.user.getAll.useQuery();

  const columns = [
    getDataTableCheckboxColumn(columnHelper),
    ...extractKeysFromSchema(UserReadAdminSchema).map((key) =>
      columnHelper.accessor(key as any, {
        header: ({ column }) => <DataTableColumnHeader column={column} title={camelCaseToTitleCase(key)} />,
        cell: (props) => {
          return (
            <div className="text-left font-medium">
              {formatUserDataTableCellValue(key, props.getValue())}
            </div>
          );
        },
      }),
    ),
    columnHelper.display({
      id: "actions",
      enableHiding: false,
      enablePinning: true,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={async () => copyToClipBoard(user.userToken)}>Copy UserToken</DropdownMenuItem>
              <DropdownMenuItem onClick={() => popupEditPasswordForm(user.id, user.username)}>
                Edit Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => banUser(user)}>
                <span className="text-red-500">Ban User</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteUser(user)}>
                <span className="text-red-500">Delete User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: getAllUserQuery.data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableColumnPinning: true,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col items-center space-y-4 py-4 md:flex-row md:space-y-0">
        <Input
          placeholder="Filter usernames..."
          value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("username")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="">
        <ScrollArea className="max-h-[600px] w-full rounded-md border">
          <Table className="relative">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} pinned={header.column.getIsPinned()}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} pinned={cell.column.getIsPinned()}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <div>
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
        </div>
        <div className="space-x-2">
          {Object.keys(rowSelection).length > 0 && (
            <Button variant="outline" size="sm" onClick={() => table.toggleAllPageRowsSelected(false)}>
              Clear selection
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
