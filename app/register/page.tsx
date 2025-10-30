import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/RegisterForm";
import { getAuthenticatedTrainer } from "@/lib/auth";

export default async function RegisterPage() {
  const trainer = await getAuthenticatedTrainer();
  if (trainer) {
    redirect("/erfassen");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Account erstellen</h1>
        <p className="text-sm text-muted-foreground">
          Lege deinen Trainer-Account an, um Stunden zu erfassen und Abrechnungen zu erhalten.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stammdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Bereits registriert? {" "}
        <Link href="/login" className="text-primary">
          Hier anmelden
        </Link>
      </p>
    </div>
  );
}
