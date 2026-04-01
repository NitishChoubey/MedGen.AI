import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Access denied. Patient role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          patientNote: true,
          patientId: true,
          summary: true,
          diagnoses: true,
          findings: true,
          citations: true,
          processingTime: true,
          modelVersion: true,
          status: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.analysis.count({ where }),
    ]);

    // Parse JSON fields
    const parsedAnalyses = analyses.map((analysis) => {
      let diagnosesList = [];
      let findingsList = [];
      let citationsList = [];
      let tagsList = [];

      try {
        if (analysis.diagnoses) {
          diagnosesList = JSON.parse(analysis.diagnoses);
        }
      } catch (e) {
        // Keep empty array
      }

      try {
        if (analysis.findings) {
          findingsList = JSON.parse(analysis.findings);
        }
      } catch (e) {
        // Keep empty array
      }

      try {
        if (analysis.citations) {
          citationsList = JSON.parse(analysis.citations);
        }
      } catch (e) {
        // Keep empty array
      }

      try {
        if (analysis.tags) {
          tagsList = JSON.parse(analysis.tags);
        }
      } catch (e) {
        // Keep empty array
      }

      return {
        ...analysis,
        diagnoses: diagnosesList,
        findings: findingsList,
        citations: citationsList,
        tags: tagsList,
      };
    });

    return NextResponse.json({
      analyses: parsedAnalyses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Access denied. Patient role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { patientNote, patientId } = body;

    if (!patientNote) {
      return NextResponse.json(
        { error: "Patient note is required" },
        { status: 400 }
      );
    }

    // Create a new analysis with PENDING status
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        patientNote,
        patientId: patientId || null,
        summary: "",
        diagnoses: JSON.stringify([]),
        findings: JSON.stringify([]),
        citations: JSON.stringify([]),
        processingTime: 0,
        status: "PENDING",
        sharedWith: JSON.stringify([]),
        tags: JSON.stringify([]),
      },
    });

    return NextResponse.json({
      message: "Analysis created successfully",
      analysisId: analysis.id,
    });
  } catch (error) {
    console.error("Error creating analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
