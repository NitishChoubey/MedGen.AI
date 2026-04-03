"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SummarizeResp } from "../lib/api";

export default function ResultsPage() {
  const [resp, setResp] = useState<SummarizeResp | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem('analysisResults');
    if (data) {
      setResp(JSON.parse(data));
    } else {
      router.push('/upload');
    }
  }, [router]);

  if (!resp) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-500 dark:border-indigo-900 dark:border-t-indigo-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 dark:text-slate-300 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300 pb-24">
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
                MedGen.AI
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Clinical Analysis Results</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/upload')}
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white dark:bg-slate-900 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:text-slate-200 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">New Analysis</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Success Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm animate-fade-in-up">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-300">Analysis Complete</h2>
            <p className="text-emerald-700 dark:text-emerald-400/80 text-sm mt-0.5">AI-powered clinical assessment generated successfully.</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-4 sm:p-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Clinical Summary</h2>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">{resp.summary}</p>
          </div>
        </div>

        {/* Ranked Diagnoses Grid */}
        {resp.ranked_diagnoses && resp.ranked_diagnoses.length > 0 && (
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
               <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
               Prioritized Diagnoses
            </h2>
            <div className="grid gap-5">
              {resp.ranked_diagnoses.map((diagnosis) => {
                const confidenceColor = diagnosis.confidence >= 75 
                  ? 'bg-emerald-500 dark:bg-emerald-400' 
                  : diagnosis.confidence >= 50 
                  ? 'bg-amber-500 dark:bg-amber-400' 
                  : 'bg-rose-500 dark:bg-rose-400';

                const badgeColors = {
                  Critical: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
                  High: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
                  Medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
                  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                };

                return (
                  <div key={diagnosis.rank} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-6">
                      {/* Left Column: Heading & Severity */}
                      <div className="md:w-1/3 flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                            #{diagnosis.rank}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{diagnosis.condition}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              {diagnosis.source}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={"px-2.5 py-1 text-xs font-semibold rounded-md border "}>
                            {diagnosis.severity} Severity
                          </span>
                        </div>
                        <div className="mt-2 md:mt-auto">
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="text-slate-600 dark:text-slate-400">Confidence</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{diagnosis.confidence.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${confidenceColor} rounded-full`} style={{ width: `${diagnosis.confidence}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Details & Findings */}
                      <div className="md:w-2/3 md:border-l md:border-slate-100 md:dark:border-slate-800 md:pl-6 flex flex-col gap-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-300 leading-relaxed">
                          {diagnosis.description}
                        </p>

                        {diagnosis.supporting_findings.length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-950 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              Key Supporting Findings
                            </p>
                            <div className="grid gap-2">
                              {diagnosis.supporting_findings.slice(0, 3).map((finding, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mt-0.5 uppercase tracking-wide">
                                    {finding.category}
                                  </span>
                                  <span className="text-slate-600 dark:text-slate-400 italic flex-1">&quot;{finding.text}&quot;</span>
                                  <span className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                                    {Math.round(finding.relevance * 100)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Metrics Details */}
                        <details className="group cursor-pointer">
                          <summary className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 select-none">
                            <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            View scoring breakdown
                          </summary>
                          <div className="mt-3 pl-5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between"><span>Rank Score:</span> <span className="font-medium text-slate-900 dark:text-white dark:text-slate-200">{diagnosis.metrics.confidence_breakdown.rank_score.toFixed(1)}</span></div>
                            <div className="flex justify-between"><span>Findings Match:</span> <span className="font-medium text-slate-900 dark:text-white dark:text-slate-200">{diagnosis.metrics.confidence_breakdown.findings_score.toFixed(1)}</span></div>
                            <div className="flex justify-between"><span>Relevance:</span> <span className="font-medium text-slate-900 dark:text-white dark:text-slate-200">{diagnosis.metrics.confidence_breakdown.relevance_score.toFixed(1)}</span></div>
                            <div className="flex justify-between"><span>Findings Count:</span> <span className="font-medium text-slate-900 dark:text-white dark:text-slate-200">{diagnosis.metrics.total_findings}</span></div>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Split Layout: Plan + Traceability */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          
          {/* Plan Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="border-b border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-500/10 p-4 sm:p-5 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h2 className="font-semibold text-rose-900 dark:text-rose-200">Clinical Plan</h2>
            </div>
            <div className="p-5 sm:p-6 flex-1">
              <div className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
                {resp.differential_and_plan}
              </div>
            </div>
          </div>

          {/* Traceability Card */}
          {resp.input_findings && resp.input_findings.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="border-b border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-500/10 p-4 sm:p-5 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-purple-900 dark:text-purple-200">Extracted Findings</h2>
                <p className="text-[10px] sm:text-xs text-purple-600/80 dark:text-purple-400/80 mt-0.5">Direct trace from input text</p>
              </div>
            </div>
            <div className="p-5 sm:p-6 flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex flex-col gap-3">
                {resp.input_findings.map((finding, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-900 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-300 uppercase tracking-wider shrink-0 mt-0.5">
                      {finding.category}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">&quot;{finding.text}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Evidence Card */}
        {resp.citations && resp.citations.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="border-b border-teal-100 dark:border-teal-900/30 bg-teal-50/50 dark:bg-teal-500/10 p-4 sm:p-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-teal-900 dark:text-teal-200">Evidence Base</h2>
              <p className="text-xs text-teal-600/80 dark:text-teal-400/80 mt-0.5">Reference material supporting analysis</p>
            </div>
          </div>
          <div className="p-5 sm:p-6 divide-y divide-slate-100 dark:divide-slate-800">
            {resp.citations.map((c) => (
              <div key={c.rank} className="py-5 first:pt-0 last:pb-0">
                <div className="flex gap-4 flex-col sm:flex-row">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {c.rank}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">{c.passage}</p>
                    
                    {c.matching_findings && c.matching_findings.length > 0 && (
                      <div className="bg-teal-50/50 dark:bg-teal-900/10 rounded-lg p-3 mt-3 border border-teal-100/50 dark:border-teal-800/50">
                        <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wide">Matched Findings:</p>
                        <div className="space-y-1.5">
                          {c.matching_findings.slice(0, 2).map((mf, midx) => (
                            <div key={midx} className="flex items-start justify-between text-xs">
                              <span className="text-slate-600 dark:text-slate-400 italic">&quot;{mf.text}&quot;</span>
                              <span className="text-teal-600 dark:text-teal-400 font-medium ml-4">{(mf.relevance * 100).toFixed(0)}% ref</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Source: <span className="font-medium text-slate-700 dark:text-slate-300">{c.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Global Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
          <button
            onClick={() => router.push('/upload')}
            className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 dark:bg-slate-800 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:text-slate-200 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Analyze Another Client Note
          </button>
        </div>

      </div>
    </main>
  );
}
