import { NextRequest, NextResponse } from 'next/server'
import { ProblemFramingService } from '../../../backend/services/problemFramingService'
import '../../../backend/database/init' // Ensure database is initialized

// Ensure this route runs on the Node.js runtime so we can use full Node APIs
export const runtime = 'nodejs'

// Dynamically import heavy parsing libraries only when needed to keep cold starts fast
async function extractTextFromFile(filename: string, buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text || ''
  }

  if (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.endsWith('.docx')
  ) {
    const mammoth = await import('mammoth')
    const { value } = await mammoth.extractRawText({ buffer })
    return value || ''
  }

  throw new Error('Unsupported file type')
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null
    const sessionId = formData.get('sessionId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded (expected field "file")' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text from the uploaded document
    const extractedText = await extractTextFromFile(file.name, buffer, file.type)

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'Unable to extract text from document' }, { status: 422 })
    }

    // Create or get session
    let currentSessionId = sessionId ? parseInt(sessionId) : null
    if (!currentSessionId) {
      const session = await ProblemFramingService.createSession(parseInt(userId), 'Customer Interaction Analysis')
      currentSessionId = session.id
    }

    // Save uploaded file to database
    const uploadedFile = await ProblemFramingService.saveUploadedFile(
      currentSessionId,
      'customer_interaction',
      file,
      extractedText,
      undefined, // file_path - we're not storing files physically for now
      {
        extraction_method: file.type.includes('pdf') ? 'pdf-parse' : 'mammoth',
        file_hash: Buffer.from(arrayBuffer).toString('base64').slice(0, 32) // Simple hash for deduplication
      }
    )



    // Build the prompt for OpenAI to analyze customer interaction patterns
    const prompt = `You are a senior customer success consultant specializing in SaaS growth. Your task is to identify the REAL underlying problems revealed in customer interaction data.

Instructions:
1. Carefully analyze the customer interaction data below (call transcripts, support tickets, onboarding feedback, churn interviews).
2. Identify behavior patterns and pain points that reveal deeper systemic issues.
3. Focus on finding the root cause problems, not just surface-level complaints.

Please provide your analysis in this exact format:

**CORE PROBLEM:**
[One clear sentence describing the most critical underlying problem]

**ROOT CAUSES:**
• [First root cause]
• [Second root cause] 
• [Third root cause]

**PRIMARY RECOMMENDATION:**
[One specific, actionable recommendation to address the biggest root cause]

**MOST AFFECTED SEGMENT:**
[Which customer segment/persona is most impacted by this problem]

**SUPPORTING EVIDENCE:**
[Key quotes, patterns, or data points that support your analysis]

CUSTOMER INTERACTION DATA BEGIN
${extractedText}
CUSTOMER INTERACTION DATA END`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        temperature: 0.3,
        max_tokens: 500,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
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

    // Parse the structured response (this prompt returns markdown format, not JSON)
    const parsedAnalysis = ProblemFramingService.parseStructuredResponse(rawResponse, 'customer_interaction')

    // Save AI analysis to database
    const analysisResult = await ProblemFramingService.saveAnalysisResult(
      uploadedFile.id,
      'customer_interaction',
      'gpt-4',
      rawResponse,
      {
        coreProblem: parsedAnalysis.coreProblem || rawResponse,
        rootCauses: parsedAnalysis.rootCauses || [],
        primaryRecommendation: parsedAnalysis.primaryRecommendation,
        mostAffectedSegment: parsedAnalysis.mostAffectedSegment,
        mostAffectedStage: undefined, // Not specifically tracked in customer interaction
        keyMetricsToTrack: undefined, // Not specified in this prompt format
        supportingEvidence: parsedAnalysis.supportingEvidence
      },
      {
        promptVersion: '1.0',
        processingTimeMs: processingTime,
        tokenUsage: openaiJson.usage || null,
        confidenceScore: undefined
      }
    )

    return NextResponse.json({ 
      analysis: rawResponse,
      sessionId: currentSessionId,
      fileId: uploadedFile.id,
      analysisId: analysisResult.id
    })
  } catch (error: any) {
    console.error('Customer Interaction Agent error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 