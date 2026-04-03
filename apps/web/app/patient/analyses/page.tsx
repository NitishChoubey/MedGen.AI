import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

async function getAnalyses(userId: string) {
  const analyses = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      patientNote: true,
      summary: true,
      diagnoses: true,
      status: true,
      reviewStatus: true,
      processingTime: true,
      createdAt: true,
      originalFileName: true,
      finalSummary: true,
    },
  });

  return analyses;
}

export default async function AnalysesPage() {
  const session = await getServerSession(authOptions);
  const analyses = await getAnalyses(session!.user.id);

  const getStatusIcon = (status: string, reviewStatus?: string) => {
    if (reviewStatus === "approved") {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (reviewStatus === "pending_review") {
      return <Clock className="h-5 w-5 text-blue-600" />;
    }
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "PROCESSING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "FAILED":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string, reviewStatus?: string) => {
    if (reviewStatus === "approved") {
      return "bg-green-100 text-green-800";
    }
    if (reviewStatus === "pending_review") {
      return "bg-blue-100 text-blue-800";
    }
    if (reviewStatus === "ai_processing") {
      return "bg-yellow-100 text-yellow-800";
    }
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string, reviewStatus?: string) => {
    if (reviewStatus === "approved") return "Approved by Doctor";
    if (reviewStatus === "pending_review") return "Awaiting Doctor Review";
    if (reviewStatus === "ai_processing") return "AI Processing";
    if (reviewStatus === "rejected") return "Needs Revision";
    return status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Analyses</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review your medical document analyses
          </p>
        </div>
        <Link
          href="/patient/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          New Analysis
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Analyses
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {analyses.length}
              </p>
            </div>
            <Activity className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {analyses.filter((a) => a.status === "COMPLETED").length}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg. Processing Time
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {analyses.length > 0
                  ? (
                      analyses.reduce((sum, a) => sum + a.processingTime, 0) /
                      analyses.length
                    ).toFixed(1)
                  : "0"}
                s
              </p>
            </div>
            <Clock className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Analyses List */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow">
        {analyses.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {analyses.map((analysis) => {
              let diagnosesList: any[] = [];
              try {
                diagnosesList = JSON.parse(analysis.diagnoses);
              } catch (e) {
                // Keep empty array
              }

              return (
                <div
                  key={analysis.id}
                  className="p-6 hover:bg-gray-50 dark:bg-slate-950 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(analysis.status, analysis.reviewStatus)}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {analysis.originalFileName || `Analysis #${analysis.id.slice(0, 8)}`}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            analysis.status,
                            analysis.reviewStatus
                          )}`}
                        >
                          {getStatusLabel(analysis.status, analysis.reviewStatus)}
                        </span>
                      </div>

                      <div className="mt-2 space-y-2">
                        {analysis.patientNote && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Patient Note:</span>{" "}
                            {analysis.patientNote.substring(0, 150)}
                            {analysis.patientNote.length > 150 ? "..." : ""}
                          </p>
                        )}

                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">Summary:</span>{" "}
                          {(analysis.finalSummary || analysis.summary).substring(0, 200)}
                          {(analysis.finalSummary || analysis.summary).length > 200 ? "..." : ""}
                        </p>

                        {diagnosesList.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {diagnosesList.slice(0, 3).map((diagnosis: any, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {diagnosis.condition || diagnosis} 
                                {diagnosis.confidence && ` (${(diagnosis.confidence * 100).toFixed(0)}%)`}
                              </span>
                            ))}
                            {diagnosesList.length > 3 && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:text-gray-200">
                                +{diagnosesList.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{analysis.processingTime.toFixed(1)}s</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/results/${analysis.id}`}
                      className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:bg-slate-950"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <Activity className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No analyses yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Upload a medical document to get AI-powered analysis and insights
            </p>
            <div className="mt-6">
              <Link
                href="/patient/upload"
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="h-5 w-5 mr-2" />
                Upload Document
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
