export default function Home() {
  return (
    <>
      {/* Hero Billboard */}
      <section className="billboard bg-paper">
        <div className="wrap">
          <h1 className="headline">Growth By Design</h1>
          <p className="eyebrow" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            Transform your business with data-driven growth strategies
          </p>
          
          <div className="cta" style={{ marginBottom: '4rem' }}>
            <a href="/get-started" style={{ marginRight: '2rem' }}>
              Get started
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </a>
            <a href="/dashboard">
              View dashboard
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </a>
          </div>

          <p className="body-text">
            Leverage advanced analytics and proven frameworks to accelerate your business growth. 
            Our platform helps you identify opportunities, optimize performance, and scale sustainably.
          </p>
        </div>
      </section>

      {/* Secondary Billboard */}
      <section className="billboard bg-frost">
        <div className="wrap">
          <h2 className="headline" style={{ fontSize: 'clamp(1.8rem, 4vw + 1rem, 3rem)' }}>
            Data-Driven Insights
          </h2>
          <p className="eyebrow" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            Make informed decisions with comprehensive analytics
          </p>
          
          <div className="cta">
            <a href="/get-started">
              Explore features
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section style={{ padding: 'clamp(4rem, 8vw, 8rem) 0' }}>
        <div className="wrap">
          <div className="grid-2up">
            <div className="grid-tile">
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: '1rem' }}>
                Growth Analytics
              </h3>
              <p className="body-text" style={{ fontSize: 'var(--text-sm)', opacity: '0.8' }}>
                Track key metrics and identify growth opportunities with advanced analytics dashboards.
              </p>
            </div>
            
            <div className="grid-tile">
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: '1rem' }}>
                Strategic Planning
              </h3>
              <p className="body-text" style={{ fontSize: 'var(--text-sm)', opacity: '0.8' }}>
                Develop data-backed strategies to optimize your business performance and scale effectively.
              </p>
            </div>
            
            <div className="grid-tile">
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: '1rem' }}>
                Performance Monitoring
              </h3>
              <p className="body-text" style={{ fontSize: 'var(--text-sm)', opacity: '0.8' }}>
                Monitor your progress with real-time insights and actionable recommendations.
              </p>
            </div>
            
            <div className="grid-tile">
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: '1rem' }}>
                Expert Guidance
              </h3>
              <p className="body-text" style={{ fontSize: 'var(--text-sm)', opacity: '0.8' }}>
                Get personalized recommendations based on industry best practices and proven methodologies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
} 