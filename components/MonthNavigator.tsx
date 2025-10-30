"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MonthNavigatorProps {
  month: string;
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(month: string, offset: number) {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
    return formatMonth(new Date());
  }
  const target = new Date(year, monthIndex + offset, 1);
  return formatMonth(target);
}

export function MonthNavigator({ month }: MonthNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const currentMonth = formatMonth(new Date());

  const updateMonth = React.useCallback(
    (value: string) => {
      if (!/^\d{4}-\d{2}$/.test(value)) {
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", value);
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  const goPrevious = () => updateMonth(addMonths(month, -1));
  const goNext = () => {
    const next = addMonths(month, 1);
    if (next > currentMonth) return;
    updateMonth(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" onClick={goPrevious} disabled={isPending}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Vorheriger Monat
      </Button>
      <Input
        type="month"
        value={month}
        onChange={(event) => updateMonth(event.target.value)}
        className="w-auto"
      />
      <Button
        type="button"
        variant="outline"
        onClick={goNext}
        disabled={isPending || month === currentMonth}
      >
        Nächster Monat
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
