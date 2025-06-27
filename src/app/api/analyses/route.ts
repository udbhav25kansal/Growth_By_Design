import { NextRequest, NextResponse } from 'next/server'
import { ProblemFramingService } from '../../../backend/services/problemFramingService'
import '../../../backend/database/init' // Ensure database is initialized

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    // Use a default user ID since we removed authentication
    const defaultUserId = 1;

    const analyses = await ProblemFramingService.getAnalysesByUser(defaultUserId)
    
    // Also get sessions for this user
    const sessions = await ProblemFramingService.getSessionsByUser(defaultUserId)

    return NextResponse.json({
      analyses,
      sessions
    })
  } catch (error: any) {
    console.error('Error fetching analyses:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch analyses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, sessionName, analysisId, rating, notes } = body

    // Use a default user ID since we removed authentication
    const defaultUserId = 1;

    if (action === 'create_session') {
      if (!sessionName) {
        return NextResponse.json({ error: 'Session name is required' }, { status: 400 })
      }

      const session = await ProblemFramingService.createSession(defaultUserId, sessionName)
      return NextResponse.json({ session })
    }

    if (action === 'rate_analysis') {
      if (!analysisId || rating === undefined) {
        return NextResponse.json({ error: 'Analysis ID and rating are required' }, { status: 400 })
      }

      await ProblemFramingService.updateAnalysisRating(analysisId, rating, notes)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in analyses POST:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 