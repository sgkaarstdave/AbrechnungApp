import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import { getTrainerMonthFilename } from "@/lib/excel";

interface RouteParams {
  params: {
    reportId: string;
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Nicht authentifiziert" }, { status: 401 });
    }

    const report = await prisma.monthlyReport.findUnique({
      where: { id: params.reportId },
      include: { trainer: { select: { id: true, name: true } } }
    });

    if (!report) {
      return NextResponse.json({ message: "Report nicht gefunden" }, { status: 404 });
    }

    if (session.user.role !== "admin" && report.trainer.id !== session.user.id) {
      return NextResponse.json({ message: "Keine Berechtigung" }, { status: 403 });
    }

    const filename = getTrainerMonthFilename(report.trainer.name, report.month);
    const buffer = Buffer.from(report.data);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Download fehlgeschlagen" }, { status: 500 });
  }
}
