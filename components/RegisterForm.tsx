"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name angeben"),
    email: z.string().email("Gültige E-Mail"),
    password: z.string().min(8, "Mindestens 8 Zeichen"),
    confirmPassword: z.string(),
    ratePerHour: z.string().min(1, "Stundensatz angeben"),
    iban: z.string().max(34, "Zu lang").optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwörter stimmen nicht überein"
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      ratePerHour: "28",
      iban: ""
    }
  });
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...values,
        email: values.email.toLowerCase(),
        ratePerHour: Number(values.ratePerHour.replace(",", "."))
      };

      if (Number.isNaN(payload.ratePerHour)) {
        form.setError("ratePerHour", { message: "Ungültige Zahl" });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Registrierung fehlgeschlagen" }));
        throw new Error(error.message ?? "Registrierung fehlgeschlagen");
      }

      await signIn("credentials", {
        email: values.email.toLowerCase(),
        password: values.password,
        redirect: false
      });

      router.push("/erfassen");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        description: error instanceof Error ? error.message : "Registrierung fehlgeschlagen",
        className: "bg-destructive text-white"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Tina Trainer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="trainer@verein.de" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passwort</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Mindestens 8 Zeichen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passwort bestätigen</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Passwort bestätigen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ratePerHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stundensatz (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" min="0" placeholder="28" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iban"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="DE12..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registrieren..." : "Account anlegen"}
        </Button>
      </form>
    </Form>
  );
}
