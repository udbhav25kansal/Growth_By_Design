import { NextRequest, NextResponse } from 'next/server';

interface ValidationRequest {
  actionText: string;
  metrics: {
    mrr: string;
    churn: string;
    conversion: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { actionText, metrics } = body;

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

    // Build the prompt for OpenAI
    const prompt = `You are a startup coach. Given these metrics: MRR=${metrics.mrr}, churn=${metrics.churn}%, conversion=${metrics.conversion}%, evaluate this proposed action: "${actionText}". Respond with: 1) a one-sentence Alignment verdict (Low/Medium/High), 2) one suggestion to improve it.`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
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