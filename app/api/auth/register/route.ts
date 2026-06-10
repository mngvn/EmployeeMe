import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";

export async function POST(req: Request) {
  const { email, password, role, name, companyName } = await req.json();

  if (!email || !password || !role || !name) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!["EMPLOYEE", "EMPLOYER"].includes(role)) {
    return NextResponse.json({ error: "Invalid account type." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: role as Role,
      ...(role === "EMPLOYER"
        ? {
            employerProfile: {
              create: {
                companyName: companyName ?? name,
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
}
