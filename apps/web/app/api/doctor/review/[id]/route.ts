import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analysis = await prisma.analysis.findUnique({
      where: { id: params.id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, editedSummary, editedDiagnoses, editedFindings, reviewNotes } = body;

    const updateData: any = {
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      reviewNotes,
    };

    if (action === "approve") {
      updateData.reviewStatus = "approved";
      updateData.editedSummary = editedSummary;
      updateData.editedDiagnoses = editedDiagnoses;
      updateData.editedFindings = editedFindings;
      updateData.finalSummary = editedSummary;
      updateData.finalDiagnoses = editedDiagnoses;
      updateData.finalFindings = editedFindings;
    } else if (action === "reject") {
      updateData.reviewStatus = "rejected";
    }

    const updated = await prisma.analysis.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
