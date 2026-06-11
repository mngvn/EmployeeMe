"use client";

import { formatExpertiseLevel, formatAvailability, availabilityColor, expertiseColor } from "@/lib/utils";
import type { SwipeCandidate } from "./types";

type Props = {
  candidate: SwipeCandidate;
  dim?: boolean;
};

export function CandidateSwipeCard({ candidate, dim }: Props) {
  const startYear = (date: string) => new Date(date).getFullYear();

  return (
    <div
      className={`w-full h-full rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/5 ${
        dim ? "opacity-70 blur-[1px]" : ""
      }`}
      style={{ background: "linear-gradient(180deg, #1c1c2e 0%, #16161f 100%)" }}
    >
      {/* Photo / avatar header */}
      <div className="relative h-48 flex-shrink-0 bg-gradient-to-br from-indigo-900/60 to-purple-900/60 flex items-center justify-center">
        {candidate.photoUrl ? (
          <img
            src={candidate.photoUrl}
            alt=""
            className="w-full h-full object-cover object-top"
            draggable={false}
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white select-none">
            {candidate.displayName[0]}
          </div>
        )}
        {/* Field pill */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
            {candidate.careerField.icon && <span>{candidate.careerField.icon}</span>}
            {candidate.careerField.name}
          </span>
        </div>
        {/* Availability dot */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${availabilityColor(candidate.availabilityStatus)}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {formatAvailability(candidate.availabilityStatus)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none">
        {/* Name + headline */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold text-white leading-tight">{candidate.displayName}</h2>
            <span
              className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full mt-0.5 ${expertiseColor(candidate.expertiseLevel)}`}
            >
              {formatExpertiseLevel(candidate.expertiseLevel)}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">{candidate.headline}</p>
        </div>

        {/* Quick facts row */}
        <div className="flex flex-wrap gap-2 text-xs">
          {candidate.location && (
            <span className="text-gray-400 flex items-center gap-1">
              <span>📍</span> {candidate.location}
            </span>
          )}
          {candidate.yearsExperience != null && (
            <span className="text-gray-400">
              {candidate.yearsExperience} yr{candidate.yearsExperience !== 1 ? "s" : ""} exp
            </span>
          )}
          {candidate.openToRemote && (
            <span className="rounded-full bg-indigo-900/50 text-indigo-300 px-2 py-0.5">Remote ✓</span>
          )}
          {candidate.openToRelocation && (
            <span className="rounded-full bg-violet-900/50 text-violet-300 px-2 py-0.5">Open to relocate</span>
          )}
        </div>

        {/* Bio */}
        {candidate.bio && (
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{candidate.bio}</p>
        )}

        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((ps) => (
                <span
                  key={ps.skill.name}
                  className="text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-gray-200"
                >
                  {ps.skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work experience */}
        {candidate.workExperiences.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Experience</p>
            <div className="space-y-2">
              {candidate.workExperiences.map((w, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    💼
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{w.title}</p>
                    <p className="text-xs text-gray-500">
                      {w.company} · {startYear(w.startDate)}–{w.current ? "Present" : w.endDate ? startYear(w.endDate) : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {candidate.educations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Education</p>
            <div className="space-y-1">
              {candidate.educations.map((e, i) => (
                <div key={i} className="text-sm">
                  <span className="text-gray-200 font-medium">{e.institution}</span>
                  {e.degree && <span className="text-gray-400"> · {e.degree}{e.field ? ` in ${e.field}` : ""}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
