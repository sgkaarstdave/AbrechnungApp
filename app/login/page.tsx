import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/LoginForm";
import { getAuthenticatedTrainer } from "@/lib/auth";

export default async function LoginPage() {
  const trainer = await getAuthenticatedTrainer();
  if (trainer) {
    redirect("/erfassen");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Anmelden</h1>
        <p className="text-sm text-muted-foreground">Melde dich mit deinem Vereinsaccount an.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account-Zugang</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Noch kein Zugang? {" "}
        <Link href="/register" className="text-primary">
          Jetzt registrieren
        </Link>
      </p>
    </div>
  );
}
