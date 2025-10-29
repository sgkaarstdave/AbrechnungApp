import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSupabaseRouteClient } from "@/lib/auth";
import { hoursFromTimes, roundToQuarterHours } from "@/lib/time";

const bodySchema = z.object({
  trainerId: z.string().uuid(),
  teamId: z.string().uuid(),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  hours: z.number().optional(),
  location: z.string().optional(),
  note: z.string().optional(),
  mode: z.enum(["range", "hours"])
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);

    const supabase = createSupabaseRouteClient();
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Nicht authentifiziert" }, { status: 401 });
    }

    const currentTrainer = await prisma.trainer.findUnique({ where: { email: session.user.email } });
    if (!currentTrainer) {
      return NextResponse.json({ message: "Trainer nicht gefunden" }, { status: 403 });
    }

    if (currentTrainer.role !== "admin" && currentTrainer.id !== body.trainerId) {
      return NextResponse.json({ message: "Keine Berechtigung" }, { status: 403 });
    }

    let computedHours: number;
    let startTime: Date | null = null;
    let endTime: Date | null = null;

    if (body.mode === "range") {
      if (!body.startTime || !body.endTime) {
        return NextResponse.json({ message: "Start- und Endzeit erforderlich" }, { status: 400 });
      }
      computedHours = hoursFromTimes(body.startTime, body.endTime);
      startTime = new Date(`1970-01-01T${body.startTime}:00Z`);
      endTime = new Date(`1970-01-01T${body.endTime}:00Z`);
    } else {
      if (typeof body.hours !== "number") {
        return NextResponse.json({ message: "Stunden erforderlich" }, { status: 400 });
      }
      computedHours = roundToQuarterHours(body.hours);
    }

    const sessionRecord = await prisma.session.create({
      data: {
        trainerId: body.trainerId,
        teamId: body.teamId,
        date: new Date(body.date),
        startTime,
        endTime,
        hours: computedHours,
        location: body.location,
        note: body.note
      }
    });

    return NextResponse.json({ id: sessionRecord.id });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.flatten().formErrors.join(", ") }, { status: 400 });
    }
    return NextResponse.json({ message: "Unbekannter Fehler" }, { status: 500 });
  }
}
