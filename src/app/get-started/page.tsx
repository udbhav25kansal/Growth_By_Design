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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-repeat animate-pulse" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="pt-8 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
              <span className="text-shimmer block mb-4">
                Get Started
              </span>
              <span className="text-2xl md:text-3xl font-light text-gray-600 tracking-wide">
                🚀 Launch Your Growth Journey
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Tell us about your startup to get personalized AI-powered insights and recommendations
            </p>
          </div>

          {/* Form Card */}
          {isLoaded && (
          <div className="group gradient-border hover-lift metric-card">
            <div className="gradient-border-inner p-10 space-y-10">
              {/* Business Stage */}
              <div className="space-y-4">
                <label className="block">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 glow">
                      <span className="text-white text-xl">🏢</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">Business Stage</span>
                  </div>
                  <select
                    value={data.stage}
                    onChange={e => setData({ ...data, stage: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-2xl p-6 bg-white text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-xl font-medium glass shadow-lg"
                  >
                    <option value="">Select your current stage…</option>
                    <option value="Idea">💡 Idea Stage</option>
                    <option value="Pre-seed">🌱 Pre-seed Funding</option>
                    <option value="Seed">🌿 Seed Funding</option>
                    <option value="Series A">🚀 Series A</option>
                    <option value="Series B+">📈 Series B & Beyond</option>
                  </select>
                </label>
              </div>

              {/* Core Goal */}
              <div className="space-y-4">
                <label className="block">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 glow">
                      <span className="text-white text-xl">🎯</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">Primary Goal</span>
                  </div>
                  <textarea
                    value={data.goal}
                    onChange={e => setData({ ...data, goal: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-2xl p-6 bg-white text-gray-900 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-xl leading-relaxed glass shadow-lg"
                    rows={4}
                    placeholder="What's your main business objective? (e.g., 'Scale to $1M ARR while maintaining healthy unit economics and preparing for Series A funding')"
                  />
                </label>
              </div>

              {/* Financial Metrics */}
              <div className="space-y-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 glow">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">Key Metrics</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* MRR */}
                  <div className="gradient-border hover-lift">
                    <div className="gradient-border-inner p-6">
                      <label className="block">
                        <span className="text-lg font-bold text-gray-700 mb-3 block">💰 Monthly Recurring Revenue</span>
                        <input
                          type="number"
                          value={data.mrr}
                          onChange={e => setData({ ...data, mrr: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-4 bg-white text-gray-900 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg font-medium"
                          placeholder="50000"
                        />
                        <span className="text-sm text-gray-500 mt-2 block">Enter amount in USD</span>
                      </label>
                    </div>
                  </div>

                  {/* Churn Rate */}
                  <div className="gradient-border hover-lift">
                    <div className="gradient-border-inner p-6">
                      <label className="block">
                        <span className="text-lg font-bold text-gray-700 mb-3 block">📉 Monthly Churn Rate</span>
                        <input
                          type="number"
                          step="0.1"
                          value={data.churn}
                          onChange={e => setData({ ...data, churn: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-4 bg-white text-gray-900 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg font-medium"
                          placeholder="5.2"
                        />
                        <span className="text-sm text-gray-500 mt-2 block">Percentage (e.g., 5.2)</span>
                      </label>
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="gradient-border hover-lift">
                    <div className="gradient-border-inner p-6">
                      <label className="block">
                        <span className="text-lg font-bold text-gray-700 mb-3 block">📈 Conversion Rate</span>
                        <input
                          type="number"
                          step="0.1"
                          value={data.conversion}
                          onChange={e => setData({ ...data, conversion: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-4 bg-white text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg font-medium"
                          placeholder="12.5"
                        />
                        <span className="text-sm text-gray-500 mt-2 block">Percentage (e.g., 12.5)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <Link
                  href="/dashboard"
                  className="group relative w-full btn-primary text-white px-8 py-6 rounded-2xl text-xl font-bold shadow-2xl transform transition-all duration-300 hover:scale-105 glow-on-hover flex items-center justify-center"
                >
                  <span className="relative z-10 flex items-center">
                    <span className="mr-3">🚀</span>
                    Launch My Growth Dashboard
                    <span className="ml-3">✨</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>

              {/* Progress Indicator */}
              <div className="text-center pt-6">
                <div className="flex justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        (data.stage && step === 1) ||
                        (data.goal && step === 2) ||
                        (data.mrr && step === 3) ||
                        (data.churn && data.conversion && step === 4)
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-125 glow'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-lg">
                  Complete your profile to unlock AI-powered insights
                </p>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
} 