import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/swipe — record a swipe decision
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!employer) {
    return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
  }

  const { employeeProfileId, decision } = await req.json();
  if (!employeeProfileId || !["INTERESTED", "PASSED"].includes(decision)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await prisma.swipeDecision.upsert({
    where: {
      employerProfileId_employeeProfileId: {
        employerProfileId: employer.id,
        employeeProfileId,
      },
    },
    create: {
      employerProfileId: employer.id,
      employeeProfileId,
      decision,
    },
    update: { decision },
  });

  // Auto-save to shortlist when interested
  if (decision === "INTERESTED") {
    await prisma.savedCandidate.upsert({
      where: {
        employerProfileId_employeeProfileId: {
          employerProfileId: employer.id,
          employeeProfileId,
        },
      },
      create: {
        employerProfileId: employer.id,
        employeeProfileId,
        listName: "Interview Queue",
      },
      update: {},
    });
  }

  return NextResponse.json(result);
}

// GET /api/swipe/queue — load unswiped candidates
export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!employer) {
    return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const fieldSlug = searchParams.get("field") ?? undefined;

  const alreadySwiped = await prisma.swipeDecision.findMany({
    where: { employerProfileId: employer.id },
    select: { employeeProfileId: true },
  });
  const swipedIds = alreadySwiped.map((s) => s.employeeProfileId);

  const candidates = await prisma.employeeProfile.findMany({
    where: {
      visibility: { not: "HIDDEN" },
      id: { notIn: swipedIds },
      availabilityStatus: { not: "NOT_LOOKING" },
      ...(fieldSlug ? { careerField: { slug: fieldSlug } } : {}),
    },
    include: {
      careerField: true,
      skills: { include: { skill: true }, take: 6 },
      workExperiences: { orderBy: { startDate: "desc" }, take: 3 },
      educations: { orderBy: { startYear: "desc" }, take: 2 },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return NextResponse.json(candidates);
}
