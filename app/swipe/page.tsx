import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SwipeInterface } from "@/components/swipe/SwipeInterface";

export default async function SwipePage() {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYER") redirect("/dashboard");

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!employer) redirect("/dashboard");

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

  const interestedCount = await prisma.swipeDecision.count({
    where: { employerProfileId: employer.id, decision: "INTERESTED" },
  });

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <a href="/dashboard" className="text-lg font-bold text-white">
          EmployeeMe
        </a>
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-400">
            <span className="text-green-400 font-semibold">{interestedCount}</span> interested
          </span>
          <a href="/saved" className="text-sm text-gray-400 hover:text-white">
            View shortlist →
          </a>
        </div>
      </header>

      {/* Swipe area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <SwipeInterface initialCandidates={JSON.parse(JSON.stringify(candidates))} />
      </div>
    </div>
  );
}
