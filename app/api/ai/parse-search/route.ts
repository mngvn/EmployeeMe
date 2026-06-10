import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseSearchQuery } from "@/lib/anthropic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query } = await req.json();
  if (!query?.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const filters = await parseSearchQuery(query);
  return NextResponse.json(filters);
}
