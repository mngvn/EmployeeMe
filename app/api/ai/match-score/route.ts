import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreCandidate } from "@/lib/anthropic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { candidateId, hiringSignalId } = await req.json();

  const [candidate, hiringSignal] = await Promise.all([
    prisma.employeeProfile.findUnique({
      where: { id: candidateId },
      include: {
        careerField: true,
        skills: { include: { skill: true } },
        workExperiences: true,
      },
    }),
    hiringSignalId
      ? prisma.hiringSignal.findUnique({
          where: { id: hiringSignalId },
          include: { careerField: true },
        })
      : null,
  ]);

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const score = await scoreCandidate(
    {
      name: candidate.displayName,
      headline: candidate.headline,
      careerField: candidate.careerField.name,
      expertiseLevel: candidate.expertiseLevel,
      yearsExperience: candidate.yearsExperience,
      skills: candidate.skills.map((ps: { skill: { name: string } }) => ps.skill.name),
      openToRemote: candidate.openToRemote,
      workExperiences: candidate.workExperiences.map((w: { title: string; company: string }) => ({
        title: w.title,
        company: w.company,
      })),
    },
    hiringSignal ?? { description: "General talent search" }
  );

  return NextResponse.json(score ?? { score: 0, rationale: "Unable to score", highlights: [], gaps: [] });
}
