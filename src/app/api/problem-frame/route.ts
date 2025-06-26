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
      const session = await ProblemFramingService.createSession(parseInt(userId), 'CRM Data Analysis')
      currentSessionId = session.id
    }

    // Save uploaded file to database
    const uploadedFile = await ProblemFramingService.saveUploadedFile(
      currentSessionId,
      'crm_data',
      file,
      extractedText,
      undefined, // file_path - we're not storing files physically for now
      {
        extraction_method: file.type.includes('pdf') ? 'pdf-parse' : 'mammoth',
        file_hash: Buffer.from(arrayBuffer).toString('base64').slice(0, 32) // Simple hash for deduplication
      }
    )

    // If no OpenAI key, return the raw extracted text so frontend can still show something useful
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        analysis: 'OPENAI_API_KEY not configured – returning extracted text only',
        extractedText
      })
    }

    // Build the prompt for OpenAI to frame the real problem
    const prompt = `You are a senior SaaS growth consultant. Your task is to identify the REAL underlying problems revealed in the startup's CRM data.

Instructions:
1. Carefully review the CRM excerpts below (deal win/loss, lost reasons, funnel metrics).
2. Synthesize the evidence to articulate the single most critical underlying problem in one concise sentence.
3. List the top three root causes contributing to this problem (bullet format).
4. Provide one actionable recommendation to address the biggest root cause.

CRM DATA BEGIN
${extractedText}
CRM DATA END`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.3,
        max_tokens: 400,
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

    // Save AI analysis to database
    const analysisResult = await ProblemFramingService.saveAnalysisResult(
      uploadedFile.id,
      'crm_data',
      'gpt-4o',
      rawResponse,
      {
        coreProblem: rawResponse, // For CRM data, the whole response is the core problem analysis
        rootCauses: [], // Would need to parse from response
        primaryRecommendation: rawResponse, // Would need to parse from response
        mostAffectedSegment: undefined, // Not applicable for CRM data
        mostAffectedStage: undefined, // Not applicable for CRM data
        keyMetricsToTrack: undefined, // Not specified in this prompt
        supportingEvidence: undefined // Not structured in this prompt
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
    console.error('Problem Frame Agent error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 