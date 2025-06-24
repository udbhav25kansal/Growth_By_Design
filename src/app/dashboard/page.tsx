'use client';

import { useEffect, useState } from 'react';

interface OnboardingData {
  stage: string;
  goal: string;
  mrr: string;
  churn: string;
  conversion: string;
}

interface ValidationResult {
  alignment: string;
  suggestion: string;
}

interface ProblemAnalysis {
  analysis: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [actionText, setActionText] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [narrative, setNarrative] = useState<string>('');
  
  // Problem Framing states
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [problemAnalysis, setProblemAnalysis] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("onboardingData");
    if (raw) {
      const parsedData = JSON.parse(raw);
      setData(parsedData);
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.name.endsWith('.pdf') || 
          file.name.endsWith('.docx')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF or DOCX file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.name.endsWith('.pdf') || 
          file.name.endsWith('.docx')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF or DOCX file');
      }
    }
  };

  const handleAnalyzeProblem = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/problem-frame', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: ProblemAnalysis = await response.json();
        setProblemAnalysis(result.analysis);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error analyzing problem:', error);
      alert('Failed to analyze the document. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleValidateAction = async () => {
    if (!actionText.trim() || !data) return;

    setIsValidating(true);
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionText: actionText.trim(),
          metrics: {
            mrr: data.mrr,
            churn: data.churn,
            conversion: data.conversion
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setValidationResult(result);
        localStorage.setItem('lastAlignment', JSON.stringify(result));
      } else {
        console.error('Validation failed');
      }
    } catch (error) {
      console.error('Error validating action:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const generateNarrative = async () => {
    if (!data) return;

    try {
      const onboarding = JSON.parse(localStorage.getItem("onboardingData") || '{}');
      const lastCheck = JSON.parse(localStorage.getItem("lastAlignment") || '{}');
      
      const res = await fetch("/api/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding, lastCheck }),
      });
      
      if (res.ok) {
        const { narrative } = await res.json();
        setNarrative(narrative);
      } else {
        console.error('Failed to generate narrative');
      }
    } catch (error) {
      console.error('Error generating narrative:', error);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const { stage, goal, mrr, churn, conversion } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="pt-4 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              <span className="text-shimmer">
                {stage}
              </span>
              <span className="block text-3xl md:text-4xl font-light text-gray-600 mt-2">
                Growth Dashboard
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {goal}
            </p>
          </div>

          {/* Metrics Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="group gradient-border hover-lift metric-card">
              <div className="gradient-border-inner p-8 text-center relative overflow-hidden">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 glow shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-5xl md:text-6xl font-black text-green-600 mb-4 group-hover:text-gradient transition-all duration-300">
                  ${parseFloat(mrr).toLocaleString()}
                </div>
                <div className="text-gray-600 font-semibold text-lg tracking-wide">Monthly Recurring Revenue</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </div>
            
            <div className="group gradient-border hover-lift metric-card">
              <div className="gradient-border-inner p-8 text-center relative overflow-hidden">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 glow shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div className="text-5xl md:text-6xl font-black text-red-600 mb-4 group-hover:text-gradient transition-all duration-300">
                  {parseFloat(churn).toFixed(1)}%
                </div>
                <div className="text-gray-600 font-semibold text-lg tracking-wide">Monthly Churn Rate</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-600/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </div>
            
            <div className="group gradient-border hover-lift metric-card">
              <div className="gradient-border-inner p-8 text-center relative overflow-hidden">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 glow shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-5xl md:text-6xl font-black text-blue-600 mb-4 group-hover:text-gradient transition-all duration-300">
                  {parseFloat(conversion).toFixed(1)}%
                </div>
                <div className="text-gray-600 font-semibold text-lg tracking-wide">Conversion Rate</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </div>
          </div>

          {/* High Churn Alert */}
          {parseFloat(churn) > 30 && (
            <div className="mb-8">
              <div className="gradient-border hover-lift">
                <div className="gradient-border-inner p-8">
                  <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-l-4 border-red-500 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center glow">
                          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h3 className="text-2xl font-bold text-red-800 mb-2">⚠️ High Churn Alert</h3>
                        <p className="text-red-700 text-lg">Your churn rate is above 30%. Consider focusing on customer retention strategies to improve growth sustainability.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Align & Validate Action Checker */}
            <div className="group gradient-border hover-lift metric-card">
              <div className="gradient-border-inner p-8">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 glow shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 group-hover:text-gradient transition-all duration-300">Align & Validate</h2>
                    <p className="text-gray-600 text-lg">AI-Powered Action Validation</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="actionText" className="block text-lg font-bold text-gray-700 mb-4">
                      🎯 Proposed Action
                    </label>
                    <textarea
                      id="actionText"
                      value={actionText}
                      onChange={(e) => setActionText(e.target.value)}
                      className="w-full h-36 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-300 text-lg leading-relaxed glass"
                      placeholder="Describe the action you're considering... (e.g., 'Launch a referral program to reduce customer acquisition cost and increase viral growth')"
                    />
                  </div>
                  
                  <button
                    onClick={handleValidateAction}
                    disabled={!actionText.trim() || isValidating}
                    className="w-full btn-primary text-white px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 glow-on-hover"
                  >
                    {isValidating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        🤖 AI Analyzing...
                      </span>
                    ) : '✨ Validate Action with AI'}
                  </button>

                  {/* Validation Results */}
                  {validationResult && (
                    <div className="mt-8 gradient-border hover-lift">
                      <div className="gradient-border-inner p-6">
                        <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 rounded-2xl p-6">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gray-700">🎯 Alignment Score:</span>
                              <span className={`px-6 py-3 rounded-full text-lg font-black shadow-lg ${
                                validationResult.alignment.includes('High') ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white glow' :
                                validationResult.alignment.includes('Medium') ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                                'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                              }`}>
                                {validationResult.alignment}
                              </span>
                            </div>
                            <div>
                              <span className="text-lg font-bold text-gray-700 block mb-3">💡 AI Recommendation:</span>
                              <p className="text-gray-800 leading-relaxed text-lg bg-white/50 p-4 rounded-xl">{validationResult.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Build Narrative Section */}
            <div className="group gradient-border hover-lift metric-card">
              <div className="gradient-border-inner p-8">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 glow shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 group-hover:text-gradient transition-all duration-300">Investor Narrative</h2>
                    <p className="text-gray-600 text-lg">AI-Generated Story</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Generate a compelling story for investors based on your current metrics and validated actions.
                </p>
                
                <button
                  onClick={generateNarrative}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 glow-on-hover mb-8"
                >
                  🚀 Generate Investor Story
                </button>
                
                {narrative && (
                  <div className="gradient-border hover-lift">
                    <div className="gradient-border-inner">
                      <div className="space-y-4 p-6">
                        <label className="block text-lg font-bold text-gray-700">
                          📈 Your Investor Story
                        </label>
                        <textarea
                          readOnly
                          value={narrative}
                          className="w-full h-56 px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 text-gray-800 font-medium leading-relaxed resize-none text-lg glass shadow-inner"
                          placeholder="Your compelling investor narrative will appear here..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Problem Framing Section */}
            <div className="group gradient-border hover-lift metric-card lg:col-span-2">
              <div className="gradient-border-inner p-8">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 glow shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 group-hover:text-gradient transition-all duration-300">🔍 Problem Framing Agent</h2>
                    <p className="text-gray-600 text-lg">AI-Powered Root Cause Analysis</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Upload your CRM data (PDF or DOCX) to identify the real underlying problems affecting your startup's growth through advanced AI analysis.
                </p>
                
                <button
                  onClick={() => setShowProblemModal(true)}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 glow-on-hover"
                >
                  📊 Analyze CRM Data with AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Framing Modal */}
      {showProblemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Upload CRM Data</h3>
                <button
                  onClick={() => {
                    setShowProblemModal(false);
                    setSelectedFile(null);
                    setProblemAnalysis('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!problemAnalysis ? (
                <>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                    />
                    
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {selectedFile ? selectedFile.name : 'Drop your CRM data file here'}
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to browse (PDF or DOCX)
                      </p>
                    </label>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <p className="font-semibold mb-2">Expected file content:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Deal win/loss reports</li>
                      <li>Reasons documented for lost sales</li>
                      <li>Sales funnel conversion metrics</li>
                    </ul>
                  </div>

                  {selectedFile && (
                    <button
                      onClick={handleAnalyzeProblem}
                      disabled={isAnalyzing}
                      className="w-full mt-6 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing CRM Data...
                        </span>
                      ) : 'Analyze Problem'}
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-3">Problem Analysis</h4>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {problemAnalysis}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setProblemAnalysis('');
                    }}
                    className="w-full bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200"
                  >
                    Analyze Another File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 