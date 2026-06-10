import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      careerField: true,
      skills: { include: { skill: true } },
      workExperiences: { orderBy: { startDate: "desc" } },
      educations: { orderBy: { startYear: "desc" } },
    },
  });

  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    displayName,
    headline,
    bio,
    location,
    careerFieldId,
    expertiseLevel,
    yearsExperience,
    openToRemote,
    openToRelocation,
    availabilityStatus,
    visibility,
  } = body;

  const profile = await prisma.employeeProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      displayName,
      headline,
      bio,
      location,
      careerFieldId,
      expertiseLevel,
      yearsExperience,
      openToRemote,
      openToRelocation,
      availabilityStatus,
      visibility,
    },
    update: {
      displayName,
      headline,
      bio,
      location,
      careerFieldId,
      expertiseLevel,
      yearsExperience,
      openToRemote,
      openToRelocation,
      availabilityStatus,
      visibility,
    },
  });

  return NextResponse.json(profile);
}
