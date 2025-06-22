'use client';

import { useEffect, useState } from 'react';

interface OnboardingData {
  stage: string;
  goal: string;
  mrr: string;
  churn: string;
  conversion: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("onboardingData");
    if (raw) {
      const parsedData = JSON.parse(raw);
      setData(parsedData);
    }
  }, []);

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
          <div className="alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ⚠️ High churn
          </div>
        )}
      </div>
    </div>
  );
} 