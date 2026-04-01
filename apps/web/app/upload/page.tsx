"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { extractPdf, summarizeHypothesize, SummarizeResp } from "../lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [topK, setTopK] = useState(4);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleExtract(selectedFile: File) {
    setFile(selectedFile);
    setErr(null); 
    setExtracting(true);
    try {
      const { text } = await extractPdf(selectedFile);
      setText(text || "");
    } catch (e: any) {
      setErr(e?.response?.data || e?.message || "Extract failed.");
    } finally { setExtracting(false); }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleExtract(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") {
      handleExtract(f);
    } else if (f) {
      setErr("Please upload a PDF file.");
    }
  };

  async function generate() {
    if (!text.trim()) { setErr("No text to process."); return; }
    setErr(null); 
    setLoading(true);
    try {
      const data = await summarizeHypothesize(text.trim(), topK);
      sessionStorage.setItem('analysisResults', JSON.stringify(data));
      router.push('/results');
    } catch (e: any) {
      setErr(e?.response?.data || e?.message || "Generation failed.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">MedGen<span className="text-slate-9000">.AI</span></span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               System Online
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 lg:grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
              Clinical Note Analysis
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Upload a patient's medical document or paste clinical notes to generate a differential diagnosis instantly.
            </p>
          </div>

          <div className="space-y-4">
             <label className="text-sm font-medium text-slate-700">1. Upload Source Document</label>
             <div 
               onDragOver={(e) => e.preventDefault()}
               onDrop={handleDrop}
               onClick={() => inputRef.current?.click()}
               className={`group border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 text-center ${file ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-200 hover:border-slate-300 bg-white/90/50 hover:bg-slate-100/50'}`}
             >
               <input
                 ref={inputRef}
                 type="file"
                 accept="application/pdf"
                 className="hidden"
                 onChange={handleFileChange}
               />
               <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${file ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-100 text-slate-600 group-hover:text-slate-700'}`}>
                 {extracting ? (
                   <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                 ) : file ? (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 ) : (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                   </svg>
                 )}
               </div>
               <div>
                  {extracting ? (
                    <span className="text-slate-700 font-medium">Extracting text...</span>
                  ) : file ? (
                    <span className="text-indigo-300 font-medium">{file.name}</span>
                  ) : (
                    <>
                      <span className="text-slate-700 font-medium block">Click to upload or drag and drop</span>
                      <span className="text-slate-9000 text-xs mt-1 block">PDF files only (Max 10MB)</span>
                    </>
                  )}
               </div>
             </div>
             
             {err && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span>{err}</span>
                </div>
              )}
          </div>

          <div className="space-y-4 pt-4">
             <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Analysis Depth (Evidence)</label>
                <span className="text-xs text-slate-9000">{topK} Passages</span>
             </div>
             <input
               type="range"
               min={2}
               max={8}
               value={topK}
               onChange={(e) => setTopK(parseInt(e.target.value))}
               className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
             />
             <p className="text-xs text-slate-9000 leading-relaxed">
               Controls how many medical knowledge passages are retrieved to support the diagnosis. A higher depth considers more sources.
             </p>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col mt-12 lg:mt-0 space-y-6 h-[600px] lg:h-auto">
           <div className="flex-1 bg-white/90 border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-xl">
             <div className="bg-white/90/50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
               <label className="text-sm font-medium text-slate-700">2. Review & Edit Clinical Note</label>
               <span className="text-xs font-mono text-slate-9000 bg-slate-100 px-2 py-1 rounded-md">
                 {text.split(/\s+/).filter(w => w).length} words
               </span>
             </div>
             <textarea
                className="w-full h-full min-h-[300px] bg-transparent p-5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0 resize-none text-sm md:text-base leading-relaxed"
                placeholder="The extracted text from your PDF will appear here.

You can also type or paste a clinical note manually..."
                value={text}
                onChange={(e) => setText(e.target.value)}
             />
           </div>

           <button
              onClick={generate}
              disabled={!text.trim() || loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 group"
           >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Analysis...</span>
                </>
              ) : (
                <>
                  <span>Generate Complete Analysis</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
           </button>
        </div>
      </main>
    </div>
  );
}
