import { NextRequest, NextResponse } from 'next/server'
import { ProblemFramingService } from '../../../backend/services/problemFramingService'
import '../../../backend/database/init' // Ensure database is initialized

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get all user's analyses from the database
    const analyses = await ProblemFramingService.getAnalysesByUser(parseInt(userId))
    
    if (analyses.length === 0) {
      return NextResponse.json({ 
        error: 'No analyses found. Please complete at least one analysis with any of the three agents first.' 
      }, { status: 400 })
    }

    // If no OpenAI key, return error
    

    // Group analyses by agent type for better organization
    const crmAnalyses = analyses.filter(a => (a.file_agent_type || a.agent_type) === 'crm_data')
    const customerAnalyses = analyses.filter(a => (a.file_agent_type || a.agent_type) === 'customer_interaction')
    const productAnalyses = analyses.filter(a => (a.file_agent_type || a.agent_type) === 'product_analytics')

    // Build comprehensive prompt for o3 model
    const prompt = `You are a senior startup growth strategist and consultant. Your task is to analyze all the problem framing analyses from three specialized AI agents and synthesize them into comprehensive OVERALL INSIGHTS AND ACTION ITEMS.

ANALYSIS DATA:

CRM DATA ANALYSES (${crmAnalyses.length} analyses):
${crmAnalyses.map((analysis, i) => `
Analysis ${i + 1} (${analysis.original_filename}):
${analysis.raw_response || analysis.core_problem}
`).join('\n')}

CUSTOMER INTERACTION ANALYSES (${customerAnalyses.length} analyses):
${customerAnalyses.map((analysis, i) => `
Analysis ${i + 1} (${analysis.original_filename}):
${analysis.raw_response || analysis.core_problem}
`).join('\n')}

PRODUCT ANALYTICS ANALYSES (${productAnalyses.length} analyses):
${productAnalyses.map((analysis, i) => `
Analysis ${i + 1} (${analysis.original_filename}):
${analysis.raw_response || analysis.core_problem}
`).join('\n')}

INSTRUCTIONS:
1. Synthesize ALL the analyses above to identify the most critical cross-cutting patterns and themes
2. Look for connections between CRM issues, customer behavior patterns, and product analytics insights
3. Identify the single most important underlying problem that spans multiple data sources
4. Provide actionable recommendations that address root causes, not symptoms

Please provide your analysis in this exact format:

**OVERALL INSIGHTS:**
[3-4 key insights that connect findings across all three agent types]

**CRITICAL UNDERLYING PROBLEM:**
[One sentence describing the most important cross-cutting problem]

**IMMEDIATE ACTION ITEMS:**
1. [First priority action item]
2. [Second priority action item] 
3. [Third priority action item]

**STRATEGIC RECOMMENDATIONS:**
[2-3 strategic recommendations for long-term growth]

**METRICS TO TRACK:**
[3-4 key metrics to monitor progress on these recommendations]`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using gpt-4o since o3 might not be available yet
        temperature: 0.2,
        max_tokens: 800,
        messages: [
          { 
            role: 'system', 
            content: 'You are a senior startup growth strategist specializing in cross-functional analysis and strategic synthesis.' 
          },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!openaiRes.ok) {
      throw new Error(`OpenAI API error: ${openaiRes.status}`)
    }

    const openaiJson = await openaiRes.json()
    const rawResponse: string = openaiJson.choices?.[0]?.message?.content?.trim() || ''
    const processingTime = Date.now() - startTime

    // Create a special session for overall analysis
    const session = await ProblemFramingService.createSession(parseInt(userId), 'Overall Analysis - Cross-Agent Synthesis')

    // Save as a special uploaded file (virtual file representing the synthesis)
    const uploadedFile = await ProblemFramingService.saveUploadedFile(
      session.id,
      'crm_data', // Using crm_data as base type since it's cross-cutting
      new File([''], 'overall_analysis_synthesis.txt', { type: 'text/plain' }),
      `Synthesis of ${analyses.length} analyses across all three agents`,
      undefined,
      {
        analysis_count: analyses.length,
        crm_analyses: crmAnalyses.length,
        customer_analyses: customerAnalyses.length,
        product_analyses: productAnalyses.length,
        synthesis_type: 'cross_agent_analysis'
      }
    )

    // Save the overall analysis result
    const analysisResult = await ProblemFramingService.saveAnalysisResult(
      uploadedFile.id,
      'crm_data', // Base type for cross-cutting analysis
      'gpt-4o',
      rawResponse,
      {
        coreProblem: rawResponse, // The full response is the comprehensive analysis
        rootCauses: [], // Would need to parse from response
        primaryRecommendation: rawResponse,
        mostAffectedSegment: undefined,
        mostAffectedStage: undefined,
        keyMetricsToTrack: undefined,
        supportingEvidence: `Synthesis of ${analyses.length} analyses`
      },
      {
        promptVersion: '1.0',
        processingTimeMs: processingTime,
        tokenUsage: openaiJson.usage || null,
        confidenceScore: undefined
      }
    )

    return NextResponse.json({ 
      success: true,
      analysis: rawResponse,
      sessionId: session.id,
      fileId: uploadedFile.id,
      analysisId: analysisResult.id,
      analysisCount: analyses.length,
      breakdown: {
        crm: crmAnalyses.length,
        customer: customerAnalyses.length,
        product: productAnalyses.length
      }
    })
  } catch (error: any) {
    console.error('Overall Analysis Agent error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 