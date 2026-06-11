import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatExpertiseLevel, formatAvailability, availabilityColor } from "@/lib/utils";
import type { CareerField } from "@/app/generated/prisma/client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { role, id } = session.user;

  if (role === "EMPLOYER") {
    return <EmployerDashboard userId={id} />;
  }

  return <EmployeeDashboard userId={id} />;
}

async function EmployeeDashboard({ userId }: { userId: string }) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    include: {
      careerField: true,
      skills: { include: { skill: true }, take: 5 },
    },
  });

  const completionItems = profile
    ? [
        { label: "Basic info", done: !!(profile.displayName && profile.headline) },
        { label: "Bio", done: !!profile.bio },
        { label: "Photo", done: !!profile.photoUrl },
        { label: "Resume", done: !!profile.resumeUrl },
        { label: "Skills", done: profile.skills.length > 0 },
        { label: "Work experience", done: false },
      ]
    : [];

  const completionPct = profile
    ? Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">EmployeeMe</Link>
        <div className="flex items-center gap-4">
          <Link href="/profile/edit" className="text-sm text-gray-600 hover:text-gray-900">Edit profile</Link>
          <Link href="/messages" className="text-sm text-gray-600 hover:text-gray-900">Messages</Link>
          <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">Settings</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile ? `Welcome back, ${profile.displayName}` : "Welcome to EmployeeMe"}
          </h1>
          <p className="text-gray-500 mt-1">
            {profile
              ? "Here's how your profile is doing."
              : "Let's build your profile so employers can find you."}
          </p>
        </div>

        {!profile && (
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-blue-900">Complete your profile to get discovered</h2>
              <p className="text-blue-700 text-sm mt-1">Employers can&apos;t find you until your profile is set up.</p>
            </div>
            <Link
              href="/profile/edit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Build profile
            </Link>
          </div>
        )}

        {profile && (
          <>
            {/* Profile completion */}
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Profile completion</h2>
                <span className="text-2xl font-bold text-blue-600">{completionPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {completionItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <span className={item.done ? "text-green-500" : "text-gray-300"}>
                      {item.done ? "✓" : "○"}
                    </span>
                    <span className={item.done ? "text-gray-700" : "text-gray-400"}>{item.label}</span>
                  </div>
                ))}
              </div>
              {completionPct < 100 && (
                <Link
                  href="/profile/edit"
                  className="mt-4 inline-block text-sm text-blue-600 font-medium hover:underline"
                >
                  Complete your profile →
                </Link>
              )}
            </div>

            {/* Status + stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border border-gray-100 p-5">
                <p className="text-sm text-gray-500 mb-2">Availability</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${availabilityColor(profile.availabilityStatus)}`}>
                  {formatAvailability(profile.availabilityStatus)}
                </span>
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 p-5">
                <p className="text-sm text-gray-500 mb-1">Profile views</p>
                <p className="text-3xl font-bold text-gray-900">{profile.profileViews}</p>
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 p-5">
                <p className="text-sm text-gray-500 mb-1">Expertise level</p>
                <p className="text-lg font-semibold text-gray-900">{formatExpertiseLevel(profile.expertiseLevel)}</p>
              </div>
            </div>

            {/* Profile preview link */}
            <div className="rounded-2xl bg-white border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Your public profile</p>
                <p className="text-sm text-gray-500">{profile.careerField.name} · {formatExpertiseLevel(profile.expertiseLevel)}</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/profile/preview"
                  className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
                >
                  Preview
                </Link>
                <Link
                  href="/profile/edit"
                  className="text-sm text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"
                >
                  Edit
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

async function EmployerDashboard({ userId }: { userId: string }) {
  const employer = await prisma.employerProfile.findUnique({
    where: { userId },
    include: {
      savedCandidates: {
        include: {
          employee: {
            include: { careerField: true },
          },
        },
        take: 5,
        orderBy: { savedAt: "desc" },
      },
      hiringSignals: {
        where: { active: true },
        include: { careerField: true },
      },
    },
  });

  const totalCandidates = await prisma.employeeProfile.count({
    where: { visibility: { not: "HIDDEN" } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">EmployeeMe</Link>
        <div className="flex items-center gap-4">
          <Link href="/swipe" className="text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">🃏 Swipe</Link>
          <Link href="/search" className="text-sm font-medium text-blue-600 hover:text-blue-700">Search candidates</Link>
          <Link href="/saved" className="text-sm text-gray-600 hover:text-gray-900">Saved</Link>
          <Link href="/messages" className="text-sm text-gray-600 hover:text-gray-900">Messages</Link>
          <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">Settings</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {employer ? `${employer.companyName} Dashboard` : "Welcome to EmployeeMe"}
          </h1>
          <p className="text-gray-500 mt-1">Find the right people for your team.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">Candidates available</p>
            <p className="text-3xl font-bold text-gray-900">{totalCandidates.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">across all fields</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">Saved candidates</p>
            <p className="text-3xl font-bold text-gray-900">{employer?.savedCandidates.length ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">Active hiring signals</p>
            <p className="text-3xl font-bold text-gray-900">{employer?.hiringSignals.length ?? 0}</p>
          </div>
        </div>

        {/* Swipe mode CTA */}
        <div className="rounded-2xl p-6 text-white flex items-center justify-between" style={{ background: "linear-gradient(135deg, #1c1c2e 0%, #2d1b69 100%)" }}>
          <div>
            <h2 className="font-semibold text-lg">🃏 Swipe through candidates</h2>
            <p className="text-gray-300 text-sm mt-1">
              Tinder-style review — swipe right to add to your interview queue.
            </p>
          </div>
          <Link
            href="/swipe"
            className="rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-400 whitespace-nowrap"
          >
            Start swiping →
          </Link>
        </div>

        {/* Quick search CTA */}
        <div className="rounded-2xl bg-blue-600 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Start searching for candidates</h2>
            <p className="text-blue-100 text-sm mt-1">
              Filter by career field, expertise level, skills, and more.
            </p>
          </div>
          <Link
            href="/search"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 whitespace-nowrap"
          >
            Open search →
          </Link>
        </div>

        {/* Saved candidates */}
        {employer && employer.savedCandidates.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recently saved</h2>
              <Link href="/saved" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {employer.savedCandidates.map((saved: (typeof employer.savedCandidates)[number]) => (
                <Link
                  key={saved.employeeProfileId}
                  href={`/candidates/${saved.employeeProfileId}`}
                  className="flex items-center justify-between rounded-xl border border-gray-50 hover:border-gray-100 hover:bg-gray-50 p-3 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{saved.employee.displayName}</p>
                    <p className="text-sm text-gray-500">
                      {saved.employee.careerField.name} · {formatExpertiseLevel(saved.employee.expertiseLevel)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(saved.savedAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Career field grid */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Browse by career field</h2>
          <SearchByFieldGrid />
        </div>
      </div>
    </div>
  );
}

async function SearchByFieldGrid() {
  const fields = await prisma.careerField.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    take: 12,
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {fields.map((field: CareerField) => (
        <Link
          key={field.id}
          href={`/search?field=${field.slug}`}
          className="rounded-xl border border-gray-100 p-3 text-center hover:border-blue-200 hover:bg-blue-50 transition-colors"
        >
          <div className="text-2xl mb-1">{field.icon}</div>
          <p className="text-xs font-medium text-gray-700 leading-tight">{field.name}</p>
        </Link>
      ))}
    </div>
  );
}
