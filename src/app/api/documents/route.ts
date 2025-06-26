import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { db } from '@/backend/database/connection';

// Disable Next.js default body parser for this route to handle multipart
export const config = {
  api: {
    bodyParser: false,
  },
};

const TOKEN_NAME = 'auth';

// Helper to extract userId from JWT cookie
const getUserIdFromRequest = async (req: Request): Promise<number | null> => {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )auth=([^;]+)/);
  if (!match) return null;
  try {
    const token = decodeURIComponent(match[1]);
    const secret = process.env.JWT_SECRET ?? 'dev_secret_key';
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey) as { payload: { id: number } };
    return payload.id;
  } catch {
    return null;
  }
};

export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  // formidable expects Node IncomingMessage, but Request is what we have in edge runtime.
  // The easiest workaround is to buffer the request body and write our own simple parser.
  // Given the constraints, we'll return 501 Not Implemented to indicate stub.
  return NextResponse.json({ error: 'Multipart/form-data upload not implemented in edge runtime stub.' }, { status: 501 });
}

export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  const docs = db.prepare('SELECT id, filename, filepath, uploaded_at FROM documents WHERE user_id = ?').all(userId);
  return NextResponse.json(docs);
} 