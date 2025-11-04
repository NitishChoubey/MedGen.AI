"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { extractPdf, summarizeHypothesize, SummarizeResp } from "@/lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [topK, setTopK] = useState(4);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<SummarizeResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleExtract() {
    if (!file) { setErr("Select a PDF first."); return; }
    setErr(null); setResp(null); setLoading(true);
    try {
      const { text } = await extractPdf(file);
      setText(text || "");
    } catch (e: any) {
      setErr(e?.response?.data || e?.message || "Extract failed.");
    } finally { setLoading(false); }
  }

  async function generate() {
    if (!text.trim()) { setErr("No text to process."); return; }
    setErr(null); setResp(null); setLoading(true);
    try {
      const data = await summarizeHypothesize(text.trim(), topK);
      // Store results in sessionStorage and navigate to results page
      sessionStorage.setItem('analysisResults', JSON.stringify(data));
      router.push('/results');
    } catch (e: any) {
      setErr(e?.response?.data || e?.message || "Generation failed.");
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="glass-effect-strong border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/10">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black font-display bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
                  MedGen.AI
                </h1>
                <p className="text-sm text-gray-300 font-medium tracking-wide">AI-Powered Medical Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10">
                <div className="relative">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-emerald-400 text-sm font-bold">AI Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Upload', active: !!file },
              { num: 2, label: 'Extract', active: !!text },
              { num: 3, label: 'Analyze', active: !!resp }
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 ${
                    step.active
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/50 scale-110 border-2 border-cyan-400/30'
                      : 'bg-white/5 border-2 border-white/10 text-gray-600'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <span className={`relative ${step.active ? 'text-white' : 'text-gray-500'}`}>{step.num}</span>
                  </div>
                  <span className={`text-sm font-bold ${step.active ? 'text-cyan-400' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 ${
                      idx === 0 ? (text ? 'w-full' : 'w-0') : (resp ? 'w-full' : 'w-0')
                    }`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* File Upload Card */}
            <div className="relative glass-effect rounded-3xl border border-white/20 overflow-hidden shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 p-6">
                <h2 className="text-xl font-black font-display text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  Upload Medical Document
                </h2>
              </div>
              <div className="p-8">
                <div
                  className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                  onClick={() => inputRef.current?.click()}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform border border-cyan-400/20">
                    <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {file ? (
                    <div className="space-y-3">
                      <p className="text-lg font-bold text-white">{file.name}</p>
                      <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm font-bold border border-green-500/30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Ready
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-bold text-gray-300 mb-2">Click to upload or drag & drop</p>
                      <p className="text-sm text-gray-500">PDF files only • Max 10MB</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleExtract}
                  disabled={!file || loading}
                  className="mt-6 w-full px-8 py-5 bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 text-white rounded-2xl font-black text-lg tracking-wide hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden group/btn border-2 border-cyan-400/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-3">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Extracting Text...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Extract Text from PDF
                      </>
                    )}
                  </span>
                </button>

                {err && (
                  <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3 animate-shake-error">
                    <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-red-300">Error</p>
                      <p className="text-sm text-red-200">{err}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Note Card */}
            <div className="relative glass-effect rounded-3xl border border-white/20 overflow-hidden shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 p-6">
                <h2 className="text-xl font-black font-display text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Medical Note
                </h2>
              </div>
              <div className="p-8">
                <textarea
                  className="w-full h-80 bg-white/5 border-2 border-white/10 rounded-2xl p-5 text-white placeholder-gray-500 focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all resize-none text-sm leading-relaxed backdrop-blur-xl"
                  placeholder="📄 Extracted text will appear here...

You can also paste or type medical notes directly for instant analysis."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <p className="mt-3 text-xs text-gray-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {text.length} characters • {text.split(/\s+/).filter(w => w).length} words
                </p>
              </div>
            </div>

            {/* Analysis Settings */}
            <div className="relative glass-effect rounded-3xl border border-white/20 overflow-hidden shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6">
                <h2 className="text-xl font-black font-display text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  Knowledge Base Evidence
                </h2>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                    className="flex-1 h-3 slider-modern rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(14 165 233) 0%, rgb(6 182 212) ${((topK - 2) / 4) * 100}%, rgba(6, 182, 212, 0.1) ${((topK - 2) / 4) * 100}%, rgba(6, 182, 212, 0.1) 100%)`
                    }}
                  />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 border-2 border-blue-400/30">
                    <span className="text-3xl font-black text-white">{topK}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/10">
                  💡 Retrieves <span className="text-cyan-400 font-bold">{topK}</span> most relevant medical knowledge passages from our AI database to support the differential diagnosis.
                </p>

                <button
                  onClick={generate}
                  disabled={!text.trim() || loading}
                  className="mt-6 w-full px-8 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl font-black text-lg tracking-wide hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden group/btn border-2 border-blue-400/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-3">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Generate AI Analysis
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Ready Message */}
          <div className="space-y-6">
            <div className="relative glass-effect rounded-3xl border border-white/20 p-20 text-center shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="relative w-32 h-32 mx-auto mb-8 animate-float">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center border border-cyan-400/20">
                  <svg className="w-16 h-16 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-black font-display text-white mb-4">Ready for AI Analysis</h3>
              <p className="text-gray-300 max-w-md mx-auto leading-relaxed">Upload a medical document or paste text to generate comprehensive AI-powered clinical summaries, differential diagnoses, and evidence-based recommendations.</p>
              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-cyan-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>Analysis results will open in a new page</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
