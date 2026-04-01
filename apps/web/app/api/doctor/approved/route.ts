import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const approved = await prisma.analysis.findMany({
      where: { reviewStatus: "approved", reviewedBy: session.user.id },
      orderBy: { reviewedAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json(approved);
  } catch (error) {
    console.error("Error fetching approved:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
