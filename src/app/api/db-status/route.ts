import { NextResponse } from 'next/server';
import { db, queries } from '@/backend/database/connection';

export async function GET() {
  try {
    // Get table counts to verify database is working
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const metricCount = db.prepare('SELECT COUNT(*) as count FROM metrics').get() as { count: number };
    const checkCount = db.prepare('SELECT COUNT(*) as count FROM checks').get() as { count: number };
    const migrationCount = db.prepare('SELECT COUNT(*) as count FROM migrations').get() as { count: number };

    // Get list of executed migrations
    const migrations = db.prepare('SELECT name, executed_at FROM migrations ORDER BY executed_at').all();

    return NextResponse.json({
      status: 'success',
      message: 'Database is operational',
      stats: {
        users: userCount.count,
        metrics: metricCount.count,
        checks: checkCount.count,
        migrations: migrationCount.count
      },
      migrations,
      database_path: 'metrics.db'
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 