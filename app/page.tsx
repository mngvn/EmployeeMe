import Link from "next/link";

const careerFieldHighlights = [
  { name: "Software Engineering", icon: "💻", count: "2,400+" },
  { name: "Data & Analytics", icon: "📊", count: "890+" },
  { name: "Design", icon: "🎨", count: "640+" },
  { name: "Product Management", icon: "🗺️", count: "520+" },
  { name: "Marketing", icon: "📣", count: "730+" },
  { name: "Finance & Accounting", icon: "💰", count: "410+" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">EmployeeMe</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700 mb-8">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Flipping the job search
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Employers find talent.
          <br />
          <span className="text-blue-600">Not the other way around.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          EmployeeMe inverts the job board. Candidates build rich profiles.
          Employers browse, filter, and reach out directly — no applications, no black holes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register?type=employer"
            className="rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
          >
            Find candidates →
          </Link>
          <Link
            href="/register?type=employee"
            className="rounded-lg border border-gray-200 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Create your profile
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">For Employers</p>
              <ol className="space-y-6">
                {[
                  ["Search by field & level", "Filter by career field, expertise level, skills, location, and remote availability."],
                  ["Browse candidate profiles", "See rich profiles with work history, skills, and availability status."],
                  ["Reach out directly", "Send a message to candidates you want to connect with — no intermediaries."],
                ].map(([title, desc], i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="text-gray-500 text-sm">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-4">For Job Seekers</p>
              <ol className="space-y-6">
                {[
                  ["Build your profile once", "Set your career field, expertise level, skills, experience, and availability."],
                  ["Control your visibility", "Be publicly visible, visible to verified employers only, or hidden entirely."],
                  ["Get found & contacted", "Let employers come to you — no more cover letters or application tracking."],
                ].map(([title, desc], i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="text-gray-500 text-sm">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Career Fields */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Browse by career field</h2>
          <p className="text-center text-gray-500 mb-12">Thousands of candidates across every profession</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {careerFieldHighlights.map((field) => (
              <Link
                key={field.name}
                href={`/search/${field.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl">{field.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{field.name}</p>
                  <p className="text-xs text-gray-400">{field.count} candidates</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/search" className="text-blue-600 text-sm font-medium hover:underline">
              View all career fields →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-blue-600 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to hire differently?</h2>
        <p className="text-blue-100 mb-8 max-w-md mx-auto">
          Join employers who skip the application pile and find the right person directly.
        </p>
        <Link
          href="/register?type=employer"
          className="inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-600 hover:bg-blue-50"
        >
          Start searching for free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        © 2026 EmployeeMe. The talent marketplace that works for everyone.
      </footer>
    </div>
  );
}
