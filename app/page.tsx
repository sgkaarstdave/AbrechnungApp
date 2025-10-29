import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarCheck, FileSpreadsheet } from "lucide-react";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">Willkommen bei volley-abrechnung</h1>
      <p className="text-muted-foreground">
        Erfasse Trainingseinheiten, halte den Überblick über deine Stunden und lade monatliche
        Excel-Abrechnungen herunter.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <CalendarCheck className="mb-3 h-6 w-6 text-primary" />
          <h2 className="font-medium">Training erfassen</h2>
          <p className="text-sm text-muted-foreground">
            Datum, Team, Zeiten oder Stundenzahl mit Notizen festhalten.
          </p>
          <Button asChild className="mt-3 w-full">
            <Link href="/erfassen">Zum Formular</Link>
          </Button>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <FileSpreadsheet className="mb-3 h-6 w-6 text-primary" />
          <h2 className="font-medium">Meine Stunden</h2>
          <p className="text-sm text-muted-foreground">
            Aktuellen Monat prüfen und als Excel herunterladen.
          </p>
          <Button asChild variant="secondary" className="mt-3 w-full">
            <Link href="/meine-stunden">Übersicht anzeigen</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
