"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const trainingSchema = z.object({
  teamId: z.string({ required_error: "Team wählen" }).uuid({ message: "Ungültiges Team" }),
  date: z.string({ required_error: "Datum erforderlich" }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  hours: z.union([z.string(), z.number()]).optional(),
  location: z.string().optional(),
  note: z.string().optional()
});

type TrainingFormValues = z.infer<typeof trainingSchema>;

export interface TrainingFormTeam {
  id: string;
  name: string;
}

export interface TrainingFormProps {
  trainerId: string;
  teams: TrainingFormTeam[];
}

export function TrainingForm({ trainerId, teams }: TrainingFormProps) {
  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      teamId: teams[0]?.id ?? "",
      date: new Date().toISOString().split("T")[0],
      startTime: "18:00",
      endTime: "20:00",
      hours: "",
      location: "",
      note: ""
    }
  });
  const { toast } = useToast();
  const [mode, setMode] = useState<"range" | "hours">("range");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleModeChange = (newMode: "range" | "hours") => {
    setMode(newMode);
    if (newMode === "range") {
      form.setValue("hours", "");
    } else {
      form.setValue("startTime", "");
      form.setValue("endTime", "");
    }
  };

  const onSubmit = async (values: TrainingFormValues) => {
    try {
      setIsSubmitting(true);
      const payload: Record<string, unknown> = {
        trainerId,
        teamId: values.teamId,
        date: values.date,
        note: values.note,
        location: values.location
      };

      if (mode === "range") {
        if (!values.startTime || !values.endTime) {
          toast({ description: "Bitte Start- und Endzeit angeben", className: "bg-destructive text-white" });
          return;
        }
        payload.startTime = values.startTime;
        payload.endTime = values.endTime;
      } else {
        const parsedHours = typeof values.hours === "string" ? Number(values.hours) : values.hours;
        if (!parsedHours || Number.isNaN(parsedHours)) {
          toast({ description: "Bitte Stundenzahl angeben", className: "bg-destructive text-white" });
          return;
        }
        payload.hours = parsedHours;
      }

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, mode })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Fehler beim Speichern" }));
        throw new Error(error.message ?? "Fehler beim Speichern");
      }

      toast({ description: "Training gespeichert", className: "bg-emerald-500 text-white" });
      form.reset({
        ...form.getValues(),
        note: "",
        location: "",
        hours: "",
        startTime: form.getValues("startTime") ?? "",
        endTime: form.getValues("endTime") ?? ""
      });
    } catch (error) {
      console.error(error);
      toast({ description: error instanceof Error ? error.message : "Unbekannter Fehler", className: "bg-destructive text-white" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="teamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team</FormLabel>
              <FormControl>
                <Select value={field.value} onChange={field.onChange}>
                  <option value="" disabled>
                    Team wählen
                  </option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datum</FormLabel>
              <FormControl>
                <Input type="date" value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <span className="text-sm font-medium">Zeiterfassung</span>
          <div className="mt-2 flex gap-2">
            <Button type="button" variant={mode === "range" ? "default" : "outline"} onClick={() => handleModeChange("range")}>
              Beginn & Ende
            </Button>
            <Button type="button" variant={mode === "hours" ? "default" : "outline"} onClick={() => handleModeChange("hours")}>
              Stunden eingeben
            </Button>
          </div>
        </div>

        {mode === "range" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beginn</FormLabel>
                  <FormControl>
                    <Input type="time" value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ende</FormLabel>
                  <FormControl>
                    <Input type="time" value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <FormField
            control={form.control}
            name="hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stunden</FormLabel>
                <FormControl>
                  <Input type="number" step={0.25} placeholder="z. B. 1.5" value={field.value?.toString() ?? ""} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ort</FormLabel>
              <FormControl>
                <Input placeholder="Sporthalle" value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notiz</FormLabel>
              <FormControl>
                <Textarea placeholder="z. B. Fokus auf Aufschläge" value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Speichern..." : "Training speichern"}
        </Button>
      </form>
    </Form>
  );
}
