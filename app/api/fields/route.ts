import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const fields = await prisma.careerField.findMany({
    orderBy: { name: "asc" },
    include: { subcategories: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json(fields);
}
