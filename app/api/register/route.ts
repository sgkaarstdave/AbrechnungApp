import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name angeben"),
    email: z.string().email("Gültige E-Mail"),
    password: z.string().min(8, "Mindestens 8 Zeichen"),
    confirmPassword: z.string(),
    ratePerHour: z.coerce.number().min(0).max(500, "Unrealistische Stundenzahl"),
    iban: z
      .string()
      .trim()
      .max(34, "IBAN zu lang")
      .optional()
      .or(z.literal(""))
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwörter stimmen nicht überein"
  });

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = registerSchema.parse(json);

    const email = data.email.toLowerCase();

    const existing = await prisma.trainer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "E-Mail bereits registriert" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.trainer.create({
      data: {
        name: data.name,
        email,
        role: "trainer",
        ratePerHour: data.ratePerHour,
        iban: data.iban?.length ? data.iban : null,
        passwordHash
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Ungültige Eingabe" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Registrierung fehlgeschlagen" }, { status: 500 });
  }
}
