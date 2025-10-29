export function roundToQuarterHours(value: number): number {
  return Math.round(value * 4) / 4;
}

export function hoursFromTimes(startTime: string, endTime: string): number {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  const diffMs = end.getTime() - start.getTime();
  if (Number.isNaN(diffMs) || diffMs <= 0) {
    throw new Error("Endzeit muss nach der Startzeit liegen");
  }
  const diffHours = diffMs / (1000 * 60 * 60);
  return roundToQuarterHours(diffHours);
}
