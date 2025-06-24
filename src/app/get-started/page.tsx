"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OnboardingData {
  stage: string;       // one of your dropdown options
  goal: string;        // free-form text
  mrr: string;         // we'll keep as string, parse later
  churn: string;       // e.g. "12.5"
  conversion: string;  // e.g. "2.3"
}

const DEFAULTS: OnboardingData = {
  stage: "",
  goal: "",
  mrr: "",
  churn: "",
  conversion: "",
};

export default function GetStarted() {
  // Start with defaults to ensure server/client consistency
  const [data, setData] = useState<OnboardingData>(DEFAULTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    const saved = window.localStorage.getItem("onboardingData");
    if (saved) {
      setData(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem("onboardingData", JSON.stringify(data));
    }
  }, [data, isLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Get Started
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Tell us about your startup to get personalized insights and recommendations
            </p>
          </div>

          {/* Form Card */}
          {isLoaded && (
          <div className="gradient-border hover-lift">
            <div className="gradient-border-inner p-8 space-y-8">
              {/* Business Stage */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-lg font-semibold text-gray-900 mb-2 block">Business Stage</span>
                  <select
                    value={data.stage}
                    onChange={e => setData({ ...data, stage: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  >
                    <option value="">Select your current stage…</option>
                    <option value="Idea">💡 Idea</option>
                    <option value="Pre-seed">🌱 Pre-seed</option>
                    <option value="Seed">🌿 Seed</option>
                    <option value="Series A">🚀 Series A</option>
                    <option value="Series B+">📈 Series B+</option>
                  </select>
                </label>
              </div>

              {/* Core Goal */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-lg font-semibold text-gray-900 mb-2 block">Core Goal</span>
                  <input
                    type="text"
                    placeholder="e.g. Get first 10 customers, reach $10K MRR, reduce churn by 5%"
                    value={data.goal}
                    onChange={e => setData({ ...data, goal: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  />
                </label>
              </div>

              {/* Key Metrics */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 mb-2 block">Monthly Recurring Revenue</span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={data.mrr}
                          onChange={e => setData({ ...data, mrr: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-4 pl-8 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 mb-2 block">Monthly Churn Rate</span>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={data.churn}
                          onChange={e => setData({ ...data, churn: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-4 pr-8 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 mb-2 block">Conversion Rate</span>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={data.conversion}
                          onChange={e => setData({ ...data, conversion: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-4 pr-8 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-4">
                {Object.values(data).some(v => v.trim() === "") ? (
                  <span className="w-full inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl text-lg font-semibold opacity-50 cursor-not-allowed text-center">
                    Please fill all fields to continue
                  </span>
                ) : (
                  <Link
                    href="/dashboard"
                    className="w-full inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-center"
                  >
                    Continue to Dashboard →
                  </Link>
                )}
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center space-x-2 pt-4">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
} 