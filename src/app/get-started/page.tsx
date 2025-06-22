"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  
  // 1) On mount, read saved JSON (if any)
  const [data, setData] = useState<OnboardingData>(() => {
    if (typeof window === "undefined") return DEFAULTS;           // SSR guard
    const saved = window.localStorage.getItem("onboardingData");
    return saved ? JSON.parse(saved) : DEFAULTS;
  });

  // persist on change
  useEffect(() => {
    window.localStorage.setItem("onboardingData", JSON.stringify(data));
  }, [data]);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto p-6 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Get Started</h1>

        {/* Business Stage */}
        <label className="block">
          <span className="font-semibold text-gray-700">Business Stage</span>
          <select
            value={data.stage}
            onChange={e => setData({ ...data, stage: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select stage…</option>
            <option value="Idea">Idea</option>
            <option value="Pre-seed">Pre-seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B+">Series B+</option>
          </select>
        </label>

        {/* Core Goal */}
        <label className="block">
          <span className="font-semibold text-gray-700">Core Goal</span>
          <input
            type="text"
            placeholder="e.g. Get first 10 customers"
            value={data.goal}
            onChange={e => setData({ ...data, goal: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">MRR</span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={data.mrr}
              onChange={e => setData({ ...data, mrr: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Churn %</span>
            <input
              type="number"
              step="0.1"
              placeholder="0.0"
              value={data.churn}
              onChange={e => setData({ ...data, churn: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Conversion %</span>
            <input
              type="number"
              step="0.1"
              placeholder="0.0"
              value={data.conversion}
              onChange={e => setData({ ...data, conversion: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>

        {/* Continue */}
        <button
          onClick={() => router.push("/dashboard")}
          disabled={Object.values(data).some(v => v.trim() === "")}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </main>
  );
} 