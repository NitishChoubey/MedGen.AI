import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// FastAPI backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, JPG, and PNG are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Create initial analysis record with ai_processing status
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        patientNote: "",
        patientName: session.user.name || "Patient",
        documentType: file.type === "application/pdf" ? "medical_report" : "medical_image",
        originalFileName: file.name,
        summary: "Processing...",
        diagnoses: "[]",
        findings: "[]",
        citations: "[]",
        processingTime: 0,
        status: "PROCESSING",
        reviewStatus: "ai_processing",
        sharedWith: "[]",
        tags: "[]",
      },
    });

    // Process the file asynchronously
    processFileAsync(file, analysis.id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully. Processing...",
      analysisId: analysis.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

async function processFileAsync(file: File, analysisId: string, userId: string) {
  const startTime = Date.now();

  try {
    let extractedText = "";

    // Extract text from PDF
    if (file.type === "application/pdf") {
      try {
        // Try to extract text using FastAPI backend
        const pdfFormData = new FormData();
        pdfFormData.append("file", file);

        const extractResponse = await fetch(`${API_URL}/extract_pdf`, {
          method: "POST",
          body: pdfFormData,
        });

        if (extractResponse.ok) {
          const extractData = await extractResponse.json();
          extractedText = extractData.text || "";
        }
      } catch (extractError) {
        console.error("PDF extraction error:", extractError);
        // Fallback: Use placeholder text if extraction fails
        extractedText = `Medical document uploaded: ${file.name}. Text extraction unavailable - please ensure the FastAPI service is running.`;
      }
    } else {
      // For images, we would use OCR in production
      extractedText = `Medical image uploaded: ${file.name}. Image analysis pending.`;
    }

    if (!extractedText || extractedText.length < 10) {
      extractedText = `Medical document: ${file.name}. Unable to extract text content.`;
    }

    // Get AI analysis from FastAPI
    let aiResult = {
      summary: "Document uploaded successfully. Awaiting AI analysis.",
      diagnoses: [],
      citations: [],
      findings: [],
    };

    try {
      const analyzeResponse = await fetch(`${API_URL}/summarize_hypothesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: extractedText,
          top_k: 5,
        }),
      });

      if (analyzeResponse.ok) {
        const analysisData = await analyzeResponse.json();
        aiResult = {
          summary: analysisData.summary || "Summary not available",
          diagnoses: analysisData.diagnoses || analysisData.differential_diagnoses || [],
          citations: analysisData.citations || analysisData.evidence || [],
          findings: analysisData.input_findings || analysisData.findings || [],
        };
      }
    } catch (analyzeError) {
      console.error("AI analysis error:", analyzeError);
      aiResult.summary = "AI analysis service unavailable. Document saved for manual review.";
    }

    const processingTime = (Date.now() - startTime) / 1000;

    // Update the analysis record with results
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        patientNote: extractedText,
        summary: aiResult.summary,
        diagnoses: JSON.stringify(aiResult.diagnoses),
        findings: JSON.stringify(aiResult.findings),
        citations: JSON.stringify(aiResult.citations),
        processingTime: processingTime,
        status: "COMPLETED",
        reviewStatus: "pending_review", // Ready for doctor review
      },
    });

    console.log(`Analysis ${analysisId} completed in ${processingTime}s`);
  } catch (processError) {
    console.error("Processing error:", processError);

    // Update status to failed
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: "FAILED",
        reviewStatus: "ai_processing",
        summary: "Processing failed. Please try uploading again.",
      },
    });
  }
}
