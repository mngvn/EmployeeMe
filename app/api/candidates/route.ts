import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ExpertiseLevel, Availability } from "@/app/generated/prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const field = searchParams.get("field");
  const level = searchParams.get("level");
  const availability = searchParams.get("availability");
  const remote = searchParams.get("remote");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;

  const levels = level ? (level.split(",") as ExpertiseLevel[]) : undefined;
  const availabilities = availability ? (availability.split(",") as Availability[]) : undefined;

  const [candidates, total] = await Promise.all([
    prisma.employeeProfile.findMany({
      where: {
        visibility: { not: "HIDDEN" },
        ...(field ? { careerField: { slug: field } } : {}),
        ...(levels?.length ? { expertiseLevel: { in: levels } } : {}),
        ...(availabilities?.length ? { availabilityStatus: { in: availabilities } } : {}),
        ...(remote === "true" ? { openToRemote: true } : {}),
      },
      include: {
        careerField: true,
        skills: { include: { skill: true }, take: 4 },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.employeeProfile.count({
      where: {
        visibility: { not: "HIDDEN" },
        ...(field ? { careerField: { slug: field } } : {}),
        ...(levels?.length ? { expertiseLevel: { in: levels } } : {}),
        ...(availabilities?.length ? { availabilityStatus: { in: availabilities } } : {}),
        ...(remote === "true" ? { openToRemote: true } : {}),
      },
    }),
  ]);

  return NextResponse.json({ candidates, total, page, pageSize });
}
