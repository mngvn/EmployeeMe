import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatExpertiseLevel, formatAvailability, availabilityColor, expertiseColor } from "@/lib/utils";
import type { ExpertiseLevel, Availability } from "@/app/generated/prisma/client";

type SearchPageProps = {
  searchParams: Promise<{
    field?: string;
    level?: string;
    availability?: string;
    remote?: string;
    query?: string;
    page?: string;
  }>;
};

const EXPERTISE_LEVELS: ExpertiseLevel[] = ["INTERN", "ENTRY", "MID", "SENIOR", "LEAD", "PRINCIPAL", "EXECUTIVE"];
const PAGE_SIZE = 20;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYER") redirect("/dashboard");

  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const skip = (page - 1) * PAGE_SIZE;

  const levels = params.level
    ? (params.level.split(",").filter((l) => EXPERTISE_LEVELS.includes(l as ExpertiseLevel)) as ExpertiseLevel[])
    : undefined;

  const availabilities = params.availability
    ? (params.availability.split(",") as Availability[])
    : undefined;

  const [candidates, total, careerFields] = await Promise.all([
    prisma.employeeProfile.findMany({
      where: {
        visibility: { not: "HIDDEN" },
        ...(params.field ? { careerField: { slug: params.field } } : {}),
        ...(levels?.length ? { expertiseLevel: { in: levels } } : {}),
        ...(availabilities?.length ? { availabilityStatus: { in: availabilities } } : {}),
        ...(params.remote === "true" ? { openToRemote: true } : {}),
      },
      include: {
        careerField: true,
        skills: { include: { skill: true }, take: 4 },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.employeeProfile.count({
      where: {
        visibility: { not: "HIDDEN" },
        ...(params.field ? { careerField: { slug: params.field } } : {}),
        ...(levels?.length ? { expertiseLevel: { in: levels } } : {}),
        ...(availabilities?.length ? { availabilityStatus: { in: availabilities } } : {}),
        ...(params.remote === "true" ? { openToRemote: true } : {}),
      },
    }),
    prisma.careerField.findMany({ where: { parentId: null }, orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">EmployeeMe</Link>
        <div className="flex items-center gap-4">
          <Link href="/saved" className="text-sm text-gray-600 hover:text-gray-900">Saved</Link>
          <Link href="/messages" className="text-sm text-gray-600 hover:text-gray-900">Messages</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* Filter sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-8">
            <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>

            {/* Career field */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Career Field</p>
              <div className="space-y-1">
                <Link
                  href="/search"
                  className={`block text-sm px-2 py-1 rounded-lg ${!params.field ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  All fields
                </Link>
                {careerFields.map((f: (typeof careerFields)[number]) => (
                  <Link
                    key={f.id}
                    href={`/search?field=${f.slug}`}
                    className={`flex items-center gap-2 text-sm px-2 py-1 rounded-lg ${params.field === f.slug ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <span>{f.icon}</span>
                    <span className="truncate">{f.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Expertise level */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Expertise Level</p>
              <div className="flex flex-wrap gap-1.5">
                {EXPERTISE_LEVELS.map((level) => (
                  <span
                    key={level}
                    className={`text-xs px-2 py-1 rounded-full border ${levels?.includes(level) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}
                  >
                    {formatExpertiseLevel(level)}
                  </span>
                ))}
              </div>
            </div>

            {/* Remote */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Work Style</p>
              <Link
                href={params.remote === "true" ? "/search" : `?${new URLSearchParams({ ...params, remote: "true" })}`}
                className={`text-sm flex items-center gap-2 ${params.remote === "true" ? "text-blue-600 font-medium" : "text-gray-700"}`}
              >
                <span className={`h-4 w-4 rounded border flex items-center justify-center ${params.remote === "true" ? "bg-blue-600 border-blue-600 text-white text-xs" : "border-gray-300"}`}>
                  {params.remote === "true" && "✓"}
                </span>
                Remote only
              </Link>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> candidates
              {params.field && ` in ${careerFields.find((f: (typeof careerFields)[number]) => f.slug === params.field)?.name ?? params.field}`}
            </p>
          </div>

          {candidates.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium text-gray-600">No candidates match these filters</p>
              <Link href="/search" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((candidate: (typeof candidates)[number]) => (
                <Link
                  key={candidate.id}
                  href={`/candidates/${candidate.id}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-sm transition-all block"
                >
                  <div className="flex items-start gap-3">
                    {candidate.photoUrl ? (
                      <img src={candidate.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                        {candidate.displayName[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{candidate.displayName}</p>
                      <p className="text-sm text-gray-500 truncate">{candidate.headline}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${expertiseColor(candidate.expertiseLevel)}`}>
                      {formatExpertiseLevel(candidate.expertiseLevel)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${availabilityColor(candidate.availabilityStatus)}`}>
                      {formatAvailability(candidate.availabilityStatus)}
                    </span>
                    {candidate.openToRemote && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">Remote</span>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-1">{candidate.careerField.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((ps: (typeof candidate.skills)[number]) => (
                        <span key={ps.skillId} className="text-xs bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5 text-gray-600">
                          {ps.skill.name}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="text-xs text-gray-400">+{candidate.skills.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {candidate.location && (
                    <p className="mt-2 text-xs text-gray-400">📍 {candidate.location}</p>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              {page < totalPages && (
                <Link
                  href={`?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
