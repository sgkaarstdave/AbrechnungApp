import { redirect } from "next/navigation";
import { TrainingForm } from "@/components/TrainingForm";
import { prisma } from "@/lib/db";
import { requireTrainer } from "@/lib/auth";

export default async function ErfassenPage() {
  let trainer;
  try {
    trainer = await requireTrainer();
  } catch (error) {
    console.error("Auth fehlgeschlagen", error);
    redirect("/login");
  }

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  if (teams.length === 0) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Training erfassen</h1>
          <p className="text-sm text-muted-foreground">
            Bitte lege zuerst Teams in der Datenbank an, bevor Trainingseinheiten erfasst werden können.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Training erfassen</h1>
        <p className="text-sm text-muted-foreground">Trage Datum, Team und deine Zeiten ein.</p>
      </div>
      <TrainingForm trainerId={trainer.id} teams={teams} />
    </section>
  );
}
