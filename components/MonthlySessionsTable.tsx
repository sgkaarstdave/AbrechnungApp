"use client";

import * as React from "react";
import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { Check, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export interface MonthlySessionRow {
  id: string;
  date: string;
  team: string;
  trainer: string;
  hours: number;
  note: string;
  location: string;
  approved: boolean;
}

export interface MonthlySessionsTableProps {
  sessions: MonthlySessionRow[];
  totalHours: number;
  totalAmount: number;
  month: string;
  showTrainerColumn: boolean;
}

export function MonthlySessionsTable({
  sessions,
  totalHours,
  totalAmount,
  month,
  showTrainerColumn
}: MonthlySessionsTableProps) {
  const columns = useMemo<ColumnDef<MonthlySessionRow>[]>(
    () => {
      const base: ColumnDef<MonthlySessionRow>[] = [
        {
          header: "Datum",
          accessorKey: "date",
          cell: (ctx) => new Intl.DateTimeFormat("de-DE").format(new Date(ctx.getValue<string>()))
        },
        {
          header: "Team",
          accessorKey: "team"
        },
        showTrainerColumn
          ? {
              header: "Trainer",
              accessorKey: "trainer"
            }
          : undefined,
        {
          header: "Ort",
          accessorKey: "location"
        },
        {
          header: "Stunden",
          accessorKey: "hours",
          cell: (ctx) => ctx.getValue<number>().toFixed(2)
        },
        {
          header: "Notiz",
          accessorKey: "note"
        },
        {
          header: "Status",
          accessorKey: "approved",
          cell: (ctx) =>
            ctx.getValue<boolean>() ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Check className="h-4 w-4" /> freigegeben
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <X className="h-4 w-4" /> offen
              </span>
            )
        }
      ].filter(Boolean) as ColumnDef<MonthlySessionRow>[];
      return base;
    },
    [showTrainerColumn]
  );

  const table = useReactTable({ data: sessions, columns, getCoreRowModel: getCoreRowModel() });

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export?month=${month}`);
      if (!response.ok) {
        throw new Error("Export fehlgeschlagen");
      }
      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `Abrechnung_${month}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ description: "Excel-Export gestartet" });
    } catch (error) {
      console.error(error);
      toast({ description: "Export fehlgeschlagen", className: "bg-destructive text-white" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 text-left font-semibold text-muted-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-muted-foreground">
                  Keine Trainings im ausgewählten Monat.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/40">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p>
            <span className="font-medium">Gesamtstunden:</span> {totalHours.toFixed(2)} h
          </p>
          <p>
            <span className="font-medium">Summe:</span> {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalAmount)}
          </p>
        </div>
        <Button type="button" onClick={handleExport} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" /> Excel-Export
        </Button>
      </div>
    </div>
  );
}
