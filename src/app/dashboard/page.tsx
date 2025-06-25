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
  analysisId?: number;
  fileId?: number;
  sessionId?: number;
  structuredData?: any;
  metadata?: any;
}

interface CustomerInteractionAnalysis {
  analysis: string;
  analysisId?: number;
  fileId?: number;
  sessionId?: number;
  structuredData?: any;
  metadata?: any;
}

interface ProductAnalyticsAnalysis {
  analysis: string;
  analysisId?: number;
  fileId?: number;
  sessionId?: number;
  structuredData?: any;
  metadata?: any;
}

interface User {
  id: number;
  email: string;
  name: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
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

  // Customer Interaction Analysis states
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [selectedInteractionFile, setSelectedInteractionFile] = useState<File | null>(null);
  const [isAnalyzingInteraction, setIsAnalyzingInteraction] = useState(false);
  const [interactionAnalysis, setInteractionAnalysis] = useState<string>('');
  const [dragActiveInteraction, setDragActiveInteraction] = useState(false);

  // Product Analytics Analysis states
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedAnalyticsFile, setSelectedAnalyticsFile] = useState<File | null>(null);
  const [isAnalyzingAnalytics, setIsAnalyzingAnalytics] = useState(false);
  const [analyticsAnalysis, setAnalyticsAnalysis] = useState<string>('');
  const [dragActiveAnalytics, setDragActiveAnalytics] = useState(false);

  // Problem Framing Agents expandable section
  const [isProblemFramingExpanded, setIsProblemFramingExpanded] = useState(true);
  
  // Analysis History Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Overall Analysis
  const [overallAnalysis, setOverallAnalysis] = useState<string>('');
  const [isGeneratingOverall, setIsGeneratingOverall] = useState(false);
  
  // Tutorial Modal
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Validation Agent Tooltip
  const [showValidationTooltip, setShowValidationTooltip] = useState(false);
  
  // Narrative Agent Tooltip
  const [showNarrativeTooltip, setShowNarrativeTooltip] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log('User authenticated:', userData);
        } else {
          console.error('Authentication failed, redirecting to login');
          window.location.href = '/login';
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        window.location.href = '/login';
        return;
      }
    };

    checkAuth();

    // Load onboarding data
    const raw = window.localStorage.getItem("onboardingData");
    if (raw) {
      const parsedData = JSON.parse(raw);
      setData(parsedData);
    }
  }, []);

  // Show tutorial after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTutorial(true);
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
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
    console.log('handleAnalyzeProblem called');
    console.log('selectedFile:', selectedFile);
    console.log('user:', user);
    
    if (!selectedFile || !user) {
      console.log('Missing selectedFile or user, returning early');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', user.id.toString());

      console.log('Sending request to /api/problem-frame');
      const response = await fetch('/api/problem-frame', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result: ProblemAnalysis = await response.json();
        setProblemAnalysis(result.analysis);
        console.log('Analysis saved with ID:', result.analysisId, 'Session:', result.sessionId);
        // Refresh analysis history if sidebar is open
        if (isSidebarOpen) {
          fetchAnalysisHistory();
        }
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error analyzing problem:', error);
      alert('Failed to analyze the document. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Customer Interaction Analysis handlers
  const handleInteractionDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveInteraction(true);
    } else if (e.type === "dragleave") {
      setDragActiveInteraction(false);
    }
  };

  const handleInteractionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveInteraction(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.name.endsWith('.pdf') || 
          file.name.endsWith('.docx')) {
        setSelectedInteractionFile(file);
      } else {
        alert('Please upload a PDF or DOCX file');
      }
    }
  };

  const handleInteractionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.name.endsWith('.pdf') || 
          file.name.endsWith('.docx')) {
        setSelectedInteractionFile(file);
      } else {
        alert('Please upload a PDF or DOCX file');
      }
    }
  };

  const handleAnalyzeInteraction = async () => {
    if (!selectedInteractionFile || !user) return;

    setIsAnalyzingInteraction(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedInteractionFile);
      formData.append('userId', user.id.toString());

      const response = await fetch('/api/customer-interaction', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: CustomerInteractionAnalysis = await response.json();
        setInteractionAnalysis(result.analysis);
        console.log('Customer interaction analysis saved with ID:', result.analysisId, 'Session:', result.sessionId);
        // Refresh analysis history if sidebar is open
        if (isSidebarOpen) {
          fetchAnalysisHistory();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error analyzing customer interactions:', error);
      alert('Failed to analyze the document. Please try again.');
    } finally {
      setIsAnalyzingInteraction(false);
    }
  };

  // Product Analytics Analysis handlers
  const handleAnalyticsDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveAnalytics(true);
    } else if (e.type === "dragleave") {
      setDragActiveAnalytics(false);
    }
  };

  const handleAnalyticsDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveAnalytics(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.name.endsWith('.pdf') || 
          file.name.endsWith('.docx')) {
        setSelectedAnalyticsFile(file);
      } else {
        alert('Please upload a PDF or DOCX file');
      }
    }
  };

  const handleAnalyticsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.name.endsWith('.pdf') || 
          file.name.endsWith('.docx')) {
        setSelectedAnalyticsFile(file);
      } else {
        alert('Please upload a PDF or DOCX file');
      }
    }
  };

  const handleAnalyzeAnalytics = async () => {
    if (!selectedAnalyticsFile || !user) return;

    setIsAnalyzingAnalytics(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedAnalyticsFile);
      formData.append('userId', user.id.toString());

      const response = await fetch('/api/product-analytics', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: ProductAnalyticsAnalysis = await response.json();
        setAnalyticsAnalysis(result.analysis);
        console.log('Product analytics analysis saved with ID:', result.analysisId, 'Session:', result.sessionId);
        // Refresh analysis history if sidebar is open
        if (isSidebarOpen) {
          fetchAnalysisHistory();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error analyzing product analytics:', error);
      alert('Failed to analyze the document. Please try again.');
    } finally {
      setIsAnalyzingAnalytics(false);
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
          },
          goal: data.goal,
          stage: data.stage
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

  const fetchAnalysisHistory = async () => {
    if (!user) return;

    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/analyses?userId=${user.id}`);
      if (response.ok) {
        const result = await response.json();
        setAnalysisHistory(result.analyses || []);
        console.log('Loaded analysis history:', result.analyses?.length || 0, 'analyses');
      } else {
        console.error('Failed to fetch analysis history');
      }
    } catch (error) {
      console.error('Error fetching analysis history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const generateOverallAnalysis = async () => {
    if (!user) return;

    setIsGeneratingOverall(true);
    try {
      const response = await fetch('/api/overall-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const result = await response.json();
        setOverallAnalysis(result.analysis);
        console.log('Generated overall analysis with ID:', result.analysisId, 'covering', result.analysisCount, 'analyses');
        // Refresh analysis history to include the new overall analysis
        fetchAnalysisHistory();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error generating overall analysis:', error);
      alert('Failed to generate overall analysis. Please try again.');
    } finally {
      setIsGeneratingOverall(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      {/* Analysis History Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Analysis History</h2>
                  <p className="text-sm text-gray-600">Your stored analyses</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 mb-1">📚 Database Storage</p>
                  <p className="text-sm text-green-700">
                    All your uploaded files and AI analysis results are systematically stored with structured data extraction, processing metadata, and user session tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Overall Insights Section */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Overall Insights & Action Items</h3>
                  <button
                    onClick={generateOverallAnalysis}
                    disabled={isGeneratingOverall || analysisHistory.length === 0}
                    className="text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title={analysisHistory.length === 0 ? 'Complete some analyses first' : 'Generate overall insights'}
                  >
                    {isGeneratingOverall ? 'Generating...' : 'Generate'}
                  </button>
                </div>

                {isGeneratingOverall ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mr-3"></div>
                    <span className="text-sm text-gray-600">AI analyzing all your data...</span>
                  </div>
                ) : overallAnalysis ? (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-800 mb-2">Cross-Agent Analysis</h4>
                        <div className="prose prose-sm max-w-none text-purple-700 whitespace-pre-wrap text-xs leading-relaxed">
                          {overallAnalysis}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : analysisHistory.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">Generate comprehensive insights</p>
                      <p className="text-gray-500 text-xs">Analyze all your data for strategic recommendations</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">Complete some analyses first</p>
                      <p className="text-gray-400 text-xs">Upload files to any agent to enable overall insights</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Analyses</h3>
                <button
                  onClick={fetchAnalysisHistory}
                  disabled={isLoadingHistory}
                  className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                >
                  {isLoadingHistory ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : analysisHistory.length > 0 ? (
                <div className="space-y-3">
                  {analysisHistory.slice(0, 10).map((analysis, index) => {
                    const getAgentIcon = (agentType: string) => {
                      switch (agentType) {
                        case 'crm_data':
                          return { color: 'bg-orange-500', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' };
                        case 'customer_interaction':
                          return { color: 'bg-purple-500', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' };
                        case 'product_analytics':
                          return { color: 'bg-blue-500', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' };
                        default:
                          return { color: 'bg-gray-500', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' };
                      }
                    };

                    const getAgentName = (agentType: string) => {
                      switch (agentType) {
                        case 'crm_data': return 'CRM Data Analysis';
                        case 'customer_interaction': return 'Customer Interaction';
                        case 'product_analytics': return 'Product Analytics';
                        default: return 'Analysis';
                      }
                    };

                    const agentConfig = getAgentIcon(analysis.file_agent_type || analysis.agent_type);
                    const analysisDate = new Date(analysis.analysis_timestamp).toLocaleDateString();
                    const analysisTime = new Date(analysis.analysis_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={analysis.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 ${agentConfig.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={agentConfig.icon} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-gray-900 truncate">{getAgentName(analysis.file_agent_type || analysis.agent_type)}</p>
                              <span className="text-xs text-gray-500">{analysisTime}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-1">{analysis.original_filename}</p>
                            <p className="text-xs text-gray-500">{analysisDate} • {analysis.model_used}</p>
                            {analysis.core_problem && (
                              <p className="text-xs text-gray-700 mt-2 line-clamp-2">{analysis.core_problem}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No analyses yet</p>
                  <p className="text-gray-400 text-xs mt-1">Upload files to see your analysis history here</p>
                </div>
              )}
            </div>

            <div className="mt-8 text-sm text-gray-600">
              <p className="font-semibold mb-2">What&apos;s being stored:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Original uploaded files with extracted text content</li>
                <li>Complete AI analysis responses with structured data parsing</li>
                <li>Processing metadata (model used, tokens, processing time)</li>
                <li>Analysis sessions organized by date and agent type</li>
                <li>User ratings and notes for quality tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setShowTutorial(false);
          setIsSidebarOpen(true);
          fetchAnalysisHistory();
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 z-30 flex items-center justify-center group hover:scale-110"
        title="Open Analysis Hub"
      >
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

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

          {/* Problem Framing Agents Section */}
          <div className="mb-8">
            <div className="group gradient-border hover-lift metric-card">
              <div className="gradient-border-inner p-6">
                <button
                  onClick={() => setIsProblemFramingExpanded(!isProblemFramingExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 glow shadow-xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h2 className="text-4xl font-bold text-gray-900 group-hover:text-gradient transition-all duration-300">🔍 Problem Framing Agents</h2>
                      <p className="text-gray-600 text-lg">Clearly Frame the Real Problem</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">3 Agents</span>
                    <svg 
                      className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isProblemFramingExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>



                {isProblemFramingExpanded && (
                  <div className="mt-6 space-y-6">
                    {/* CRM Data Analyzer */}
                    <div className="group gradient-border hover-lift metric-card">
                      <div className="gradient-border-inner p-8">
                        <div className="flex items-center mb-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 glow shadow-xl">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gradient transition-all duration-300">🔍 CRM Data Analyzer</h3>
                            <p className="text-gray-600">HubSpot, Salesforce & CRM Analysis</p>
                          </div>
                        </div>
                        
                        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                          <h4 className="font-semibold text-orange-800 mb-2">CRM Data (HubSpot, Salesforce etc):</h4>
                          <ul className="text-sm text-orange-700 space-y-1">
                            <li>• Deal win/loss reports</li>
                            <li>• Reasons documented for lost sales</li>
                            <li>• Sales funnel conversion metrics</li>
                          </ul>
                        </div>
                        
                        <button
                          onClick={() => setShowProblemModal(true)}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 glow-on-hover"
                        >
                          🏢 Analyze CRM Data with AI
                        </button>
                      </div>
                    </div>

                    {/* Customer Interaction Analyzer */}
                    <div className="group gradient-border hover-lift metric-card">
                      <div className="gradient-border-inner p-8">
                        <div className="flex items-center mb-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 glow shadow-xl">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gradient transition-all duration-300">🎯 Customer Interaction Analyzer</h3>
                            <p className="text-gray-600">AI-Powered Customer Data Analysis</p>
                          </div>
                        </div>
                        
                        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-2">Expected Customer Interaction Data:</h4>
                          <ul className="text-sm text-purple-700 space-y-1">
                            <li>• Zoom or Gong sales call transcripts</li>
                            <li>• Customer onboarding call recordings (via Chorus or Otter.ai)</li>
                            <li>• Support logs from Zendesk or Intercom with resolution outcomes</li>
                            <li>• Sales funnel conversion metrics</li>
                          </ul>
                        </div>
                        
                        <button
                          onClick={() => setShowInteractionModal(true)}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 glow-on-hover"
                        >
                          📞 Analyze Customer Interactions with AI
                        </button>
                      </div>
                    </div>

                    {/* Product Analytics Analyzer */}
                    <div className="group gradient-border hover-lift metric-card">
                      <div className="gradient-border-inner p-8">
                        <div className="flex items-center mb-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 glow shadow-xl">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gradient transition-all duration-300">📊 Product Analytics Analyzer</h3>
                            <p className="text-gray-600">AI-Powered Product Data Analysis</p>
                          </div>
                        </div>
                        
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">Expected Product Analytics Data:</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Onboarding funnel data from analytics platforms (Mixpanel, Amplitude)</li>
                            <li>• User behavior heatmaps and screen recordings (Hotjar, FullStory)</li>
                            <li>• Support logs from Zendesk or Intercom with issue resolution outcomes</li>
                            <li>• Sales funnel conversion metrics</li>
                          </ul>
                        </div>
                        
                        <button
                          onClick={() => setShowAnalyticsModal(true)}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 glow-on-hover"
                        >
                          📈 Analyze Product Analytics with AI
                        </button>
                      </div>
                    </div>

                    {/* Coming Soon Section */}
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">🚀</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-blue-800 mb-2">Coming Soon</h3>
                          <p className="text-blue-700 text-sm leading-relaxed">
                            The connector ability to import data directly from your CRM, analytics platforms, project management tools, or perform deep research on Google Drive files is coming soon.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-3xl font-bold text-gray-900 group-hover:text-gradient transition-all duration-300">Align & Validate</h2>
                      <div className="relative">
                        <button
                          onClick={() => setShowValidationTooltip(!showValidationTooltip)}
                          className={`relative w-10 h-10 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 hover:from-purple-500 hover:via-purple-600 hover:to-indigo-700 border-2 border-white shadow-lg hover:shadow-2xl rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-125 group overflow-hidden ${!showValidationTooltip ? 'animate-bounce' : ''}`}
                          title="Learn about validation"
                        >
                          {/* Animated background glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full animate-pulse opacity-20"></div>
                          
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                          
                          {/* Question mark icon with enhanced design */}
                          <div className="relative z-10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white drop-shadow-sm transition-all duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                            </svg>
                          </div>
                          
                          {/* Pulsing ring effect */}
                          <div className="absolute inset-0 rounded-full border-2 border-purple-300 animate-ping opacity-30"></div>
                        </button>
                        
                                                {/* Validation Tooltip */}
                        {showValidationTooltip && (
                          <>
                            <div 
                              className="fixed inset-0 z-[100]" 
                              onClick={() => setShowValidationTooltip(false)}
                            />
                            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[110] w-96 bg-white rounded-xl shadow-2xl border border-purple-200 p-5 backdrop-blur-sm max-w-[90vw]">
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-purple-200 rotate-45"></div>
                              
                              <div className="space-y-3">
                                                                 <div className="flex items-center space-x-3">
                                   <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                     </svg>
                                   </div>
                                   <h4 className="font-bold text-gray-900 text-base">What This Agent Does</h4>
                                 </div>
                                
                                                                 <p className="text-gray-700 text-sm leading-relaxed">
                                   Validates your proposed business actions against your stated business goal, current stage, metrics, and Cross-Agent Analysis insights using GPT-4o. 
                                   Provides alignment scores (High/Medium/Low) and goal-specific improvement recommendations to ensure your decisions are data-driven.
                                 </p>
                                 
                                 <div className="pt-3 border-t border-purple-100">
                                   <p className="text-gray-600 text-sm">
                                     <strong className="text-purple-700">Goal-Aware Validation:</strong> Takes your primary business objective and startup stage into account for contextual recommendations.
                                   </p>
                                 </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
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
                      placeholder="Describe the action you&apos;re considering... (e.g., &apos;Launch a referral program to reduce customer acquisition cost and increase viral growth&apos;)"
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
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-3xl font-bold text-gray-900 group-hover:text-gradient transition-all duration-300">Investor Narrative</h2>
                      <div className="relative">
                        <button
                          onClick={() => setShowNarrativeTooltip(!showNarrativeTooltip)}
                          className={`relative w-10 h-10 bg-gradient-to-br from-green-400 via-green-500 to-teal-600 hover:from-green-500 hover:via-green-600 hover:to-teal-700 border-2 border-white shadow-lg hover:shadow-2xl rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-125 group overflow-hidden ${!showNarrativeTooltip ? 'animate-bounce' : ''}`}
                          title="Learn about narrative generation"
                        >
                          {/* Animated background glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-600 rounded-full animate-pulse opacity-20"></div>
                          
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                          
                          {/* Question mark icon with enhanced design */}
                          <div className="relative z-10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white drop-shadow-sm transition-all duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                            </svg>
                          </div>
                          
                          {/* Pulsing ring effect */}
                          <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping opacity-30"></div>
                        </button>
                        
                        {/* Narrative Tooltip */}
                        {showNarrativeTooltip && (
                          <>
                            <div 
                              className="fixed inset-0 z-[100]" 
                              onClick={() => setShowNarrativeTooltip(false)}
                            />
                            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[110] w-96 bg-white rounded-xl shadow-2xl border border-green-200 p-5 backdrop-blur-sm max-w-[90vw]">
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-green-200 rotate-45"></div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                  </div>
                                  <h4 className="font-bold text-gray-900 text-base">What This Agent Does</h4>
                                </div>
                                
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  Builds your investor story from real validated wins and data points logged through your Growth by Design journey. 
                                  Creates structured narratives showing how you identified problems, tested solutions, and measured impact with concrete results.
                                </p>
                                 
                                <div className="pt-3 border-t border-green-100">
                                                                  <p className="text-gray-600 text-sm">
                                  <strong className="text-green-700">Real Data, Real Story:</strong> &quot;In Q2, we identified unclear messaging (Insight) → tested 3 landing pages → found a message that increased conversions 250% (Validated Result) → proving our repeatable growth process.&quot;
                                </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
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

                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">🚀 Coming Soon</p>
                        <p className="text-sm text-blue-700">
                          The connector ability to import data directly from your CRM, or perform deep research on Google Drive files is coming soon.
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedFile && (
                    <button
                      onClick={() => {
                        console.log('Button clicked!');
                        handleAnalyzeProblem();
                      }}
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

      {/* Customer Interaction Analysis Modal */}
      {showInteractionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Upload Customer Interaction Data</h3>
                <button
                  onClick={() => {
                    setShowInteractionModal(false);
                    setSelectedInteractionFile(null);
                    setInteractionAnalysis('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!interactionAnalysis ? (
                <>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragActiveInteraction ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleInteractionDrag}
                    onDragLeave={handleInteractionDrag}
                    onDragOver={handleInteractionDrag}
                    onDrop={handleInteractionDrop}
                  >
                    <input
                      type="file"
                      id="interaction-file-upload"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleInteractionFileChange}
                    />
                    
                    <label htmlFor="interaction-file-upload" className="cursor-pointer">
                      <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {selectedInteractionFile ? selectedInteractionFile.name : 'Drop your customer interaction file here'}
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to browse (PDF or DOCX)
                      </p>
                    </label>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <p className="font-semibold mb-2">Expected file content:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Zoom or Gong sales call transcripts</li>
                      <li>Customer onboarding call recordings (Chorus/Otter.ai)</li>
                      <li>Support logs from Zendesk or Intercom</li>
                      <li>Sales funnel conversion metrics</li>
                    </ul>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800 mb-1">🎯 Analysis Focus</p>
                        <p className="text-sm text-purple-700">
                          This agent gathers comprehensive data from your uploaded file across critical customer interaction areas to ensure accurate problem framing and identify the real underlying issues affecting your startup's growth.
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedInteractionFile && (
                    <button
                      onClick={handleAnalyzeInteraction}
                      disabled={isAnalyzingInteraction}
                      className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isAnalyzingInteraction ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing Customer Interactions...
                        </span>
                      ) : 'Analyze Customer Interactions'}
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Interaction Analysis</h4>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {interactionAnalysis}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedInteractionFile(null);
                      setInteractionAnalysis('');
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

      {/* Product Analytics Analysis Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Upload Product Analytics Data</h3>
                <button
                  onClick={() => {
                    setShowAnalyticsModal(false);
                    setSelectedAnalyticsFile(null);
                    setAnalyticsAnalysis('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!analyticsAnalysis ? (
                <>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragActiveAnalytics ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleAnalyticsDrag}
                    onDragLeave={handleAnalyticsDrag}
                    onDragOver={handleAnalyticsDrag}
                    onDrop={handleAnalyticsDrop}
                  >
                    <input
                      type="file"
                      id="analytics-file-upload"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleAnalyticsFileChange}
                    />
                    
                    <label htmlFor="analytics-file-upload" className="cursor-pointer">
                      <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {selectedAnalyticsFile ? selectedAnalyticsFile.name : 'Drop your product analytics file here'}
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to browse (PDF or DOCX)
                      </p>
                    </label>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <p className="font-semibold mb-2">Expected file content:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Onboarding funnel data from analytics platforms (Mixpanel, Amplitude)</li>
                      <li>User behavior heatmaps and screen recordings (Hotjar, FullStory)</li>
                      <li>Support logs from Zendesk or Intercom with resolution outcomes</li>
                      <li>Sales funnel conversion metrics</li>
                    </ul>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">📊 Analysis Focus</p>
                        <p className="text-sm text-blue-700">
                          This agent gathers comprehensive data from your uploaded file across critical product analytics areas to ensure accurate problem framing from product analytics data and identify the real underlying issues affecting your startup's product performance.
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedAnalyticsFile && (
                    <button
                      onClick={handleAnalyzeAnalytics}
                      disabled={isAnalyzingAnalytics}
                      className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isAnalyzingAnalytics ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing Product Analytics...
                        </span>
                      ) : 'Analyze Product Analytics'}
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-3">Product Analytics Analysis</h4>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {analyticsAnalysis}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedAnalyticsFile(null);
                      setAnalyticsAnalysis('');
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

      {/* Tutorial Bubble */}
      {showTutorial && (
                  <div className="fixed bottom-24 right-6 z-50 max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 relative">
            {/* Arrow pointing to green button */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900">Analysis Hub</h3>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                aria-label="Close tutorial"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="text-gray-700 text-sm font-medium">Start by uploading your business files to the 3 Analysis Agents below. Once you&apos;ve completed your first analyses, come back here to access:</p>
              
              <div className="space-y-3">
                {/* Overall Insights */}
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Overall Insights</h4>
                    <p className="text-gray-600 text-xs">AI-powered strategic recommendations from all your analyses</p>
                  </div>
                </div>

                {/* Analysis History */}
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Analysis History</h4>
                    <p className="text-gray-600 text-xs">Browse and revisit all your uploaded files and results</p>
                  </div>
                </div>

                {/* Three Agents */}
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-gray-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Advanced Tools</h4>
                    <p className="text-gray-600 text-xs">Export reports, generate narratives, and more</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-700 text-xs text-center font-medium">
                  🚀 Ready to dive deeper? Upload your files to the Problem Framing Agents below first, then click the green button to unlock powerful insights!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
} 