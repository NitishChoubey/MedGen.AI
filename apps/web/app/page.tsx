"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "AI-Powered Analysis",
      description: "Upload medical notes and get instant AI-generated clinical summaries and differential diagnoses",
      delay: "0s"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "RAG-Enhanced Intelligence",
      description: "Retrieval-Augmented Generation ensures accurate, evidence-based recommendations from medical knowledge base",
      delay: "0.2s"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: "Complete Traceability",
      description: "Every diagnosis is backed by specific findings from patient notes and medical evidence with relevance scores",
      delay: "0.4s"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Evidence-Based Citations",
      description: "All recommendations include citations from verified medical knowledge sources with full transparency",
      delay: "0.6s"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="relative inline-block mb-8 animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-3xl opacity-50 animate-pulse"></div>
            <div className="relative w-28 h-28 mx-auto bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/10">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-black font-display bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent mb-6 tracking-tight drop-shadow-2xl">
            MedGen.AI
          </h1>

          <p className="text-2xl md:text-3xl text-gray-200 font-semibold mb-4 tracking-wide">
            Intelligent Medical Documentation Analysis
          </p>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Transform unstructured clinical notes into actionable insights with AI-powered summarization,
            differential diagnosis generation, and evidence-based recommendations
          </p>

          <button
            onClick={() => router.push('/upload')}
            className="group relative px-12 py-5 bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 text-white rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 overflow-hidden border-2 border-cyan-400/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-3">
              Get Started
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {/* Features Section */}
        {showFeatures && (
          <div className="w-full max-w-7xl">
            <h2 className="text-4xl font-black font-display text-center text-white mb-16 animate-fade-in-up">
              Powered by Advanced AI Technology
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative glass-effect rounded-3xl p-8 hover:glass-effect-strong hover:border-cyan-500/50 transition-all duration-500 animate-slide-in-right shadow-2xl"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-2xl group-hover:opacity-100 opacity-50 transition-opacity"></div>

                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-cyan-500/50 group-hover:scale-110 transition-all duration-300">
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>

                    <h3 className="text-2xl font-black font-display text-white mb-4 group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                      {feature.description}
                    </p>
                  </div>

                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/0 to-blue-600/0 group-hover:from-cyan-500/5 group-hover:to-blue-600/5 transition-all duration-500 pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-20 text-center animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <div className="inline-flex items-center gap-3 px-8 py-4 glass-effect rounded-full border border-emerald-400/30 shadow-lg shadow-emerald-500/20">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-emerald-400 text-sm font-bold tracking-wide">AI System Online & Ready</span>
          </div>

          <p className="text-gray-400 text-sm mt-6 font-medium">
            Powered by DistilBART, FAISS & Sentence Transformers
          </p>
        </div>
      </div>
    </main>
  );
}
