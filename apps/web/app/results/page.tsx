"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SummarizeResp } from "@/lib/api";

export default function ResultsPage() {
  const [resp, setResp] = useState<SummarizeResp | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem('analysisResults');
    if (data) {
      setResp(JSON.parse(data));
    } else {
      // If no data, redirect back to upload
      router.push('/upload');
    }
  }, [router]);

  if (!resp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="glass border-b border-white/10 sticky top-0 z-50 shadow-xl backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-purple-500/20">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-display gradient-text tracking-tight">
                  MedGen.AI
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">Clinical Analysis Results</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/upload')}
              className="px-4 sm:px-6 py-2.5 sm:py-3 glass hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">New Analysis</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-5 sm:p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-green-500/30">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Analysis Complete</h2>
                <p className="text-green-300 text-xs sm:text-sm">AI-powered clinical assessment generated successfully</p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="relative glass-strong rounded-3xl overflow-hidden shadow-2xl animate-slide-in-right card-hover">
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-black font-display text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl ring-1 ring-white/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                Clinical Summary
              </h2>
            </div>
            <div className="p-6 sm:p-8">
              <div className="prose prose-invert max-w-none">
                <p className="text-white leading-relaxed text-sm sm:text-base">{resp.summary}</p>
              </div>
            </div>
          </div>

          {/* Ranked Diagnoses Card */}
          {resp.ranked_diagnoses && resp.ranked_diagnoses.length > 0 && (
            <div className="relative glass-strong rounded-3xl overflow-hidden shadow-2xl animate-slide-in-right animation-delay-100">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-black font-display text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl ring-1 ring-white/20">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  Prioritized Differential Diagnoses
                </h2>
                <p className="text-purple-100 text-xs sm:text-sm mt-2">Ranked by confidence score with severity indicators</p>
              </div>
              <div className="p-6 sm:p-8 space-y-4 sm:space-y-5">
                {resp.ranked_diagnoses.map((diagnosis) => {
                  // Color coding based on confidence
                  const confidenceColor = diagnosis.confidence >= 75 
                    ? 'from-green-500 to-emerald-600' 
                    : diagnosis.confidence >= 50 
                    ? 'from-yellow-500 to-orange-500' 
                    : 'from-red-500 to-rose-600';
                  
                  const confidenceBg = diagnosis.confidence >= 75 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : diagnosis.confidence >= 50 
                    ? 'bg-yellow-500/20 border-yellow-500/30' 
                    : 'bg-red-500/20 border-red-500/30';

                  // Severity badge colors
                  const severityColors = {
                    Critical: 'bg-red-600 border-red-500 text-white',
                    High: 'bg-orange-500 border-orange-400 text-white',
                    Medium: 'bg-yellow-500 border-yellow-400 text-gray-900',
                    Low: 'bg-green-500 border-green-400 text-white'
                  };

                  return (
                    <div key={diagnosis.rank} className="group">
                      <div className={`p-5 sm:p-6 ${confidenceBg} backdrop-blur-xl rounded-2xl border hover:border-opacity-60 transition-all duration-300 card-hover`}>
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-4 gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            {/* Rank Badge */}
                            <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${confidenceColor} flex items-center justify-center shadow-lg ring-2 ring-white/10 flex-shrink-0`}>
                              <div className={`absolute inset-0 bg-gradient-to-br ${confidenceColor} rounded-xl blur-lg opacity-50`}></div>
                              <span className="relative text-white text-base sm:text-lg font-black">#{diagnosis.rank}</span>
                            </div>
                            
                            {/* Condition Name */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl font-bold text-white truncate">{diagnosis.condition}</h3>
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{diagnosis.source}</span>
                              </p>
                            </div>
                          </div>

                          {/* Severity Badge */}
                          <span className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black border ${severityColors[diagnosis.severity]} shadow-lg flex items-center gap-1 flex-shrink-0`}>
                            {diagnosis.severity === 'Critical' && (
                              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className="hidden sm:inline">{diagnosis.severity}</span>
                            <span className="sm:hidden">{diagnosis.severity.charAt(0)}</span>
                          </span>
                        </div>

                        {/* Confidence Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-300">Confidence Score</span>
                            <span className="text-sm font-black text-white">{diagnosis.confidence.toFixed(1)}%</span>
                          </div>
                          <div className="relative h-2.5 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${confidenceColor} rounded-full transition-all duration-1000 ease-out`}
                              style={{ width: `${diagnosis.confidence}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-gray-200 leading-relaxed mb-4 pl-2 sm:pl-3 border-l-2 border-white/20">
                          {diagnosis.description}
                        </p>

                        {/* Supporting Findings */}
                        {diagnosis.supporting_findings.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              Supporting Findings ({diagnosis.supporting_findings.length})
                            </p>
                            <div className="grid gap-2">
                              {diagnosis.supporting_findings.map((finding, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-2.5 sm:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                  <span className="flex-shrink-0 inline-block px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/30 text-xs font-semibold text-purple-300">
                                    {finding.category}
                                  </span>
                                  <span className="text-xs text-gray-300 italic flex-1 min-w-0 break-words">&quot;{finding.text}&quot;</span>
                                  <span className="text-xs font-bold text-purple-400 flex-shrink-0">
                                    {(finding.relevance * 100).toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metrics Breakdown - Collapsible */}
                        <details className="mt-4 pt-4 border-t border-white/10 group/details">
                          <summary className="cursor-pointer text-xs font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4 transition-transform group-open/details:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Confidence Metrics Breakdown
                          </summary>
                          <div className="mt-3 space-y-2 pl-6">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Rank Score (Evidence Position)</span>
                              <span className="font-bold text-white">{diagnosis.metrics.confidence_breakdown.rank_score.toFixed(1)} pts</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Findings Match Score</span>
                              <span className="font-bold text-white">{diagnosis.metrics.confidence_breakdown.findings_score.toFixed(1)} pts</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Relevance Score</span>
                              <span className="font-bold text-white">{diagnosis.metrics.confidence_breakdown.relevance_score.toFixed(1)} pts</span>
                            </div>
                            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                              <span className="text-gray-300 font-semibold">Total Findings Matched</span>
                              <span className="font-black text-white">{diagnosis.metrics.total_findings}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-300 font-semibold">Average Relevance</span>
                              <span className="font-black text-white">{(diagnosis.metrics.avg_relevance * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Differential & Plan Card */}
          <div className="relative glass-strong rounded-3xl overflow-hidden shadow-2xl animate-slide-in-right animation-delay-200 card-hover">
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-black font-display text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl ring-1 ring-white/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                Differential Diagnosis & Clinical Plan
              </h2>
            </div>
            <div className="p-6 sm:p-8">
              <div className="prose prose-invert max-w-none">
                <p className="text-white leading-relaxed whitespace-pre-wrap font-mono text-xs sm:text-sm">{resp.differential_and_plan}</p>
              </div>
            </div>
          </div>

          {/* Input Findings Card - Traceability */}
          {resp.input_findings && resp.input_findings.length > 0 && (
            <div className="relative glass-strong rounded-3xl overflow-hidden shadow-2xl animate-slide-in-right animation-delay-200">
              <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-black font-display text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl ring-1 ring-white/20">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Key Findings from Patient Note
                </h2>
                <p className="text-purple-100 text-xs sm:text-sm mt-2">Traced evidence from your input text</p>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {resp.input_findings.map((finding, idx) => (
                    <div key={idx} className="p-3 sm:p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 card-hover">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/30 text-xs font-bold text-purple-300">
                            {finding.category}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic break-words">&quot;{finding.text}&quot;</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Evidence Card */}
          <div className="relative glass-strong rounded-3xl overflow-hidden shadow-2xl animate-slide-in-right animation-delay-300">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-black font-display text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl ring-1 ring-white/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                Evidence Base
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-2">Top {resp.citations.length} most relevant medical knowledge citations</p>
            </div>
            <div className="p-6 sm:p-8">
              <div className="space-y-3 sm:space-y-4">
                {resp.citations.map((c) => (
                  <div key={c.rank} className="flex gap-3 sm:gap-4 p-4 sm:p-5 glass rounded-2xl hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300 group card-hover">
                    <div className="flex-shrink-0">
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ring-2 ring-emerald-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-lg opacity-50"></div>
                        <span className="relative text-white text-xs sm:text-sm font-black">{c.rank}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-200 leading-relaxed mb-3 break-words">{c.passage}</p>
                      
                      {/* Show matching findings from input */}
                      {c.matching_findings && c.matching_findings.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs font-bold text-emerald-300 mb-2 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Supports findings from your note:
                          </p>
                          <div className="space-y-1.5">
                            {c.matching_findings.map((mf, midx) => (
                              <div key={midx} className="flex items-start gap-2 text-xs">
                                <span className="flex-shrink-0 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></span>
                                <span className="text-gray-300 italic">&quot;{mf.text}&quot;</span>
                                <span className="text-emerald-400 font-semibold ml-auto">
                                  {(mf.relevance * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-3">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-bold text-emerald-400">{c.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-6 sm:pt-8">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-100 transition-all duration-300 flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="text-sm sm:text-base">Print Report</span>
            </button>
            <button
              onClick={() => router.push('/upload')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 glass hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm sm:text-base">Analyze Another Document</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
