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
      <section className="billboard bg-paper">
        <div className="wrap">
          <p className="body-text" style={{ opacity: 0.6 }}>Loading dashboard...</p>
        </div>
      </section>
    );
  }

  const { stage, goal, mrr, churn, conversion } = data;

  return (
    <>
      {/* Hero Section */}
      <section className="billboard bg-paper">
        <div className="wrap">
          <h1 className="headline">{stage} Stage</h1>
          <p className="eyebrow" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            {goal}
          </p>
        </div>
      </section>

      {/* Metrics Section */}
      <section style={{ paddingBlock: 'clamp(4rem, 8vw, 6rem)' }}>
        <div className="wrap">
          <div className="grid-2up" style={{ gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div style={{
              backgroundColor: 'var(--frost)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow)'
            }}>
              <div style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: '900',
                color: '#10b981',
                marginBottom: '0.5rem'
              }}>
                ${mrr}
              </div>
              <div className="caption" style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>
                Monthly Recurring Revenue
              </div>
            </div>
            
            <div style={{
              backgroundColor: 'var(--frost)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow)'
            }}>
              <div style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: '900',
                color: '#ef4444',
                marginBottom: '0.5rem'
              }}>
                {churn}%
              </div>
              <div className="caption" style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>
                Churn Rate
              </div>
            </div>
            
            <div style={{
              backgroundColor: 'var(--frost)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow)',
              gridColumn: 'span 1'
            }}>
              <div style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: '900',
                color: 'var(--link-blue)',
                marginBottom: '0.5rem'
              }}>
                {conversion}%
              </div>
              <div className="caption" style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>
                Conversion Rate
              </div>
            </div>
          </div>

          {/* High Churn Alert */}
          {parseFloat(churn) > 30 && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem 1.5rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius)',
              color: '#dc2626',
              fontSize: 'var(--text-sm)',
              fontWeight: '500'
            }}>
              ⚠️ High churn rate detected
            </div>
          )}
        </div>
      </section>

      {/* Action Validation Section */}
      <section className="billboard bg-frost">
        <div className="wrap">
          <h2 className="headline" style={{ fontSize: 'clamp(1.8rem, 4vw + 1rem, 2.5rem)' }}>
            Align & Validate
          </h2>
          <p className="eyebrow" style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
            Check if your proposed actions align with your growth metrics
          </p>
          
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--ink)'
              }}>
                Proposed Action
              </label>
              <textarea
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                className="form-input"
                style={{
                  width: '100%',
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                placeholder="Describe the action you're considering..."
                spellCheck={false}
                suppressHydrationWarning
              />
            </div>
            
            <div className="cta" style={{ marginBottom: '2rem' }}>
              <button
                onClick={handleValidateAction}
                disabled={!actionText.trim() || isValidating}
                style={{
                  background: (!actionText.trim() || isValidating) ? 'var(--caption-gray)' : 'var(--link-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: 'var(--text-base)',
                  fontWeight: '500',
                  cursor: (!actionText.trim() || isValidating) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s var(--ease)'
                }}
                onMouseOver={(e) => {
                  if (actionText.trim() && !isValidating) {
                    e.currentTarget.style.background = 'var(--link-blue-hover)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = (!actionText.trim() || isValidating) ? 'var(--caption-gray)' : 'var(--link-blue)';
                }}
              >
                {isValidating ? 'Checking...' : 'Check Alignment'}
              </button>
            </div>

            {/* Validation Results */}
            {validationResult && (
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--paper)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--ink)' }}>
                    Alignment: 
                  </span>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '700',
                    marginLeft: '0.5rem',
                    color: validationResult.alignment.includes('High') ? '#10b981' :
                           validationResult.alignment.includes('Medium') ? '#f59e0b' : '#ef4444'
                  }}>
                    {validationResult.alignment}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--ink)' }}>
                    Suggestion: 
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)', marginLeft: '0.5rem' }}>
                    {validationResult.suggestion}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section style={{ paddingBlock: 'clamp(4rem, 8vw, 8rem)' }}>
        <div className="wrap">
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw + 1rem, 2.5rem)',
              fontWeight: '900',
              marginBottom: '1.5rem'
            }}>
              Investor Narrative
            </h2>
            <p className="body-text" style={{ marginBottom: '2rem', opacity: 0.8 }}>
              Generate a compelling narrative for investors based on your metrics and validated actions
            </p>
            
            <div className="cta" style={{ marginBottom: '2rem' }}>
              <button
                onClick={generateNarrative}
                style={{
                  background: 'var(--link-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: 'var(--text-base)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s var(--ease)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--link-blue-hover)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'var(--link-blue)';
                }}
              >
                Build Narrative
              </button>
            </div>
            
            {narrative && (
              <div style={{
                backgroundColor: 'var(--frost)',
                borderRadius: 'var(--radius)',
                padding: '2rem',
                textAlign: 'left',
                boxShadow: 'var(--shadow)'
              }}>
                <textarea
                  readOnly
                  value={narrative}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'inherit',
                    color: 'var(--ink)',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  placeholder="Your investor narrative will appear here..."
                  spellCheck={false}
                  suppressHydrationWarning
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
} 