import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportTrainerMonthToXlsx } from "@/lib/excel";

function getMonthBounds(month: string) {
  const [year, monthPart] = month.split("-").map(Number);
  if (!year || !monthPart) {
    throw new Error("Ungültiger Monat");
  }
  const start = new Date(year, monthPart - 1, 1);
  const end = new Date(year, monthPart, 1);
  return { start, end };
}

function previousMonthString(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const prev = new Date(year, month - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
}

export async function POST(request: Request) {
  try {
    const header = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || header !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: "Nicht autorisiert" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ?? previousMonthString();
    const { start, end } = getMonthBounds(month);

    const trainers = await prisma.trainer.findMany({
      select: { id: true, name: true, email: true, ratePerHour: true, iban: true }
    });

    const results = [] as { trainerId: string; created: boolean }[];

    for (const trainer of trainers) {
      const sessions = await prisma.session.findMany({
        where: {
          trainerId: trainer.id,
          date: { gte: start, lt: end }
        },
        include: { team: { select: { name: true } } },
        orderBy: { date: "asc" }
      });

      if (sessions.length === 0) {
        continue;
      }

      const buffer = await exportTrainerMonthToXlsx({
        trainer: {
          name: trainer.name,
          email: trainer.email,
          ratePerHour: Number(trainer.ratePerHour),
          iban: trainer.iban
        },
        sessions: sessions.map((session) => ({
          date: session.date,
          teamName: session.team.name,
          hours: Number(session.hours ?? 0),
          note: session.note,
          location: session.location,
          approved: session.approved
        })),
        month
      });

      const report = await prisma.monthlyReport.upsert({
        where: {
          trainerId_month: {
            trainerId: trainer.id,
            month
          }
        },
        update: {
          data: buffer
        },
        create: {
          trainerId: trainer.id,
          month,
          data: buffer
        }
      });

      results.push({ trainerId: report.trainerId, created: report.createdAt.getTime() === report.updatedAt.getTime() });
    }

    return NextResponse.json({
      month,
      generated: results.length,
      trainers: results
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cron-Job fehlgeschlagen" }, { status: 500 });
  }
}
