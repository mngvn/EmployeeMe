import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProfileTips } from "@/lib/anthropic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: session.user.id },
    include: { careerField: true, skills: { include: { skill: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const stream = await getProfileTips({
    displayName: profile.displayName,
    headline: profile.headline,
    bio: profile.bio,
    careerField: profile.careerField.name,
    expertiseLevel: profile.expertiseLevel,
    yearsExperience: profile.yearsExperience,
    skills: profile.skills.map((ps: { skill: { name: string } }) => ps.skill.name),
    openToRemote: profile.openToRemote,
    location: profile.location,
  });

  const message = await stream.finalMessage();
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ tips: [] });
  }

  try {
    const tips = JSON.parse(textBlock.text.replace(/```json\n?|\n?```/g, "").trim());
    return NextResponse.json({ tips });
  } catch {
    return NextResponse.json({ tips: [] });
  }
}
