"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  useEffect(() => {
    // Update localStorage and document class when dark mode changes
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Instant Analysis",
      description: "Get AI-powered clinical summaries in 3-8 seconds",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Ranked Diagnoses",
      description: "Top 5 differential diagnoses with confidence scores",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Evidence-Based",
      description: "Every diagnosis backed by medical knowledge citations",
      gradient: "from-emerald-400 to-teal-400"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Complete Traceability",
      description: "Full transparency with relevance scores and citations",
      gradient: "from-orange-400 to-amber-400"
    }
  ];

  const benefits = [
    "Save 25-40 minutes per patient",
    "Reduce diagnostic errors",
    "Access specialist-level insights",
    "100% offline processing"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MedGen.AI
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Features</button>
              <button onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Benefits</button>
              <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">How It Works</button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => router.push('/upload')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
              <button onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors">Features</button>
              <button onClick={() => { document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors">Benefits</button>
              <button onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors">How It Works</button>
              <button onClick={() => router.push('/upload')} className="block w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200">Get Started</button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full border border-blue-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">AI System Online</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                <span className="text-gray-900 dark:text-white">Transform Medical</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Notes Into Insights
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                AI-powered clinical documentation analysis that delivers instant summaries, 
                ranked differential diagnoses, and evidence-based recommendations in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/upload')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Start Analyzing
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                >
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400">3-8s</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Analysis Time</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">12+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Conditions</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-purple-600 dark:text-purple-400">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Offline</div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-4 pt-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">Evidence-Based AI</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Clinical Analysis</div>
                      <div className="text-sm text-green-500 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Complete in 4.2s
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-blue-900">Heart Failure</div>
                        <div className="text-sm font-bold text-blue-600">92.3%</div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '92.3%' }}></div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-purple-900">Pneumonia</div>
                        <div className="text-sm font-bold text-purple-600">78.5%</div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full" style={{ width: '78.5%' }}></div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-emerald-900">COPD</div>
                        <div className="text-sm font-bold text-emerald-600">65.2%</div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full" style={{ width: '65.2%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Analysis Complete
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need for intelligent medical documentation analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6">
                Why Choose MedGen.AI?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Streamline your clinical workflow with AI-powered insights that save time 
                and improve diagnostic accuracy.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-lg text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      87%
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Average Confidence Score</div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-black text-blue-600">5</div>
                      <div className="text-sm text-gray-600">Top Diagnoses</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-xl">
                      <div className="text-2xl font-black text-indigo-600">12+</div>
                      <div className="text-sm text-gray-600">Conditions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Simple, fast, and accurate medical note analysis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Upload Note", desc: "Paste or upload your clinical documentation", icon: "📄" },
              { num: "2", title: "AI Processing", desc: "Our models analyze and extract key findings", icon: "🤖" },
              { num: "3", title: "Get Results", desc: "Receive ranked diagnoses with evidence", icon: "📊" }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 text-center">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-indigo-300 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join healthcare professionals who are already using AI to improve their diagnostic accuracy and save time.
          </p>
          <button
            onClick={() => router.push('/upload')}
            className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            Start Analyzing Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">MedGen.AI</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm">
                Powered by <span className="text-blue-400">DistilBART</span>, <span className="text-purple-400">FAISS</span> & <span className="text-pink-400">Sentence Transformers</span>
              </p>
              <p className="text-xs mt-2">© 2024 MedGen.AI - AI-Powered Medical Intelligence</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
