import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MonthlyReportSummary {
  id: string;
  month: string;
  createdAt: string;
}

export function MonthlyReportList({ reports }: { reports: MonthlyReportSummary[] }) {
  if (reports.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Noch keine automatischen Monatsberichte vorhanden.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const monthDate = new Date(`${report.month}-01T00:00:00`);
        const label = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(monthDate);
        const createdLabel = new Intl.DateTimeFormat("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }).format(new Date(report.createdAt));
        return (
          <div key={report.id} className="flex flex-col items-start justify-between gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">Erstellt am {createdLabel}</p>
            </div>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/api/reports/${report.id}`}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Download
              </Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
