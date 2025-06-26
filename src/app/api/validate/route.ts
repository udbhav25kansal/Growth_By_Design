import { NextRequest, NextResponse } from 'next/server';

interface ValidationRequest {
  actionText: string;
  metrics: {
    mrr: string;
    churn: string;
    conversion: string;
  };
  goal?: string;
  stage?: string;
  overallAnalysis?: string;
  analyses?: any[];
}

export const runtime = 'nodejs';

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Explicitly handle GET requests with proper error
export async function GET(req: NextRequest) {
  console.log('GET request received on /api/validate - this method is not allowed');
  return NextResponse.json(
    { error: 'Method GET not allowed. This endpoint only accepts POST requests with JSON data.' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

// Explicitly handle PUT requests with proper error
export async function PUT(req: NextRequest) {
  console.log('PUT request received on /api/validate - this method is not allowed');
  return NextResponse.json(
    { error: 'Method PUT not allowed. This endpoint only accepts POST requests with JSON data.' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

// Explicitly handle DELETE requests with proper error
export async function DELETE(req: NextRequest) {
  console.log('DELETE request received on /api/validate - this method is not allowed');
  return NextResponse.json(
    { error: 'Method DELETE not allowed. This endpoint only accepts POST requests with JSON data.' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { actionText, metrics, goal, stage, overallAnalysis, analyses } = body;

    if (!actionText || !metrics) {
      return NextResponse.json(
        { error: 'Missing actionText or metrics' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock response if no API key
      const mockAlignment = parseFloat(metrics.churn) > 30 ? 'Low' : 
                           parseFloat(metrics.conversion) > 15 ? 'High' : 'Medium';
      
      const mockSuggestion = `Based on your ${metrics.churn}% churn rate and ${metrics.conversion}% conversion, consider focusing on customer retention strategies.`;

      return NextResponse.json({
        alignment: mockAlignment,
        suggestion: mockSuggestion
      });
    }

    // Build the expert-level prompt for OpenAI with comprehensive context
    const goalContext = goal ? ` Their primary business goal is: "${goal}".` : '';
    const stageContext = stage ? ` They are a ${stage}-stage startup.` : '';
    
    // Build analysis context
    let analysisContext = '';
    if (overallAnalysis) {
      analysisContext = `\n\nDEEP ANALYSIS INSIGHTS:\n${overallAnalysis}`;
    } else if (analyses && analyses.length > 0) {
      const recentAnalyses = analyses.slice(0, 3).map((analysis, index) => 
        `${index + 1}. ${analysis.agent_type}: ${analysis.analysis?.substring(0, 300)}...`
      ).join('\n');
      analysisContext = `\n\nRECENT ANALYSIS INSIGHTS:\n${recentAnalyses}`;
    }
    
    const prompt = `You are a senior startup coach and Go-To-Market engineer with 15+ years of experience scaling SaaS companies from seed to IPO.${stageContext}${goalContext}

CURRENT METRICS ANALYSIS:
- Monthly Recurring Revenue: $${metrics.mrr}
- Churn Rate: ${metrics.churn}%
- Conversion Rate: ${metrics.conversion}%${analysisContext}

PROPOSED ACTION TO EVALUATE:
"${actionText}"

EXPERT VALIDATION FRAMEWORK:
Analyze this action through multiple strategic lenses, leveraging the deep analysis insights provided:

1. GOAL ALIGNMENT: How well does this action directly support their stated business objective?
2. STAGE APPROPRIATENESS: Is this the right move for their current funding/growth stage?
3. METRIC IMPACT: Will this action positively influence their key metrics (MRR growth, churn reduction, conversion improvement)?
4. ANALYSIS ALIGNMENT: How well does this action address the specific problems and opportunities identified in their analysis data?
5. RESOURCE EFFICIENCY: Does this action provide the highest ROI given their likely resource constraints?
6. EXECUTION COMPLEXITY: Can they realistically execute this well with their current capabilities?
7. STRATEGIC PRIORITY: Based on the analysis insights, is this the most important action they should take right now?

RESPONSE FORMAT:
1) ALIGNMENT VERDICT: [High/Medium/Low] - One sentence explaining the strategic alignment score
2) EXPERT RECOMMENDATION: Provide a specific, actionable improvement that leverages GTM best practices and addresses the biggest strategic gap in their proposed action`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const response = openaiData.choices[0]?.message?.content?.trim();

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response to extract alignment and suggestion
    const lines = response.split(/\d\)\s*/);
    
    let alignment = 'Medium';
    let suggestion = 'Consider reviewing your strategy based on current metrics.';

    if (lines.length >= 3) {
      const alignmentLine = lines[1]?.trim();
      if (alignmentLine.toLowerCase().includes('high')) alignment = 'High';
      else if (alignmentLine.toLowerCase().includes('low')) alignment = 'Low';
      else if (alignmentLine.toLowerCase().includes('medium')) alignment = 'Medium';

      suggestion = lines[2]?.trim() || suggestion;
    } else {
      // Fallback parsing if format is different
      if (response.toLowerCase().includes('high')) alignment = 'High';
      else if (response.toLowerCase().includes('low')) alignment = 'Low';
      
      // Use the whole response as suggestion if parsing fails
      suggestion = response;
    }

    return NextResponse.json({
      alignment,
      suggestion
    });

  } catch (error) {
    console.error('Validation error:', error);
    
    // Return a fallback response on error
    const { metrics } = await request.json();
    const fallbackAlignment = parseFloat(metrics.churn) > 30 ? 'Low' : 
                             parseFloat(metrics.conversion) > 15 ? 'High' : 'Medium';
    
    return NextResponse.json({
      alignment: fallbackAlignment,
      suggestion: 'Unable to connect to AI service. Please try again later.'
    });
  }
} 