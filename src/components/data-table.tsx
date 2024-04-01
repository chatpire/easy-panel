// data-table.ts
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
  type Table as ReactTable,
  type Row,
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
import { DataTableColumnHeader, getDataTableCheckboxColumn } from "@/app/_helpers/data-table-helper";
import { camelCaseToTitleCase, formatUserDataTableCellValue } from "@/app/_helpers/data-table-cell-formatter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { extractKeysFromSchema } from "@/lib/utils";
import { z } from "zod";
import { Icons } from "./icons";

export interface DataTableIconAction<T> {
  key: string;
  icon: keyof typeof Icons;
  onClick: (row: Row<T>) => void;
}

export interface DataTableDropdownAction<T> {
  key: string;
  content: React.ReactNode;
  type: "item" | "separator";
  onClick?: (row: Row<T>) => void;
}

interface DataTableProps<T> {
  data: T[];
  schema: z.ZodObject<z.ZodRawShape>;
  rowIconActions?: DataTableIconAction<T>[];
  rowDropdownActions?: DataTableDropdownAction<T>[];
}

export function DataTableColumnSelector<T>({ table }: { table: ReactTable<T> }) {
  return (
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
  );
}

export function DataTableHeader<T>({ table, filterField }: { table: ReactTable<T>; filterField: string }) {
  return (
    <div className="flex flex-col items-center space-y-4 py-4 md:flex-row md:space-y-0">
      <Input
        placeholder="Filter..."
        value={(table.getColumn(filterField)?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn(filterField)?.setFilterValue(event.target.value)}
        className="max-w-sm"
      />
      <DataTableColumnSelector table={table} />
    </div>
  );
}

export function createColumns<T>(
  schema: z.ZodObject<z.ZodRawShape>,
  rowIconActions?: DataTableIconAction<T>[],
  rowDropdownActions?: DataTableDropdownAction<T>[],
) {
  const columnHelper = createColumnHelper<T>();

  const columns = [
    getDataTableCheckboxColumn(columnHelper),
    ...extractKeysFromSchema(schema).map((key) =>
      columnHelper.accessor(key as any, {
        header: ({ column }) => <DataTableColumnHeader column={column} title={camelCaseToTitleCase(key)} />,
        cell: (props) => {
          return <div className="text-left font-medium">{formatUserDataTableCellValue(key, props.getValue())}</div>;
        },
      }),
    ),
    ...(rowIconActions
      ? [
          columnHelper.display({
            id: "icon-actions",
            enableHiding: false,
            enablePinning: true,
            cell: ({ row }) => (
              <div className="flex flex-row space-x-2">
                {rowIconActions.map((action) => {
                  const Icon = Icons[action.icon];
                  return (
                    <Button
                      key={action.key}
                      variant="ghost"
                      onClick={() => action.onClick(row)}
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">{action.key}</span>
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            ),
          }),
        ]
      : []),
    columnHelper.display({
      id: "dropdown-actions",
      enableHiding: false,
      enablePinning: true,
      cell: ({ row }) => {
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
              {rowDropdownActions?.map((action) =>
                action.type === "separator" ? (
                  <DropdownMenuSeparator key={action.key} />
                ) : (
                  <DropdownMenuItem key={action.key} onClick={action.onClick ? (() => action.onClick!(row)) : undefined}>
                    {action.content}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  return columns;
}

export function DataTable<T>({ data, schema, rowIconActions, rowDropdownActions }: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const columns = createColumns(schema, rowIconActions, rowDropdownActions);

  const table = useReactTable({
    data,
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
  });

  return (
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
      <DataTableFooter table={table} rowSelection={rowSelection} setRowSelection={setRowSelection} />
    </div>
  );
}

interface DataTableFooterProps<T> {
  table: ReactTable<T>;
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}

export function DataTableFooter<T>({ table, rowSelection, setRowSelection }: DataTableFooterProps<T>) {
  return (
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
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
