import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { cookies } from 'next/headers';
// We will parse cookies manually from the request headers to avoid type mismatches.
import { UserService } from '@/backend/services/userService';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET ?? 'dev_secret_key';
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jose.jwtVerify(token, secretKey) as { payload: { id: number }};

    const user = await UserService.getUserById(payload.id);
    if (!user) {
      // If the user no longer exists, treat as unauthenticated
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (error: any) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
} 