import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function getAuthenticatedTrainer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      ratePerHour: true,
      iban: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return trainer;
}

export async function requireTrainer() {
  const trainer = await getAuthenticatedTrainer();
  if (!trainer) {
    throw new Error("Nicht authentifiziert");
  }
  return trainer;
}
