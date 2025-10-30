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

  const tableRows = sessions.map((session) => ({
    id: session.id,
    date: session.date.toISOString(),
    team: session.team.name,
    trainer: targetTrainer.name,
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

      <MonthlySessionsTable
        sessions={tableRows}
        totalHours={totalHours}
        totalAmount={totalAmount}
        month={month}
        showTrainerColumn={trainer.role === "admin"}
        exportTrainerId={targetTrainer.id}
      />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Automatisch erzeugte Nachweise</h2>
        <MonthlyReportList reports={reportSummaries} />
      </div>
    </section>
  );
}
