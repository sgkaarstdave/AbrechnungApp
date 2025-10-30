import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarCheck, FileSpreadsheet, Sparkles } from "lucide-react";
import { getAuthenticatedTrainer } from "@/lib/auth";

export default async function HomePage() {
  const trainer = await getAuthenticatedTrainer();

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Abrechnung leicht gemacht</h1>
        <p className="text-muted-foreground">
          Mit volley-abrechnung dokumentieren Volleyball-Trainer:innen ihre Einheiten in Sekunden und erhalten
          automatisch vorbereitete Monatsnachweise für den Verein.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="sm:w-auto">
            <Link href={trainer ? "/erfassen" : "/register"}>
              {trainer ? "Training erfassen" : "Kostenlos registrieren"}
            </Link>
          </Button>
          {!trainer && (
            <Button asChild variant="outline" className="sm:w-auto">
              <Link href="/login">Ich habe bereits einen Account</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <CalendarCheck className="mb-3 h-6 w-6 text-primary" />
          <h2 className="font-medium">Schnelle Erfassung</h2>
          <p className="text-sm text-muted-foreground">
            Datum, Team und Dauer mit wenigen Klicks dokumentieren – wahlweise über Zeiten oder direkte Stundenangabe.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <FileSpreadsheet className="mb-3 h-6 w-6 text-primary" />
          <h2 className="font-medium">Monatsübersicht</h2>
          <p className="text-sm text-muted-foreground">
            Trainingsstunden pro Monat auswerten, Freigaben sehen und Excel-Nachweise herunterladen.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <Sparkles className="mb-3 h-6 w-6 text-primary" />
          <h2 className="font-medium">Automatische Reports</h2>
          <p className="text-sm text-muted-foreground">
            Zum Monatsende generiert das System fertige Excel-Dateien zum Download oder Versand an den Verein.
          </p>
        </div>
      </div>
    </section>
  );
}
