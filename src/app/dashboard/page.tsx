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
      } else {
        console.error('Validation failed');
      }
    } catch (error) {
      console.error('Error validating action:', error);
    } finally {
      setIsValidating(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const { stage, goal, mrr, churn, conversion } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {stage}-stage: {goal}
        </h1>

        {/* Metrics Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl font-bold text-green-600">
              ${mrr}
            </div>
            <div className="text-gray-600 mt-2">MRR</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl font-bold text-red-600">
              {churn}%
            </div>
            <div className="text-gray-600 mt-2">Churn</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl font-bold text-blue-600">
              {conversion}%
            </div>
            <div className="text-gray-600 mt-2">Conversion</div>
          </div>
        </div>

        {/* High Churn Alert */}
        {parseFloat(churn) > 30 && (
          <div className="alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            ⚠️ High churn
          </div>
        )}

        {/* Align & Validate Action Checker */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Align & Validate</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="actionText" className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Action
              </label>
              <textarea
                id="actionText"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Describe the action you're considering..."
              />
            </div>
            
            <button
              onClick={handleValidateAction}
              disabled={!actionText.trim() || isValidating}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Checking...' : 'Check'}
            </button>

            {/* Validation Results */}
            {validationResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="mb-3">
                  <span className="font-semibold text-gray-700">Alignment: </span>
                  <span className={`font-bold ${
                    validationResult.alignment.includes('High') ? 'text-green-600' :
                    validationResult.alignment.includes('Medium') ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {validationResult.alignment}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Suggestion: </span>
                  <span className="text-gray-800">{validationResult.suggestion}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 