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
  
  // Start with defaults to ensure server/client consistency
  const [data, setData] = useState<OnboardingData>(DEFAULTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    const saved = window.localStorage.getItem("onboardingData");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (error) {
        console.error("Error parsing saved data:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem("onboardingData", JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const isFormValid = Object.values(data).every(v => v.trim() !== "");

  // Don't render form until data is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <>
        <section className="billboard bg-paper">
          <div className="wrap">
            <h1 className="headline">Get Started</h1>
            <p className="eyebrow" style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
              Tell us about your business to get personalized recommendations
            </p>
          </div>
        </section>
        <section style={{ paddingBlock: '0 clamp(4rem, 8vw, 8rem)' }}>
          <div className="wrap">
            <div style={{ 
              maxWidth: '480px', 
              margin: '0 auto',
              padding: '3rem',
              backgroundColor: 'var(--frost)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)',
              textAlign: 'center'
            }}>
              <p className="body-text" style={{ opacity: 0.6 }}>Loading...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="billboard bg-paper">
        <div className="wrap">
          <h1 className="headline">Get Started</h1>
          <p className="eyebrow" style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
            Tell us about your business to get personalized recommendations
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section style={{ paddingBlock: '0 clamp(4rem, 8vw, 8rem)' }}>
        <div className="wrap">
          <div style={{ 
            maxWidth: '480px', 
            margin: '0 auto',
            padding: '3rem',
            backgroundColor: 'var(--frost)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)'
          }}>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--ink)'
              }}>
                Business Stage
              </label>
              <select
                value={data.stage}
                onChange={e => setData({ ...data, stage: e.target.value })}
                className="form-select"
                style={{ width: '100%' }}
                suppressHydrationWarning
              >
                <option value="">Select stage…</option>
                <option value="Idea">Idea</option>
                <option value="Pre-seed">Pre-seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B+">Series B+</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--ink)'
              }}>
                Core Goal
              </label>
              <input
                type="text"
                placeholder="e.g. Get first 10 customers"
                value={data.goal}
                onChange={e => setData({ ...data, goal: e.target.value })}
                className="form-input"
                style={{ width: '100%' }}
                spellCheck={false}
                suppressHydrationWarning
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ 
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                marginBottom: '1rem',
                color: 'var(--ink)'
              }}>
                Key Metrics
              </p>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    color: 'var(--caption-gray)'
                  }}>
                    MRR
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={data.mrr}
                    onChange={e => setData({ ...data, mrr: e.target.value })}
                    className="form-input"
                    style={{ width: '100%' }}
                    suppressHydrationWarning
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    color: 'var(--caption-gray)'
                  }}>
                    Churn %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={data.churn}
                    onChange={e => setData({ ...data, churn: e.target.value })}
                    className="form-input"
                    style={{ width: '100%' }}
                    suppressHydrationWarning
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    color: 'var(--caption-gray)'
                  }}>
                    Conversion %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={data.conversion}
                    onChange={e => setData({ ...data, conversion: e.target.value })}
                    className="form-input"
                    style={{ width: '100%' }}
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </div>

            <div className="cta" style={{ marginTop: '2.5rem' }}>
              <button
                onClick={() => router.push("/dashboard")}
                disabled={!isFormValid}
                style={{
                  background: isFormValid ? 'var(--link-blue)' : 'var(--caption-gray)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: 'var(--text-base)',
                  fontWeight: '500',
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s var(--ease)',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  if (isFormValid) {
                    e.currentTarget.style.background = 'var(--link-blue-hover)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = isFormValid ? 'var(--link-blue)' : 'var(--caption-gray)';
                }}
                suppressHydrationWarning
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 