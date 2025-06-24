import { NextRequest, NextResponse } from 'next/server'

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
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded (expected field "file")' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text from the uploaded document
    const extractedText = await extractTextFromFile(file.name, buffer, file.type)

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'Unable to extract text from document' }, { status: 422 })
    }

    // If no OpenAI key, return the raw extracted text so frontend can still show something useful
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        problem: 'OPENAI_API_KEY not configured – returning extracted text only',
        extractedText,
      })
    }

    // Build the prompt for OpenAI to frame the real problem
    const prompt = `You are a senior SaaS growth consultant. Your task is to identify the REAL underlying problems revealed in the startup\'s CRM data.\n\nInstructions:\n1. Carefully review the CRM excerpts below (deal win/loss, lost reasons, funnel metrics).\n2. Synthesize the evidence to articulate the single most critical underlying problem in one concise sentence.\n3. List the top three root causes contributing to this problem (bullet format).\n4. Provide one actionable recommendation to address the biggest root cause.\n\nCRM DATA BEGIN\n${extractedText}\nCRM DATA END`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
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
    const content: string = openaiJson.choices?.[0]?.message?.content?.trim() || ''

    return NextResponse.json({ analysis: content })
  } catch (error: any) {
    console.error('Problem Frame Agent error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 