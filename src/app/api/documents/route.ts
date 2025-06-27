import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize database
const dbPath = path.join(process.cwd(), 'growth_by_design.db');
const db = new Database(dbPath);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file || !filename) {
      return NextResponse.json({ error: 'File and filename are required' }, { status: 400 });
    }

    // For now, we'll just return success without storing the file
    // In a production app, you'd save the file to disk or cloud storage
    return NextResponse.json({ 
      id: Date.now(), // temporary ID
      filename,
      message: 'File uploaded successfully' 
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Return empty array since we're not storing files in this simplified version
    return NextResponse.json([]);
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
} 