"use client";

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
  type ColumnDef,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableColumnHeader, getDataTableCheckboxColumn } from "@/components/data-table-helper";
import { cn, extractKeysFromSchema } from "@/lib/utils";
import { type z } from "zod";
import { Icons } from "./icons";
import { type PaginatedData, type PaginationInput } from "@/schema/pagination.schema";
import { Badge } from "@/components/ui/badge";
import { formatValueToNode } from "@/lib/format";

export function formatUserDataTableCellValue(key: string, value: any): React.ReactNode {
  if (value && (key === "id" || key.endsWith("Id"))) {
    return <Badge variant="secondary">{(value as string).slice(0, 8)}...</Badge>;
  }
  if (key === "role") {
    // return <Badge variant="default">{(value as string).toLowerCase()}</Badge>;
    return (value as string).toLowerCase();
  }
  return formatValueToNode(key, value);
}

export function camelCaseToTitleCase(input: string): string {
  return input.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b./g, (char) => char.toUpperCase());
}

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

export interface DatatableSelectedRowAction<T> {
  key: string;
  content: React.ReactNode;
  onClick: (rows: Row<T>[]) => void;
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

export function DataTableHeader<T>({
  table,
  filterSearchField,
  enableColumnSelector,
}: {
  table: ReactTable<T>;
  filterSearchField?: string;
  enableColumnSelector?: boolean;
}) {
  if (!filterSearchField && !enableColumnSelector) {
    return null;
  }
  return (
    <div className="flex flex-col items-center space-y-4 py-4 md:flex-row md:space-y-0">
      {filterSearchField && (
        <Input
          placeholder={"Filter" + (filterSearchField ? ` by ${camelCaseToTitleCase(filterSearchField)}` : "")}
          value={(table.getColumn(filterSearchField)?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(filterSearchField)?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      )}
      {enableColumnSelector && <DataTableColumnSelector table={table} />}
    </div>
  );
}

export function createColumns<T>(
  schema: z.ZodObject<z.ZodRawShape>,
  rowIconActions?: DataTableIconAction<T>[],
  rowDropdownActions?: DataTableDropdownAction<T>[],
): ColumnDef<T>[] {
  const columnHelper = createColumnHelper<T>();

  const columns = [
    getDataTableCheckboxColumn(columnHelper),
    ...extractKeysFromSchema(schema, 2).map((key) =>
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
                  <DropdownMenuItem key={action.key} onClick={action.onClick ? () => action.onClick!(row) : undefined}>
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

interface DataTableProps<T> {
  data?: T[];
  className?: string;
  schema: z.ZodObject<z.ZodRawShape>;
  filterSearchField?: string;
  enableColumnSelector?: boolean;
  rowIconActions?: DataTableIconAction<T>[];
  rowDropdownActions?: DataTableDropdownAction<T>[];
  allowSelection?: boolean; // todo
  selectedRowActions?: DatatableSelectedRowAction<T>[];
  lazyPagination?: boolean;
  defaultPageSize?: number;
  defaultColumnVisibility?: Record<string, boolean>;
  fetchData?: (pagination: PaginationInput) => Promise<PaginatedData<T>>;
}

export function DataTable<T>({
  data,
  schema,
  filterSearchField,
  enableColumnSelector,
  rowIconActions,
  rowDropdownActions,
  className,
  lazyPagination,
  defaultPageSize,
  defaultColumnVisibility,
  fetchData,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(defaultColumnVisibility ?? {});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pageSize, setPageSize] = React.useState(defaultPageSize ?? 10);
  const [tableData, setTableData] = React.useState<T[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(lazyPagination ? 1 : null);

  const columns = React.useMemo(() => createColumns(schema, rowIconActions, rowDropdownActions), [rowDropdownActions, rowIconActions, schema]);

  // TODO: Implement lazy pagination
  if (lazyPagination) {
    if (!!data) {
      throw new Error("data prop is not allowed with lazy pagination");
    }
    if (!fetchData) {
      throw new Error("fetchData function is required for lazy pagination");
    }
  }

  const table = useReactTable({
    data: lazyPagination ? tableData : data!,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    columns: columns as any,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: lazyPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableColumnPinning: true,
  });

  console.log(table.getVisibleFlatColumns());

  React.useEffect(() => {
    if (!lazyPagination || !fetchData) {
      table.setPageSize(pageSize);
      return;
    }
    fetchData({ currentPage, pageSize })
      .then((response) => {
        setTableData(response.data);
        setLastPage(response.pagination.totalPages);
        setTotalPages(response.pagination.totalPages);
        // console.log("Fetched data", response);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
      });
  }, [currentPage, pageSize]);

  const toPreviousPage = () => {
    if (lazyPagination) {
      setCurrentPage((prev) => prev - 1);
    } else {
      table.previousPage();
    }
  };

  const isPreviousPageDisabled = lazyPagination ? currentPage === 1 : !table.getCanPreviousPage();

  const toNextPage = () => {
    if (lazyPagination) {
      setCurrentPage((prev) => prev + 1);
    } else {
      table.nextPage();
    }
  };

  const isNextPageDisabled = lazyPagination ? currentPage === lastPage : !table.getCanNextPage();

  return (
    <div>
      <DataTableHeader
        table={table}
        filterSearchField={filterSearchField}
        enableColumnSelector={enableColumnSelector}
      />
      <div className={cn("max-h-full w-full overflow-auto rounded-md border", className)}>
        <Table>
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
          <TableBody className="text-xs">
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
      </div>
      <div className="flex flex-row items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          <div className="">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected
            {Object.keys(rowSelection).length > 0 && (
              <Button className="ml-2" variant="ghost" size="sm" onClick={() => table.toggleAllPageRowsSelected(false)}>
                Clear selection
              </Button>
            )}
          </div>
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={toPreviousPage} disabled={isPreviousPageDisabled} />
            </PaginationItem>
            <PaginationItem>{lazyPagination ? currentPage : table.getState().pagination.pageIndex + 1}</PaginationItem>/
            <PaginationItem>{lazyPagination ? totalPages : table.getPageCount()}</PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={toNextPage} disabled={isNextPageDisabled} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
