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

    const [pendingReviews, approvedToday, totalApproved, urgentCases] = await Promise.all([
      prisma.analysis.count({
        where: { reviewStatus: "pending_review" },
      }),
      prisma.analysis.count({
        where: {
          reviewStatus: "approved",
          reviewedBy: session.user.id,
          reviewedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.analysis.count({
        where: {
          reviewStatus: "approved",
          reviewedBy: session.user.id,
        },
      }),
      prisma.analysis.count({
        where: {
          reviewStatus: "pending_review",
          priority: "urgent",
        },
      }),
    ]);

    return NextResponse.json({
      pendingReviews,
      approvedToday,
      totalApproved,
      urgentCases,
    });
  } catch (error) {
    console.error("Error fetching doctor stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
