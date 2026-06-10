import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function parseSearchQuery(query: string) {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Parse this talent search query into structured filters. Return only valid JSON.

Query: "${query}"

Return JSON with these optional fields:
{
  "careerField": string | null,
  "expertiseLevel": "INTERN"|"ENTRY"|"MID"|"SENIOR"|"LEAD"|"PRINCIPAL"|"EXECUTIVE" | null,
  "skills": string[],
  "openToRemote": boolean | null,
  "minYearsExperience": number | null,
  "location": string | null
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    return {};
  }
}

export async function getProfileTips(profile: Record<string, unknown>) {
  const stream = anthropic.messages.stream({
    model: "claude-opus-4-8",
    thinking: { type: "adaptive" },
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a career coach helping a job seeker improve their profile on a talent discovery platform where employers browse candidate profiles.

Analyze this profile and give 3-5 specific, actionable suggestions to make it more discoverable and compelling to employers. Be direct and specific.

Profile:
${JSON.stringify(profile, null, 2)}

Return a JSON array of suggestions:
[{ "title": "Short title", "description": "Specific action to take", "impact": "high"|"medium"|"low" }]`,
      },
    ],
  });

  return stream;
}

export async function scoreCandidate(
  candidateProfile: Record<string, unknown>,
  hiringSignal: Record<string, unknown>
) {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-8",
    thinking: { type: "adaptive" },
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Score how well this candidate fits this employer's hiring need. Return only valid JSON.

Hiring Signal:
${JSON.stringify(hiringSignal, null, 2)}

Candidate Profile:
${JSON.stringify(candidateProfile, null, 2)}

Return:
{
  "score": 0-100,
  "rationale": "1-2 sentences explaining the score",
  "highlights": ["top matching strength 1", "top matching strength 2"],
  "gaps": ["potential gap 1"]
}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") return null;

  try {
    return JSON.parse(text.text.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    return null;
  }
}
