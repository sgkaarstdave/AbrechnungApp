import { cookies } from "next/headers";
import { createRouteHandlerClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";
import { prisma } from "@/lib/db";

export function createSupabaseServerClient() {
  return createServerComponentClient<Database>({ cookies });
}

export function createSupabaseRouteClient() {
  return createRouteHandlerClient<Database>({ cookies });
}

export async function getAuthenticatedTrainer() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return null;
  }

  const trainer = await prisma.trainer.findUnique({ where: { email: session.user.email } });
  return trainer;
}

export async function requireTrainer() {
  const trainer = await getAuthenticatedTrainer();
  if (!trainer) {
    throw new Error("Nicht authentifiziert");
  }
  return trainer;
}
