import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireTrainer } from "@/lib/auth";
import { MonthlySessionsTable } from "@/components/MonthlySessionsTable";

function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export default async function MeineStundenPage() {
  let trainer;
  try {
    trainer = await requireTrainer();
  } catch (error) {
    console.error("Auth fehlgeschlagen", error);
    redirect("/");
  }

  const now = new Date();
  const { start, end } = getMonthBounds(now);
  const monthString = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;

  const sessions = await prisma.session.findMany({
    where:
      trainer.role === "admin"
        ? {
            date: { gte: start, lt: end }
          }
        : {
            trainerId: trainer.id,
            date: { gte: start, lt: end }
          },
    include: {
      team: { select: { name: true } },
      trainer: { select: { name: true, ratePerHour: true } }
    },
    orderBy: { date: "asc" }
  });

  const totalHours = sessions.reduce((sum, session) => {
    const hours = session.hours ? Number(session.hours) : 0;
    return sum + hours;
  }, 0);

  const rate = trainer.role === "admin" ? 0 : Number(trainer.ratePerHour);
  const totalAmount = trainer.role === "admin"
    ? sessions.reduce((sum, session) => sum + Number(session.hours ?? 0) * Number(session.trainer.ratePerHour), 0)
    : totalHours * rate;

  const tableRows = sessions.map((session) => ({
    id: session.id,
    date: session.date.toISOString(),
    team: session.team.name,
    trainer: session.trainer.name,
    hours: Number(session.hours ?? 0),
    note: session.note ?? "",
    location: session.location ?? "",
    approved: session.approved
  }));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Meine Stunden</h1>
        <p className="text-sm text-muted-foreground">
          Monat {new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(start)}
        </p>
      </div>
      <MonthlySessionsTable
        sessions={tableRows}
        totalHours={totalHours}
        totalAmount={totalAmount}
        month={monthString}
        showTrainerColumn={trainer.role === "admin"}
      />
    </section>
  );
}
