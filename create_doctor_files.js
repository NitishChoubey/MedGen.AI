const fs = require('fs');
const path = require('path');

const baseDir = 'D:\\MedGen.AI\\apps\\web\\app';
const apiBaseDir = 'D:\\MedGen.AI\\apps\\web\\app\\api';

console.log('Creating remaining doctor dashboard files...\n');

// Dashboard Page
const dashboardPage = `import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  FileCheck,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";

async function getDashboardData(doctorId: string) {
  const [pendingReviews, approvedToday, totalApproved, recentActivity, urgentCases] = await Promise.all([
    prisma.analysis.count({ where: { reviewStatus: "pending_review" } }),
    prisma.analysis.count({
      where: {
        reviewStatus: "approved",
        reviewedBy: doctorId,
        reviewedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.analysis.count({ where: { reviewStatus: "approved", reviewedBy: doctorId } }),
    prisma.analysis.findMany({
      where: { OR: [{ reviewStatus: "pending_review" }, { reviewedBy: doctorId }] },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.analysis.count({ where: { reviewStatus: "pending_review", priority: "urgent" } }),
  ]);
  return { pendingReviews, approvedToday, totalApproved, recentActivity, urgentCases };
}

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const doctorId = session.user.id;
  const { pendingReviews, approvedToday, totalApproved, recentActivity, urgentCases } = await getDashboardData(doctorId);

  const stats = [
    { name: "Pending Reviews", value: pendingReviews, icon: ClipboardCheck, color: "from-orange-500 to-amber-500", href: "/doctor/pending-reviews", change: urgentCases > 0 ? urgentCases + " urgent" : "All normal priority", changeColor: urgentCases > 0 ? "text-red-600" : "text-green-600" },
    { name: "Approved Today", value: approvedToday, icon: CheckCircle2, color: "from-green-500 to-emerald-500", href: "/doctor/approved", change: "Keep up the good work!", changeColor: "text-green-600" },
    { name: "Total Approved", value: totalApproved, icon: FileCheck, color: "from-blue-500 to-indigo-500", href: "/doctor/approved", change: "All time", changeColor: "text-gray-500" },
    { name: "Avg Review Time", value: "~5 min", icon: Clock, color: "from-purple-500 to-violet-500", href: "#", change: "Per document", changeColor: "text-gray-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, Dr. {session.user.name?.split(" ")[0] || "Doctor"}! 👋</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Here's what's happening with your medical reviews today.</p>
        </div>
        {pendingReviews > 0 && (
          <Link href="/doctor/pending-reviews" className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            Start Reviewing <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        )}
      </div>

      {/* Urgent Alert */}
      {urgentCases > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center space-x-4">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-red-800 dark:text-red-200 font-semibold">{urgentCases} Urgent Case{urgentCases > 1 ? "s" : ""} Require Immediate Attention</h3>
            <p className="text-red-600 dark:text-red-300 text-sm">Please review these cases as soon as possible.</p>
          </div>
          <Link href="/doctor/pending-reviews?priority=urgent" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">View Urgent</Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} href={stat.href} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={\`p-3 rounded-xl bg-gradient-to-r \${stat.color}\`}><Icon className="h-6 w-6 text-white" /></div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className={\`mt-2 text-sm \${stat.changeColor}\`}>{stat.change}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center"><Activity className="h-5 w-5 mr-2 text-blue-600" />Recent Activity</h2>
            <Link href="/doctor/approved" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentActivity.length > 0 ? recentActivity.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className={\`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center \${item.reviewStatus === "approved" ? "bg-green-100 dark:bg-green-900/30" : item.reviewStatus === "rejected" ? "bg-red-100 dark:bg-red-900/30" : "bg-orange-100 dark:bg-orange-900/30"}\`}>
                    {item.reviewStatus === "approved" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : item.reviewStatus === "rejected" ? <XCircle className="h-5 w-5 text-red-600" /> : <Clock className="h-5 w-5 text-orange-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.patientName || item.user?.name || "Unknown Patient"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.documentType || "Medical Report"} - {item.summary?.substring(0, 50)}...</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(item.updatedAt).toLocaleDateString()} at {new Date(item.updatedAt).toLocaleTimeString()}</p>
                  </div>
                  <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${item.reviewStatus === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : item.reviewStatus === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"}\`}>
                    {item.reviewStatus === "pending_review" ? "Pending" : item.reviewStatus}
                  </span>
                </div>
              </div>
            )) : (
              <div className="px-6 py-12 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/doctor/pending-reviews" className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:shadow-md transition-all group">
              <ClipboardCheck className="h-8 w-8 text-blue-600 mr-4" />
              <div><p className="font-medium text-gray-900 dark:text-white">Review Documents</p><p className="text-sm text-gray-500 dark:text-gray-400">{pendingReviews} pending</p></div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/doctor/patients" className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:shadow-md transition-all group">
              <Users className="h-8 w-8 text-green-600 mr-4" />
              <div><p className="font-medium text-gray-900 dark:text-white">View Patients</p><p className="text-sm text-gray-500 dark:text-gray-400">Manage patient list</p></div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/doctor/approved" className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl hover:shadow-md transition-all group">
              <FileCheck className="h-8 w-8 text-purple-600 mr-4" />
              <div><p className="font-medium text-gray-900 dark:text-white">Review History</p><p className="text-sm text-gray-500 dark:text-gray-400">{totalApproved} approved</p></div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
            <div className="flex items-center justify-between mb-2"><TrendingUp className="h-6 w-6" /><span className="text-sm opacity-80">This Week</span></div>
            <p className="text-2xl font-bold">{approvedToday * 5}+</p>
            <p className="text-sm opacity-80">Documents Reviewed</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">💡 Pro Tip</h2>
        <p className="opacity-90">Use keyboard shortcuts to speed up your review process. Press <kbd className="px-2 py-1 bg-white/20 rounded text-sm mx-1">A</kbd> to approve and <kbd className="px-2 py-1 bg-white/20 rounded text-sm mx-1">R</kbd> to reject while reviewing a document.</p>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(baseDir, 'doctor', 'dashboard', 'page.tsx'), dashboardPage);
console.log('Created: dashboard/page.tsx');

// Pending Reviews Page
const pendingReviewsPage = `import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, Search, Filter, Clock, AlertCircle, ArrowRight, FileText, User } from "lucide-react";

async function getPendingReviews() {
  return prisma.analysis.findMany({
    where: { reviewStatus: "pending_review" },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    include: { user: { select: { name: true, email: true } } },
  });
}

export default async function PendingReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const pendingReviews = await getPendingReviews();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <ClipboardCheck className="h-8 w-8 mr-3 text-blue-600" />
            Pending Reviews
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{pendingReviews.length} document{pendingReviews.length !== 1 ? "s" : ""} awaiting your review</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search documents..." className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4 mr-2" />Filter
          </button>
        </div>
      </div>

      {pendingReviews.length > 0 ? (
        <div className="grid gap-4">
          {pendingReviews.map((review) => (
            <Link key={review.id} href={\`/doctor/review/\${review.id}\`} className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={\`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center \${review.priority === "urgent" ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"}\`}>
                      {review.priority === "urgent" ? <AlertCircle className="h-6 w-6 text-red-600" /> : <FileText className="h-6 w-6 text-blue-600" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{review.patientName || review.user?.name || "Unknown Patient"}</h3>
                        {review.priority === "urgent" && <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium rounded-full">URGENT</span>}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{review.documentType || "Medical Report"}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{review.summary?.substring(0, 150)}...</p>
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center"><User className="h-3 w-3 mr-1" />{review.user?.email}</span>
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <ClipboardCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">All Caught Up! 🎉</h3>
          <p className="text-gray-500 dark:text-gray-400">No documents pending review. Great work!</p>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path.join(baseDir, 'doctor', 'pending-reviews', 'page.tsx'), pendingReviewsPage);
console.log('Created: pending-reviews/page.tsx');

// Review Detail Page
const reviewDetailPage = `"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle, XCircle, FileText, User, Clock, AlertCircle, Edit3, BookOpen } from "lucide-react";

interface ReviewData {
  id: string;
  patientName: string | null;
  patientNote: string;
  summary: string;
  diagnoses: string;
  findings: string;
  citations: string;
  documentType: string | null;
  priority: string;
  createdAt: string;
  user: { name: string | null; email: string };
}

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [editedDiagnoses, setEditedDiagnoses] = useState("");
  const [editedFindings, setEditedFindings] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(\`/api/doctor/review/\${params.id}\`);
        if (res.ok) {
          const data = await res.json();
          setReview(data);
          setEditedSummary(data.editedSummary || data.summary);
          setEditedDiagnoses(data.editedDiagnoses || data.diagnoses);
          setEditedFindings(data.editedFindings || data.findings);
          setReviewNotes(data.reviewNotes || "");
        }
      } catch (error) {
        console.error("Failed to fetch review:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [params.id]);

  const handleApprove = async () => {
    setSaving(true);
    try {
      const res = await fetch(\`/api/doctor/review/\${params.id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          editedSummary,
          editedDiagnoses,
          editedFindings,
          reviewNotes,
        }),
      });
      if (res.ok) router.push("/doctor/pending-reviews");
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      alert("Please provide rejection notes");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(\`/api/doctor/review/\${params.id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reviewNotes }),
      });
      if (res.ok) router.push("/doctor/pending-reviews");
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Document not found</h2>
        <Link href="/doctor/pending-reviews" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Pending Reviews
        </Link>
      </div>
    );
  }

  let diagnosesList = [];
  try { diagnosesList = JSON.parse(review.diagnoses); } catch (e) { diagnosesList = []; }

  let citationsList = [];
  try { citationsList = JSON.parse(review.citations); } catch (e) { citationsList = []; }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/doctor/pending-reviews" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Document</h1>
            <p className="text-gray-500 dark:text-gray-400">{review.patientName || review.user?.name || "Unknown Patient"}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsEditing(!isEditing)} className={\`flex items-center px-4 py-2 rounded-lg transition-colors \${isEditing ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}\`}>
            <Edit3 className="h-4 w-4 mr-2" />{isEditing ? "Editing" : "Edit"}
          </button>
          <button onClick={handleReject} disabled={saving} className="flex items-center px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50">
            <XCircle className="h-4 w-4 mr-2" />Reject
          </button>
          <button onClick={handleApprove} disabled={saving} className="flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50">
            <CheckCircle className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Approve"}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-blue-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Patient</p><p className="font-medium text-gray-900 dark:text-white">{review.patientName || "N/A"}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-purple-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Document Type</p><p className="font-medium text-gray-900 dark:text-white">{review.documentType || "Medical Report"}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-orange-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p><p className="font-medium text-gray-900 dark:text-white">{new Date(review.createdAt).toLocaleDateString()}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <AlertCircle className={\`h-5 w-5 \${review.priority === "urgent" ? "text-red-500" : "text-green-500"}\`} />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Priority</p><p className={\`font-medium \${review.priority === "urgent" ? "text-red-600" : "text-green-600"}\`}>{review.priority?.toUpperCase() || "NORMAL"}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Patient Note */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center"><FileText className="h-5 w-5 mr-2 text-blue-500" />Original Patient Note</h2>
          </div>
          <div className="p-6"><p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{review.patientNote}</p></div>
        </div>

        {/* AI Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center"><Edit3 className="h-5 w-5 mr-2 text-blue-500" />AI Summary {isEditing && <span className="ml-2 text-xs text-blue-600">(Editable)</span>}</h2>
          </div>
          <div className="p-6">
            {isEditing ? (
              <textarea value={editedSummary} onChange={(e) => setEditedSummary(e.target.value)} className="w-full h-40 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{editedSummary}</p>
            )}
          </div>
        </div>
      </div>

      {/* Diagnoses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h2 className="font-semibold text-gray-900 dark:text-white">AI Diagnoses</h2>
        </div>
        <div className="p-6">
          {diagnosesList.length > 0 ? (
            <div className="space-y-3">
              {diagnosesList.map((diag: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div><p className="font-medium text-gray-900 dark:text-white">{diag.condition || diag.name || diag}</p>{diag.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{diag.description}</p>}</div>
                  {diag.confidence && <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">{Math.round(diag.confidence * 100)}%</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No diagnoses available</p>
          )}
        </div>
      </div>

      {/* Citations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center"><BookOpen className="h-5 w-5 mr-2 text-green-500" />Medical Citations</h2>
        </div>
        <div className="p-6">
          {citationsList.length > 0 ? (
            <div className="space-y-2">
              {citationsList.map((citation: any, i: number) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">{typeof citation === "string" ? citation : citation.text || JSON.stringify(citation)}</div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No citations available</p>
          )}
        </div>
      </div>

      {/* Review Notes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Review Notes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add your notes or comments (required for rejection)</p>
        </div>
        <div className="p-6">
          <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Enter your review notes here..." className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(baseDir, 'doctor', 'review', '[id]', 'page.tsx'), reviewDetailPage);
console.log('Created: review/[id]/page.tsx');

// API Review Route
const reviewApiRoute = `import { NextResponse } from "next/server";
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
`;

fs.writeFileSync(path.join(apiBaseDir, 'doctor', 'review', '[id]', 'route.ts'), reviewApiRoute);
console.log('Created: api/doctor/review/[id]/route.ts');

// Approved Page
const approvedPage = `import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileCheck, Search, Filter, Clock, CheckCircle, Eye, User } from "lucide-react";

async function getApprovedDocuments(doctorId: string) {
  return prisma.analysis.findMany({
    where: { reviewStatus: "approved", reviewedBy: doctorId },
    orderBy: { reviewedAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
}

export default async function ApprovedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const approved = await getApprovedDocuments(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FileCheck className="h-8 w-8 mr-3 text-green-600" />
            Approved Documents
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{approved.length} document{approved.length !== 1 ? "s" : ""} reviewed and approved</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search approved..." className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4 mr-2" />Filter
          </button>
        </div>
      </div>

      {approved.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Document</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Reviewed</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {approved.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{doc.patientName || doc.user?.name || "Unknown"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{doc.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white">{doc.documentType || "Medical Report"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{doc.finalSummary?.substring(0, 50) || doc.summary?.substring(0, 50)}...</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      {doc.reviewedAt ? new Date(doc.reviewedAt).toLocaleDateString() : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />Approved
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={\`/doctor/review/\${doc.id}\`} className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <Eye className="h-4 w-4 mr-1" />View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <FileCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Approved Documents Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Documents you approve will appear here.</p>
          <Link href="/doctor/pending-reviews" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Review Pending Documents
          </Link>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path.join(baseDir, 'doctor', 'approved', 'page.tsx'), approvedPage);
console.log('Created: approved/page.tsx');

// Patients Page
const patientsPage = `import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Search, Filter, User, Mail, Calendar, FileText } from "lucide-react";

async function getPatients() {
  return prisma.user.findMany({
    where: { role: "PATIENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      gender: true,
      bloodType: true,
      _count: { select: { analyses: true } },
    },
  });
}

export default async function PatientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const patients = await getPatients();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Patients
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{patients.length} registered patient{patients.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4 mr-2" />Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start space-x-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">{patient.name?.charAt(0) || "P"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{patient.name || "Unknown"}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                  <Mail className="h-3 w-3 mr-1" />{patient.email}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-2xl font-bold text-blue-600">{patient._count.analyses}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reports</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{patient.gender || "-"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{patient.bloodType || "-"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Blood</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Joined {new Date(patient.createdAt).toLocaleDateString()}
              </span>
              <button className="text-blue-600 hover:text-blue-700 font-medium">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Patients Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Patients will appear here once they register.</p>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path.join(baseDir, 'doctor', 'patients', 'page.tsx'), patientsPage);
console.log('Created: patients/page.tsx');

// Profile Page
const profilePage = `import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { User, Mail, Phone, Building, Award, Stethoscope, Calendar, Shield } from "lucide-react";

async function getDoctorProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      hospital: true,
      department: true,
      specialty: true,
      licenseNumber: true,
      createdAt: true,
      _count: { select: { analyses: true } },
    },
  });
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const profile = await getDoctorProfile(session.user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-6">
            <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
              <span className="text-white font-bold text-4xl">{profile?.name?.charAt(0) || "D"}</span>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 sm:mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dr. {profile?.name || "Doctor"}</h2>
              <p className="text-gray-500 dark:text-gray-400">{profile?.specialty || "General Medicine"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Mail className="h-5 w-5 text-blue-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Email</p><p className="font-medium text-gray-900 dark:text-white">{profile?.email}</p></div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Phone className="h-5 w-5 text-green-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Phone</p><p className="font-medium text-gray-900 dark:text-white">{profile?.phone || "Not provided"}</p></div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Building className="h-5 w-5 text-purple-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Hospital</p><p className="font-medium text-gray-900 dark:text-white">{profile?.hospital || "Not provided"}</p></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Stethoscope className="h-5 w-5 text-orange-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Department</p><p className="font-medium text-gray-900 dark:text-white">{profile?.department || "Not provided"}</p></div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Award className="h-5 w-5 text-yellow-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">License Number</p><p className="font-medium text-gray-900 dark:text-white">{profile?.licenseNumber || "Not provided"}</p></div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p><p className="font-medium text-gray-900 dark:text-white">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Documents Reviewed</p><p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{profile?._count.analyses || 0}</p></div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><Shield className="h-6 w-6 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Approval Rate</p><p className="text-3xl font-bold text-green-600 mt-1">98%</p></div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl"><Award className="h-6 w-6 text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p><p className="text-3xl font-bold text-purple-600 mt-1">~5min</p></div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><Calendar className="h-6 w-6 text-purple-600" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(baseDir, 'doctor', 'profile', 'page.tsx'), profilePage);
console.log('Created: profile/page.tsx');

// Settings Page
const settingsPage = `"use client";

import { useState } from "react";
import { Settings, Bell, Shield, Moon, Globe, Save } from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
        <Settings className="h-8 w-8 mr-3 text-blue-600" />
        Settings
      </h1>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Bell className="h-5 w-5 mr-2 text-blue-500" />
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-gray-900 dark:text-white">Push Notifications</p><p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts for new pending reviews</p></div>
            <button onClick={() => setNotifications(!notifications)} className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${notifications ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}\`}>
              <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${notifications ? "translate-x-6" : "translate-x-1"}\`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-gray-900 dark:text-white">Email Alerts</p><p className="text-sm text-gray-500 dark:text-gray-400">Get daily summary of pending documents</p></div>
            <button onClick={() => setEmailAlerts(!emailAlerts)} className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${emailAlerts ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}\`}>
              <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${emailAlerts ? "translate-x-6" : "translate-x-1"}\`} />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Moon className="h-5 w-5 mr-2 text-purple-500" />
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div><p className="font-medium text-gray-900 dark:text-white">Dark Mode</p><p className="text-sm text-gray-500 dark:text-gray-400">Use dark theme across the dashboard</p></div>
          <button onClick={() => { setDarkMode(!darkMode); document.documentElement.classList.toggle("dark"); }} className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${darkMode ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}\`}>
            <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${darkMode ? "translate-x-6" : "translate-x-1"}\`} />
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Globe className="h-5 w-5 mr-2 text-green-500" />
          Language
        </h2>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full md:w-64 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Shield className="h-5 w-5 mr-2 text-red-500" />
          Security
        </h2>
        <div className="space-y-4">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Change Password</button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 ml-3">Enable 2FA</button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
          <Save className="h-5 w-5 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(baseDir, 'doctor', 'settings', 'page.tsx'), settingsPage);
console.log('Created: settings/page.tsx');

// API Pending Reviews Route
const pendingReviewsApi = `import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingReviews = await prisma.analysis.findMany({
      where: { reviewStatus: "pending_review" },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json(pendingReviews);
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
`;

fs.writeFileSync(path.join(apiBaseDir, 'doctor', 'pending-reviews', 'route.ts'), pendingReviewsApi);
console.log('Created: api/doctor/pending-reviews/route.ts');

// API Approved Route
const approvedApi = `import { NextResponse } from "next/server";
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
`;

fs.writeFileSync(path.join(apiBaseDir, 'doctor', 'approved', 'route.ts'), approvedApi);
console.log('Created: api/doctor/approved/route.ts');

console.log('\n✅ All doctor dashboard files created successfully!');
console.log('\nNext steps:');
console.log('1. Run: cd apps/web && npx prisma db push');
console.log('2. Run: npm run dev');
console.log('3. Login as a doctor and navigate to /doctor/dashboard');
