import { NextRequest, NextResponse } from 'next/server'
import { ProblemFramingService } from '../../../backend/services/problemFramingService'
import '../../../backend/database/init' // Ensure database is initialized

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's analysis history
    const analyses = await ProblemFramingService.getAnalysesByUser(parseInt(userId))
    
    // Get user's sessions for additional context
    const sessions = await ProblemFramingService.getSessionsByUser(parseInt(userId))

    return NextResponse.json({
      success: true,
      analyses,
      sessions,
      total: analyses.length
    })
  } catch (error: any) {
    console.error('Error fetching user analyses:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, userId, sessionName, analysisId, rating, notes } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    switch (action) {
      case 'create-session':
        // Create a new session
        const session = await ProblemFramingService.createSession(parseInt(userId), sessionName)
        return NextResponse.json({ session })

      case 'rate-analysis':
        // Rate an analysis
        if (!analysisId || !rating) {
          return NextResponse.json({ error: 'Analysis ID and rating are required' }, { status: 400 })
        }
        await ProblemFramingService.updateAnalysisRating(parseInt(analysisId), parseInt(rating), notes)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error processing analyses request:', error)
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 })
  }
} 