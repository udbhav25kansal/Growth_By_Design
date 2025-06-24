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

export default function DashboardPage() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [actionText, setActionText] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [narrative, setNarrative] = useState<string>('');

  useEffect(() => {
    const raw = window.localStorage.getItem("onboardingData");
    if (raw) {
      const parsedData = JSON.parse(raw);
      setData(parsedData);
    }
  }, []);

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
      <div className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stage}
              </span>
              {" "}Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {goal}
            </p>
          </div>

          {/* Metrics Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="gradient-border hover-lift">
              <div className="gradient-border-inner p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  ${parseFloat(mrr).toLocaleString()}
                </div>
                <div className="text-gray-600 font-medium">Monthly Recurring Revenue</div>
              </div>
            </div>
            
            <div className="gradient-border hover-lift">
              <div className="gradient-border-inner p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {parseFloat(churn).toFixed(1)}%
                </div>
                <div className="text-gray-600 font-medium">Monthly Churn Rate</div>
              </div>
            </div>
            
            <div className="gradient-border hover-lift">
              <div className="gradient-border-inner p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {parseFloat(conversion).toFixed(1)}%
                </div>
                <div className="text-gray-600 font-medium">Conversion Rate</div>
              </div>
            </div>
          </div>

          {/* High Churn Alert */}
          {parseFloat(churn) > 30 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-red-800">High Churn Alert</h3>
                    <p className="text-red-700">Your churn rate is above 30%. Consider focusing on customer retention strategies.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Align & Validate Action Checker */}
            <div className="gradient-border hover-lift">
              <div className="gradient-border-inner p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Align & Validate</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="actionText" className="block text-sm font-semibold text-gray-700 mb-3">
                      Proposed Action
                    </label>
                    <textarea
                      id="actionText"
                      value={actionText}
                      onChange={(e) => setActionText(e.target.value)}
                      className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-200"
                      placeholder="Describe the action you're considering... (e.g., 'Launch a referral program to reduce customer acquisition cost')"
                    />
                  </div>
                  
                  <button
                    onClick={handleValidateAction}
                    disabled={!actionText.trim() || isValidating}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                  >
                    {isValidating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </span>
                    ) : 'Validate Action'}
                  </button>

                  {/* Validation Results */}
                  {validationResult && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-700 mr-3">Alignment:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            validationResult.alignment.includes('High') ? 'bg-green-100 text-green-800' :
                            validationResult.alignment.includes('Medium') ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {validationResult.alignment}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700 block mb-2">Suggestion:</span>
                          <p className="text-gray-800 leading-relaxed">{validationResult.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Build Narrative Section */}
            <div className="gradient-border hover-lift">
              <div className="gradient-border-inner p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Investor Narrative</h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Generate a compelling story for investors based on your current metrics and validated actions.
                </p>
                
                <button
                  onClick={generateNarrative}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-6"
                >
                  Generate Narrative
                </button>
                
                {narrative && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Your Investor Story
                    </label>
                    <textarea
                      readOnly
                      value={narrative}
                      className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 font-medium leading-relaxed resize-none"
                      placeholder="Your compelling investor narrative will appear here..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 