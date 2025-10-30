import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireTrainer } from "@/lib/auth";
import { MonthlySessionsTable } from "@/components/MonthlySessionsTable";
import { MonthNavigator } from "@/components/MonthNavigator";
import { TrainerSwitcher } from "@/components/TrainerSwitcher";
import { MonthlyReportList } from "@/components/MonthlyReportList";

interface MeineStundenPageProps {
  searchParams?: {
    month?: string;
    trainerId?: string;
  };
}

function parseMonth(monthParam?: string) {
  const now = new Date();
  if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { month: currentMonth, start, end };
  }

  const [yearStr, monthStr] = monthParam.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
    return parseMonth(undefined);
  }
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  const normalizedMonth = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
  return { month: normalizedMonth, start, end };
}

export default async function MeineStundenPage({ searchParams }: MeineStundenPageProps) {
  const trainer = await requireTrainer();
  const { month, start, end } = parseMonth(searchParams?.month);

  const monthLabel = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(start);

  let trainerOptions: { id: string; name: string }[] = [];
  let selectedTrainerId = trainer.id;

  if (trainer.role === "admin") {
    trainerOptions = await prisma.trainer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
    if (trainerOptions.length === 0) {
      trainerOptions = [{ id: trainer.id, name: trainer.name }];
    }
    const requestedTrainerId = searchParams?.trainerId;
    if (requestedTrainerId && trainerOptions.some((option) => option.id === requestedTrainerId)) {
      selectedTrainerId = requestedTrainerId;
    } else {
      selectedTrainerId = trainerOptions[0]?.id ?? trainer.id;
    }
  }

  const targetTrainer =
    selectedTrainerId === trainer.id
      ? trainer
      : await prisma.trainer.findUnique({
          where: { id: selectedTrainerId },
          select: { id: true, name: true, email: true, role: true, ratePerHour: true, iban: true }
        });

  if (!targetTrainer) {
    redirect("/meine-stunden");
  }

  const sessions = await prisma.session.findMany({
    where: {
      trainerId: targetTrainer.id,
      date: { gte: start, lt: end }
    },
    include: {
      team: { select: { name: true } }
    },
    orderBy: { date: "asc" }
  });

  const totalHours = sessions.reduce((sum, session) => sum + Number(session.hours ?? 0), 0);
  const hourlyRate = Number(targetTrainer.ratePerHour ?? trainer.ratePerHour ?? 0);
  const totalAmount = totalHours * hourlyRate;
  const approvedSessions = sessions.filter((session) => session.approved);
  const approvedHours = approvedSessions.reduce((sum, session) => sum + Number(session.hours ?? 0), 0);
  const pendingHours = Math.max(totalHours - approvedHours, 0);
  const totalSessions = sessions.length;
  const approvedSessionsCount = approvedSessions.length;
  const pendingSessionsCount = totalSessions - approvedSessionsCount;
  const trainerIban = targetTrainer.iban ?? trainer.iban ?? null;
  const currencyFormatter = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
  const formattedHourlyRate = currencyFormatter.format(hourlyRate);
  const formattedTotalAmount = currencyFormatter.format(totalAmount);

  const tableRows = sessions.map((session) => ({
    id: session.id,
    date: session.date.toISOString(),
    team: session.team.name,
    trainer: targetTrainer.name,
    startTime: session.startTime ? session.startTime.toISOString() : null,
    endTime: session.endTime ? session.endTime.toISOString() : null,
    hours: Number(session.hours ?? 0),
    note: session.note ?? "",
    location: session.location ?? "",
    approved: session.approved
  }));

  const reports = await prisma.monthlyReport.findMany({
    where: { trainerId: targetTrainer.id },
    orderBy: { month: "desc" },
    take: 12
  });

  const reportSummaries = reports.map((report) => ({
    id: report.id,
    month: report.month,
    createdAt: report.createdAt.toISOString()
  }));

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {trainer.role === "admin" ? `${targetTrainer.name} – Stundenübersicht` : "Meine Stunden"}
            </h1>
            <p className="text-sm text-muted-foreground">Monat {monthLabel}</p>
          </div>
          <MonthNavigator month={month} />
        </div>
        {trainer.role === "admin" && trainerOptions.length > 0 && (
          <TrainerSwitcher trainers={trainerOptions} currentTrainerId={selectedTrainerId} />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Trainings im Monat</p>
          <p className="mt-2 text-2xl font-semibold">{totalSessions}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {approvedSessionsCount} freigegeben · {pendingSessionsCount} offen
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Gesamtstunden</p>
          <p className="mt-2 text-2xl font-semibold">{totalHours.toFixed(2)} h</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {approvedHours.toFixed(2)} h freigegeben · {pendingHours.toFixed(2)} h offen
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Summe</p>
          <p className="mt-2 text-2xl font-semibold">{formattedTotalAmount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Stundensatz {formattedHourlyRate}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <MonthlySessionsTable
          sessions={tableRows}
          totalHours={totalHours}
          totalAmount={totalAmount}
          month={month}
          showTrainerColumn={trainer.role === "admin"}
          exportTrainerId={targetTrainer.id}
        />

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Abrechnungsdetails</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Trainer:in</dt>
                <dd className="text-right font-medium">{targetTrainer.name}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">E-Mail</dt>
                <dd className="text-right font-medium break-all">{targetTrainer.email}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Stundensatz</dt>
                <dd className="text-right font-medium">{formattedHourlyRate}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">IBAN</dt>
                <dd className="text-right font-medium break-all">{trainerIban ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Automatisch erzeugte Nachweise</h2>
            <MonthlyReportList reports={reportSummaries} />
          </div>
        </div>
      </div>
    </section>
  );
}
