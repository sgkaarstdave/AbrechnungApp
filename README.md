# volley-abrechnung

Ein Minimal-MVP für Volleyball-Übungsleiter zur Erfassung von Trainingseinheiten und monatlichen Abrechnungen. Trainer können Trainings über ein Formular anlegen, ihre geleisteten Stunden einsehen und eine Excel-Abrechnung exportieren. Admins verwalten Teams und sehen alle Einträge.

## Quickstart

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

Öffne danach `http://localhost:3000`.

### Wichtige Skripte

| Zweck | Kommando |
| --- | --- |
| Entwicklung starten | `pnpm dev` |
| Prisma-Schema in Datenbank pushen | `pnpm db:push` |
| Seed-Daten einspielen | `pnpm db:seed` |
| Linting | `pnpm lint` |

## Environment Variablen

Lege eine `.env` Datei an und befülle sie basierend auf `.env.example`:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_URL` sind identisch. Für lokale Entwicklung kannst du Supabase lokal betreiben oder das gehostete Projekt nutzen. `DATABASE_URL` muss auf dieselbe Postgres-Instanz zeigen, die in Supabase hinterlegt ist.

## Architektur

- **Next.js App Router (TypeScript)** für UI und API-Routen
- **Supabase** für Magic-Link Authentifizierung & Postgres
- **Prisma** als ORM, `npx prisma generate` bei Schema-Änderungen
- **Tailwind + shadcn/ui** für UI-Komponenten
- **exceljs** erzeugt XLSX-Abrechnungen

## Rollen & Policies

- Trainer sehen nur eigene Sessions.
- Admins dürfen alle Sessions einsehen/exportieren.
- Implementiere in Supabase Row-Level Security (RLS) mit Policies wie:
  - `trainer_id = auth.uid()` für Trainer-Tabellenzugriffe.
  - Admin-Rolle (JWT Claim) erhält `using (true)`.

## Deploy & Automatisierung

- Deployment via Vercel. Hinterlege Supabase-Keys & `DATABASE_URL` als Environment Variablen.
- Cron-Idee: Vercel Cron `0 10 1 * *` (Europe/Berlin 00:10 am 1. des Monats) ruft `/api/export?month=YYYY-MM` je Trainer auf und verschickt das Ergebnis per Mail (nicht Teil dieses MVP).

## Weitere Hinweise

- Nach dem ersten `pnpm install` einmal `npx prisma generate` ausführen, damit der Prisma Client bereitsteht.
- Passe den Seed an deine Trainer- und Teamdaten an.
- Magic-Link Auth wird über Supabase gesteuert; im MVP sind nur Server-Checks enthalten.
