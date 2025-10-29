import type { Metadata } from "next";
import Link from "next/link";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "volley-abrechnung",
  description: "Trainings erfassen und Abrechnungen für Volleyball-Trainer erstellen"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col px-4 py-6">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <Link href="/" className="text-lg font-semibold text-primary">
                volley-abrechnung
              </Link>
              <p className="text-sm text-muted-foreground">
                Schnelle Zeiterfassung für Volleyball-Übungsleiter
              </p>
            </div>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/erfassen">Erfassen</Link>
              <Link href="/meine-stunden">Meine Stunden</Link>
            </nav>
          </header>
          <main className="flex-1 pb-12">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
