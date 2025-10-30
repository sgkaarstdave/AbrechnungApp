import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { exportTrainerMonthToXlsx, getTrainerMonthFilename } from "@/lib/excel";
import { authOptions } from "@/lib/auth-options";

function getMonthBounds(month: string) {
  const [year, monthPart] = month.split("-").map(Number);
  if (!year || !monthPart) {
    throw new Error("Ungültiger Monat");
  }
  const start = new Date(year, monthPart - 1, 1);
  const end = new Date(year, monthPart, 1);
  return { start, end };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const targetTrainerId = searchParams.get("trainerId");

    if (!month) {
      return NextResponse.json({ message: "month Parameter erforderlich" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Nicht authentifiziert" }, { status: 401 });
    }

    const requestingTrainer = await prisma.trainer.findUnique({ where: { id: session.user.id } });
    if (!requestingTrainer) {
      return NextResponse.json({ message: "Trainer nicht gefunden" }, { status: 403 });
    }

    const trainerIdToExport =
      requestingTrainer.role === "admin" && targetTrainerId ? targetTrainerId : requestingTrainer.id;

    if (requestingTrainer.role !== "admin" && trainerIdToExport !== requestingTrainer.id) {
      return NextResponse.json({ message: "Keine Berechtigung" }, { status: 403 });
    }

    const trainer = await prisma.trainer.findUnique({ where: { id: trainerIdToExport } });
    if (!trainer) {
      return NextResponse.json({ message: "Trainer für Export nicht gefunden" }, { status: 404 });
    }

    const storedReport = await prisma.monthlyReport.findUnique({
      where: {
        trainerId_month: {
          trainerId: trainer.id,
          month
        }
      }
    });

    const filename = getTrainerMonthFilename(trainer.name, month);

    if (storedReport) {
      const buffer = Buffer.from(storedReport.data);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }

    const { start, end } = getMonthBounds(month);

    const sessions = await prisma.session.findMany({
      where: {
        trainerId: trainer.id,
        date: { gte: start, lt: end }
      },
      include: { team: { select: { name: true } } },
      orderBy: { date: "asc" }
    });

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

    await prisma.monthlyReport.upsert({
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

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Export fehlgeschlagen" }, { status: 500 });
  }
}
