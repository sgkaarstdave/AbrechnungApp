import Link from "next/link";
import {
  CalendarCheck,
  ClipboardList,
  FileSpreadsheet,
  Sparkles,
  Timer,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedTrainer } from "@/lib/auth";

const featureCards = [
  {
    title: "Training erfassen",
    description:
      "Dokumentiere Datum, Team, Zeiten und Besonderheiten jeder Einheit innerhalb weniger Sekunden.",
    icon: CalendarCheck,
    href: "/erfassen",
    cta: "Jetzt erfassen"
  },
  {
    title: "Meine Stunden",
    description:
      "Behalte alle Trainingseinheiten im Blick, filtere nach Monaten und überprüfe Freigaben.",
    icon: Timer,
    href: "/meine-stunden",
    cta: "Stunden ansehen"
  },
  {
    title: "Trainer verwalten",
    description:
      "Admins sehen alle registrierten Trainer:innen und können bei Bedarf Zugänge sperren oder freigeben.",
    icon: Users,
    href: "/register",
    cta: "Zugang anlegen"
  },
  {
    title: "Excel-Nachweise",
    description:
      "Am Monatsende erzeugt das System automatisch vorbereitete Excel-Dateien für die Abrechnung.",
    icon: FileSpreadsheet,
    href: "/meine-stunden",
    cta: "Berichte herunterladen"
  }
];

const workflowItems = [
  {
    title: "Registrieren oder anmelden",
    description: "Trainer:innen erhalten einen persönlichen Zugang oder werden vom Verein eingeladen.",
    icon: Sparkles
  },
  {
    title: "Trainingseinheiten erfassen",
    description: "Zeiten, Stunden oder Notizen in der Weboberfläche dokumentieren – auch vom Smartphone.",
    icon: ClipboardList
  },
  {
    title: "Nachweise erhalten",
    description: "Automatisch generierte Monatsübersichten exportieren und mit einem Klick teilen.",
    icon: FileSpreadsheet
  }
];

export default async function HomePage() {
  const trainer = await getAuthenticatedTrainer();

  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="relative flex flex-col gap-6 p-8 sm:p-12">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Volley-Abrechnung
            </span>
            <h1 className="text-3xl font-semibold sm:text-4xl">Einfach zur fertigen Monatsabrechnung</h1>
            <p className="max-w-2xl text-muted-foreground">
              Die moderne Plattform für Volleyball-Trainer:innen: Stunden dokumentieren, Teams organisieren
              und mit automatisch vorbereiteten Excel-Nachweisen abrechnen.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={trainer ? "/erfassen" : "/register"}>
                {trainer ? "Training erfassen" : "Kostenlos registrieren"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={trainer ? "/meine-stunden" : "/login"}>
                {trainer ? "Meine Stunden" : "Ich habe bereits einen Zugang"}
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
            <p>
              • Optimiert für mobile Geräte
            </p>
            <p>
              • DSGVO-konforme Datenspeicherung in der Vereins-Cloud
            </p>
            <p>
              • Fertige Excel-Reports ohne komplizierte Tabellen
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Was dich erwartet</h2>
          <p className="text-sm text-muted-foreground">
            Alle Kernfunktionen auf einen Blick – direkt aus der App erreichbar.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {featureCards.map(({ title, description, icon: Icon, href, cta }) => (
            <Card key={title} className="flex h-full flex-col justify-between">
              <CardHeader>
                <Icon className="mb-4 h-8 w-8 text-primary" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={href}>{cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">So funktioniert der Ablauf</h2>
          <p className="text-sm text-muted-foreground">
            In drei einfachen Schritten vom Training zur fertigen Abrechnung.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {workflowItems.map(({ title, description, icon: Icon }, index) => (
            <Card key={title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-semibold text-primary">{index + 1}</span>
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Neugierig auf mehr?</h2>
          <p className="text-sm text-muted-foreground">
            Registriere dich als Trainer:in oder melde dein Team an, um alle Funktionen zu testen.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-medium">Direkt loslegen</h3>
              <p className="text-sm text-muted-foreground">
                Kostenloser Zugang für Vereine und Übungsleiter:innen – inklusive Demo-Daten zum Ausprobieren.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/register">Account erstellen</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Anmelden</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
