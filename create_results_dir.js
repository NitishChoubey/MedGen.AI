const fs = require('fs');
const path = require('path');

const dir = path.join('d:', 'MedGen.AI', 'apps', 'web', 'app', 'results', '[id]');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log('Created directory:', dir);
} else {
  console.log('Directory already exists:', dir);
}

// Create the page.tsx file content
const pageContent = `import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  Activity,
  Beaker,
  Stethoscope,
  BookOpen,
  User,
  Shield,
} from "lucide-react";

interface Props {
  params: { id: string };
}

async function getAnalysis(id: string, userId: string) {
  const analysis = await prisma.analysis.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return analysis;
}

export default async function AnalysisDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const analysis = await getAnalysis(params.id, session.user.id);

  if (!analysis) {
    notFound();
  }

  // Parse JSON fields safely
  const parseJSON = (str: string | null, fallback: any = []) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  };

  const diagnoses = parseJSON(analysis.finalDiagnoses || analysis.diagnoses, []);
  const findings = parseJSON(analysis.finalFindings || analysis.findings, []);
  const citations = parseJSON(analysis.citations, []);
  const recommendations = parseJSON(analysis.recommendations, []);
  const riskFactors = parseJSON(analysis.riskFactors, []);
  const medications = parseJSON(analysis.medications, []);

  const summary = analysis.finalSummary || analysis.summary;
  const isApproved = analysis.reviewStatus === "approved";
  const isPending = analysis.reviewStatus === "pending_review";
  const isProcessing = analysis.reviewStatus === "ai_processing";

  const getStatusBadge = () => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4" />
          Approved by Doctor
        </span>
      );
    }
    if (isPending) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <Clock className="h-4 w-4" />
          Awaiting Doctor Review
        </span>
      );
    }
    if (isProcessing) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Activity className="h-4 w-4 animate-pulse" />
          AI Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        <FileText className="h-4 w-4" />
        {analysis.status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/patient/analyses"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {analysis.originalFileName || "Medical Analysis"}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {analysis.processingTime.toFixed(1)}s processing
                  </span>
                </div>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {!isApproved && (
          <div className={\`mb-6 p-4 rounded-xl border \${
            isPending
              ? "bg-blue-50 border-blue-200"
              : "bg-yellow-50 border-yellow-200"
          }\`}>
            <div className="flex items-start gap-3">
              {isPending ? (
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              ) : (
                <Activity className="h-5 w-5 text-yellow-600 mt-0.5 animate-pulse" />
              )}
              <div>
                <h3 className={\`font-medium \${isPending ? "text-blue-800" : "text-yellow-800"}\`}>
                  {isPending
                    ? "Awaiting Doctor Review"
                    : "Analysis in Progress"}
                </h3>
                <p className={\`text-sm mt-1 \${isPending ? "text-blue-700" : "text-yellow-700"}\`}>
                  {isPending
                    ? "A medical professional will review and verify this analysis. You'll be notified once approved."
                    : "Our AI is processing your document. This usually takes a few minutes."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Verified Badge */}
        {isApproved && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800">
                  Verified by Medical Professional
                </h3>
                <p className="text-sm mt-1 text-green-700">
                  This analysis has been reviewed and approved by a licensed doctor.
                  {analysis.reviewedAt && (
                    <span className="block mt-1">
                      Reviewed on{" "}
                      {new Date(analysis.reviewedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Analysis Summary
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {summary || "No summary available yet."}
              </p>
            </div>

            {/* Diagnoses */}
            {diagnoses.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Potential Diagnoses
                  </h2>
                </div>
                <div className="space-y-4">
                  {diagnoses.map((diagnosis: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {typeof diagnosis === "string"
                              ? diagnosis
                              : diagnosis.condition || diagnosis.name}
                          </h3>
                          {diagnosis.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {diagnosis.description}
                            </p>
                          )}
                        </div>
                        {diagnosis.confidence && (
                          <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {(diagnosis.confidence * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Findings */}
            {findings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Beaker className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Key Findings
                  </h2>
                </div>
                <ul className="space-y-3">
                  {findings.map((finding: any, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {typeof finding === "string" ? finding : finding.description || finding.finding}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recommendations
                  </h2>
                </div>
                <ul className="space-y-3">
                  {recommendations.map((rec: any, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">
                        {typeof rec === "string" ? rec : rec.recommendation || rec.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Citations */}
            {citations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Medical References
                  </h2>
                </div>
                <div className="space-y-3">
                  {citations.map((citation: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-indigo-50 rounded-lg border border-indigo-100"
                    >
                      <p className="text-sm text-indigo-900">
                        <span className="font-medium">[{index + 1}]</span>{" "}
                        {typeof citation === "string"
                          ? citation
                          : citation.title || citation.source || citation.text}
                      </p>
                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                        >
                          View source →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Risk Factors
                  </h2>
                </div>
                <ul className="space-y-2">
                  {riskFactors.map((risk: any, index: number) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <span className="w-2 h-2 bg-orange-400 rounded-full" />
                      {typeof risk === "string" ? risk : risk.factor || risk.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medications */}
            {medications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Activity className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Medications Mentioned
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medications.map((med: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-teal-50 text-teal-700 text-sm rounded-full border border-teal-200"
                    >
                      {typeof med === "string" ? med : med.name || med.medication}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Document Info
                </h2>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Document Type</dt>
                  <dd className="text-gray-900 font-medium">
                    {analysis.documentType || "Medical Report"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Uploaded</dt>
                  <dd className="text-gray-900">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Processing Time</dt>
                  <dd className="text-gray-900">{analysis.processingTime.toFixed(1)}s</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Model Version</dt>
                  <dd className="text-gray-900">{analysis.modelVersion}</dd>
                </div>
              </dl>
            </div>

            {/* Patient Note */}
            {analysis.patientNote && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Your Notes
                  </h2>
                </div>
                <p className="text-sm text-gray-700">{analysis.patientNote}</p>
              </div>
            )}

            {/* Doctor's Notes (if approved) */}
            {isApproved && analysis.reviewNotes && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Doctor's Notes
                  </h2>
                </div>
                <p className="text-sm text-gray-700">{analysis.reviewNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const pagePath = path.join(dir, 'page.tsx');
fs.writeFileSync(pagePath, pageContent);
console.log('Created page:', pagePath);
