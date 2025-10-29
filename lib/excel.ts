import ExcelJS from "exceljs";

export interface ExportTrainer {
  name: string;
  email: string;
  ratePerHour: number;
  iban?: string | null;
}

export interface ExportSession {
  date: Date;
  teamName: string;
  hours: number;
  note?: string | null;
  location?: string | null;
  approved: boolean;
}

export interface ExportTrainerMonthOptions {
  trainer: ExportTrainer;
  sessions: ExportSession[];
  month: string; // YYYY-MM
}

export function getTrainerMonthFilename(trainerName: string, month: string) {
  const lastName = trainerName.trim().split(" ").filter(Boolean).pop() ?? trainerName;
  return `Abrechnung_${month}_${lastName}.xlsx`;
}

export async function exportTrainerMonthToXlsx({
  trainer,
  sessions,
  month
}: ExportTrainerMonthOptions): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "volley-abrechnung";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Abrechnung");

  sheet.columns = [
    { header: "Datum", key: "date", width: 18 },
    { header: "Team", key: "team", width: 24 },
    { header: "Ort", key: "location", width: 18 },
    { header: "Stunden", key: "hours", width: 12 },
    { header: "Notiz", key: "note", width: 40 },
    { header: "Freigabe", key: "approved", width: 12 }
  ];

  const germanFormatter = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  let totalHours = 0;

  sessions.forEach((session) => {
    totalHours += session.hours;
    sheet.addRow({
      date: germanFormatter.format(session.date),
      team: session.teamName,
      location: session.location ?? "",
      hours: session.hours,
      note: session.note ?? "",
      approved: session.approved ? "Ja" : "Offen"
    });
  });

  const rateFormatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  });

  const totalAmount = totalHours * trainer.ratePerHour;

  const summaryRow = sheet.addRow({
    date: "",
    team: "",
    location: "",
    hours: totalHours,
    note: `Gesamtsumme bei ${rateFormatter.format(trainer.ratePerHour)} / Std.`,
    approved: rateFormatter.format(totalAmount)
  });
  summaryRow.font = { bold: true };

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });
  });

  const header = sheet.getRow(1);
  header.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
