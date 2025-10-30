"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TrainerSwitcherProps {
  trainers: { id: string; name: string }[];
  currentTrainerId: string;
}

export function TrainerSwitcher({ trainers, currentTrainerId }: TrainerSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("trainerId", value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-1">
      <Label htmlFor="trainer-select">Trainer auswählen</Label>
      <Select id="trainer-select" value={currentTrainerId} onChange={handleChange} disabled={isPending}>
        {trainers.map((trainer) => (
          <option key={trainer.id} value={trainer.id}>
            {trainer.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
