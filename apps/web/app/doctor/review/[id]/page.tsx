"use client";

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
        const res = await fetch(`/api/doctor/review/${params.id}`);
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
      const res = await fetch(`/api/doctor/review/${params.id}`, {
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
      const res = await fetch(`/api/doctor/review/${params.id}`, {
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
          <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isEditing ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
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
            <AlertCircle className={`h-5 w-5 ${review.priority === "urgent" ? "text-red-500" : "text-green-500"}`} />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Priority</p><p className={`font-medium ${review.priority === "urgent" ? "text-red-600" : "text-green-600"}`}>{review.priority?.toUpperCase() || "NORMAL"}</p></div>
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
              <textarea value={editedSummary} onChange={(e) => setEditedSummary(e.target.value)} className="w-full h-40 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white placeholder-gray-400" />
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
          <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Enter your review notes here..." className="w-full h-32 p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
      </div>
    </div>
  );
}
