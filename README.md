# volley-abrechnung

Eine moderne Next.js App für Volleyball-Trainer:innen zur Erfassung von Trainingseinheiten und automatischen Monatsabrechnungen.
Trainer können sich registrieren, Trainingszeiten erfassen, ihre Stunden einsehen und fertige Excel-Nachweise herunterladen. Admins
sehen alle Trainer und können Monatsberichte automatisiert erzeugen.

## Quickstart

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

Öffne danach `http://localhost:3000`.

Seed-Zugangsdaten:

- Admin: `admin@volley.local` / `admin1234`
- Trainer: `trainer@volley.local` / `trainer1234`

## Wichtige Skripte

| Zweck | Kommando |
| --- | --- |
| Entwicklung starten | `pnpm dev` |
| Prisma-Schema in Datenbank pushen | `pnpm db:push` |
| Seed-Daten einspielen | `pnpm db:seed` |
| Linting | `pnpm lint` |

## Environment Variablen

Lege eine `.env` Datei an und befülle sie wie folgt:

```
DATABASE_URL=postgresql://user:password@localhost:5432/volley
NEXTAUTH_SECRET=ein-langes-geheimes-token
NEXTAUTH_URL=http://localhost:3000
CRON_SECRET=geheimer-cron-token
```

- `NEXTAUTH_SECRET` kannst du mit `openssl rand -base64 32` generieren.
- `CRON_SECRET` wird genutzt, um den Cron-Endpunkt für automatische Berichte zu schützen.

## Architektur

- **Next.js App Router (TypeScript)** für UI & API-Routen
- **NextAuth (Credentials Provider)** für Registrierung & Login
- **Prisma** als ORM für Postgres
- **Tailwind + shadcn/ui** für UI-Komponenten
- **exceljs** erzeugt XLSX-Abrechnungen
- Monatliche Reports werden als Binärdaten in der Tabelle `MonthlyReport` gespeichert

## Automatische Monatsberichte

- Manuelle Exporte über die Oberfläche rufen `/api/export?month=YYYY-MM` auf und speichern den Bericht.
- Ein Cron-Endpunkt (`POST /api/reports/cron`) generiert für alle Trainer den Bericht des Vormonats. Authentifiziere den Aufruf mit
  `Authorization: Bearer $CRON_SECRET` (z. B. via Vercel Cron `0 5 1 * *`).
- Bereits erzeugte Berichte erscheinen in der Übersicht und lassen sich jederzeit herunterladen.

## Weitere Hinweise

- Nach Schema-Änderungen `pnpm db:push` und `pnpm db:seed` ausführen, damit der Prisma Client aktualisiert wird.
- Passe den Seed an eure Teams & Trainer an.
- Für Produktion `NEXTAUTH_URL` auf die öffentliche Domain setzen und den Cron-Endpunkt per Infrastruktur-Scheduler aufrufen.
